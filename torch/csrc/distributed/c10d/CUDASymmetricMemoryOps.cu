#include <ATen/ATen.h>
#include <ATen/ceil_div.h>
#include <ATen/cuda/CUDAContext.h>
#include <c10/cuda/CUDAGuard.h>
#include <torch/library.h>

#if !defined(USE_ROCM) && defined(PYTORCH_C10_DRIVER_API_SUPPORTED)
#include <c10/cuda/driver_api.h>
#endif

#if defined(CUDART_VERSION) && CUDART_VERSION >= 12030

#ifndef AT_PER_OPERATOR_HEADERS
#include <ATen/Functions.h>
#include <ATen/NativeFunctions.h>
#else
#include <ATen/ops/empty_like.h>
#endif

#include <torch/csrc/distributed/c10d/CUDASymmetricMemory-inl.h>
#include <torch/csrc/distributed/c10d/CUDASymmetricMemory.hpp>
#include <torch/csrc/distributed/c10d/cuda/AsyncMM.cuh>

#define INT_SWITCH_CASE(name, val, ...) \
  case val: {                           \
    constexpr int name = val;           \
    __VA_ARGS__();                      \
    break;                              \
  }

#define DISPATCH_WORLD_SIZES(world_size, ...)      \
  switch (world_size) {                            \
    INT_SWITCH_CASE(k_world_size, 8, __VA_ARGS__); \
    INT_SWITCH_CASE(k_world_size, 4, __VA_ARGS__); \
    INT_SWITCH_CASE(k_world_size, 2, __VA_ARGS__); \
    default: {                                     \
      constexpr int k_world_size = -1;             \
      __VA_ARGS__();                               \
    }                                              \
  }

#define DISPATCH_WORLD_SIZES_NO_DEFAULT(world_size, ...)                 \
  switch (world_size) {                                                  \
    INT_SWITCH_CASE(k_world_size, 8, __VA_ARGS__);                       \
    INT_SWITCH_CASE(k_world_size, 4, __VA_ARGS__);                       \
    INT_SWITCH_CASE(k_world_size, 2, __VA_ARGS__);                       \
    default: {                                                           \
      TORCH_CHECK(false, "Not implemented for world_size=", world_size); \
    }                                                                    \
  }

#define DISPATCH_ALIGNMENTS_16_8_4(alignment, ...)                    \
  switch (alignment) {                                                \
    INT_SWITCH_CASE(k_alignment, 16, __VA_ARGS__);                    \
    INT_SWITCH_CASE(k_alignment, 8, __VA_ARGS__);                     \
    INT_SWITCH_CASE(k_alignment, 4, __VA_ARGS__);                     \
    default: {                                                        \
      TORCH_CHECK(false, "Not implemented for aligment=", alignment); \
    }                                                                 \
  }

#define AT_DISPATCH_FLOAT_AND_BFLOAT16(scalar_type, name, ...)         \
  AT_DISPATCH_SWITCH(                                                  \
      scalar_type, name, AT_DISPATCH_CASE(at::kBFloat16, __VA_ARGS__); \
      AT_DISPATCH_CASE(at::kFloat, __VA_ARGS__));

namespace {

using namespace c10d::symmetric_memory;

size_t get_and_verify_alignment(const at::Tensor& input, const char* op_name) {
  const size_t min_alignment = std::max(4l, input.element_size());
  // Only check the offset since the multicast address is always at least
  // 128-bit aligned
  const size_t ptr_alignment = get_alignment(
      static_cast<size_t>(input.storage_offset() * input.element_size()));
  TORCH_CHECK(
      ptr_alignment >= min_alignment,
      op_name,
      "<",
      input.scalar_type(),
      ">: input ptr + offset must be at least ",
      min_alignment,
      "-byte aligned.");

  const size_t size_alignment =
      get_alignment(static_cast<size_t>(input.numel() * input.element_size()));
  TORCH_CHECK(
      size_alignment >= min_alignment,
      op_name,
      "<",
      input.scalar_type(),
      ">: input size must be at least ",
      min_alignment,
      "-byte aligned.");
  return std::min(ptr_alignment, size_alignment);
}

void init_elementwise_launch_config(
    size_t numel,
    size_t element_size,
    size_t alignment,
    size_t splits,
    size_t max_num_blocks,
    size_t max_num_threads,
    int& num_blocks,
    int& num_threads) {
  // Align to preserve alignment in each split
  const size_t aligned_numel = at::round_up(numel, alignment * splits);
  const size_t numel_per_split = aligned_numel / splits;
  const size_t numel_per_thread = alignment / element_size;

  if (numel_per_split <= max_num_threads * numel_per_thread) {
    num_blocks = 1;
    num_threads = at::round_up(
        at::ceil_div(numel_per_split, numel_per_thread),
        static_cast<size_t>(C10_WARP_SIZE));
  } else {
    num_blocks = std::min(
        at::ceil_div(numel_per_split, max_num_threads * numel_per_thread),
        max_num_blocks);
    num_threads = max_num_threads;
  }
}

template <typename T, int alignment>
static __global__ void multimem_all_reduce_kernel(
    T* input_mc_ptr,
    size_t numel,
    uint32_t** signal_pads,
    size_t rank,
    size_t world_size) {
  static_assert(alignment % sizeof(T) == 0);
  constexpr size_t numel_per_thread = alignment / sizeof(T);

  sync_remote_blocks<std::memory_order_relaxed>(signal_pads, rank, world_size);
  __syncthreads();

  const size_t numel_per_rank =
      at::round_up(numel, alignment * world_size) / world_size;
  const size_t start = numel_per_rank * rank;

  auto offset = (blockDim.x * blockIdx.x + threadIdx.x) * numel_per_thread;
  auto stride = blockDim.x * gridDim.x * numel_per_thread;
  for (size_t i = offset; i < numel_per_rank; i += stride) {
    if (start + i >= numel) {
      continue;
    }
    auto vec = multimem_ld_reduce_add<alignment>(input_mc_ptr + start + i);
    multimem_st<alignment>(input_mc_ptr + start + i, vec);
  }

  __syncthreads();
  sync_remote_blocks<std::memory_order_acq_rel>(signal_pads, rank, world_size);
}

at::Tensor multimem_all_reduce_(
    const at::Tensor& input,
    std::string reduce_op,
    std::string group_name) {
  TORCH_CHECK(
      input.is_contiguous(), "multimem_all_reduce_: input must be contiguous.");
  TORCH_CHECK(
      reduce_op == "sum",
      "multimem_all_reduce_: only sum is supported for now.");

  auto symm_mem = c10d::symmetric_memory::rendezvous(input, group_name);
  TORCH_CHECK(
      symm_mem != nullptr,
      "multimem_all_reduce_: input must be allocated with empty_strided_p2p().");
  TORCH_CHECK(
      symm_mem->has_multicast_support(),
      "multimem_all_reduce_: multicast support is required.");

  const size_t alignment =
      get_and_verify_alignment(input, "multimem_all_reduce_");

  int num_blocks = 0, num_threads = 0;
  init_elementwise_launch_config(
      input.numel(),
      input.element_size(),
      alignment,
      symm_mem->get_world_size(),
      8,
      1024,
      num_blocks,
      num_threads);

  AT_DISPATCH_FLOAT_AND_BFLOAT16(
      input.scalar_type(), "multimem_all_reduce_", [&]() {
        DISPATCH_ALIGNMENTS_16_8_4(alignment, [&]() {
          multimem_all_reduce_kernel<scalar_t, k_alignment>
              <<<num_blocks,
                 num_threads,
                 0,
                 at::cuda::getCurrentCUDAStream()>>>(
                  reinterpret_cast<scalar_t*>(symm_mem->get_multicast_ptr()) +
                      input.storage_offset(),
                  input.numel(),
                  reinterpret_cast<uint32_t**>(
                      symm_mem->get_signal_pad_ptrs_dev()),
                  symm_mem->get_rank(),
                  symm_mem->get_world_size());
          C10_CUDA_KERNEL_LAUNCH_CHECK();
        });
      });
  return input;
}

template <typename T, int alignment>
static __global__ void multimem_one_shot_all_reduce_kernel(
    T* input_mc_ptr,
    T* output_ptr,
    size_t numel,
    uint32_t** signal_pads,
    size_t rank,
    size_t world_size) {
  static_assert(alignment % sizeof(T) == 0);
  constexpr size_t numel_per_thread = alignment / sizeof(T);

  sync_remote_blocks<std::memory_order_relaxed>(signal_pads, rank, world_size);
  __syncthreads();

  auto offset = (blockDim.x * blockIdx.x + threadIdx.x) * numel_per_thread;
  auto stride = blockDim.x * gridDim.x * numel_per_thread;
  for (size_t i = offset; i < numel; i += stride) {
    auto vec = multimem_ld_reduce_add<alignment>(input_mc_ptr + i);
    st_vec<alignment>(output_ptr + i, vec);
  }

  __syncthreads();
  sync_remote_blocks<std::memory_order_relaxed>(signal_pads, rank, world_size);
}

at::Tensor multimem_one_shot_all_reduce_out(
    const at::Tensor& input,
    std::string reduce_op,
    std::string group_name,
    at::Tensor out) {
  TORCH_CHECK(
      input.is_contiguous(),
      "multimem_one_shot_all_reduce: input must be contiguous.");
  TORCH_CHECK(
      out.is_contiguous(),
      "multimem_one_shot_all_reduce: output must be contiguous.");
  TORCH_CHECK(
      out.sizes() == input.sizes(),
      "multimem_one_shot_all_reduce: input/output size mismatch.");
  TORCH_CHECK(
      reduce_op == "sum",
      "multimem_one_shot_all_reduce: only sum is supported for now.");

  auto symm_mem = c10d::symmetric_memory::rendezvous(input, group_name);
  TORCH_CHECK(
      symm_mem != nullptr,
      "multimem_one_shot_all_reduce: input must be allocated with empty_strided_p2p().");
  TORCH_CHECK(
      symm_mem->has_multicast_support(),
      "multimem_one_shot_all_reduce: requires multicast support.");

  const size_t alignment =
      get_and_verify_alignment(input, "multimem_one_shot_all_reduce");

  int num_blocks = 0, num_threads = 0;
  init_elementwise_launch_config(
      input.numel(),
      input.element_size(),
      alignment,
      1,
      8,
      1024,
      num_blocks,
      num_threads);

  AT_DISPATCH_FLOAT_AND_BFLOAT16(
      input.scalar_type(), "multimem_one_shot_all_reduce", [&]() {
        DISPATCH_ALIGNMENTS_16_8_4(alignment, [&]() {
          multimem_one_shot_all_reduce_kernel<scalar_t, k_alignment>
              <<<num_blocks,
                 num_threads,
                 0,
                 at::cuda::getCurrentCUDAStream()>>>(
                  reinterpret_cast<scalar_t*>(symm_mem->get_multicast_ptr()) +
                      input.storage_offset(),
                  out.data_ptr<scalar_t>(),
                  input.numel(),
                  reinterpret_cast<uint32_t**>(
                      symm_mem->get_signal_pad_ptrs_dev()),
                  symm_mem->get_rank(),
                  symm_mem->get_world_size());
          C10_CUDA_KERNEL_LAUNCH_CHECK();
        });
      });
  return out;
}

at::Tensor multimem_one_shot_all_reduce(
    const at::Tensor& input,
    std::string reduce_op,
    std::string group_name) {
  auto out = at::empty_like(input);
  return multimem_one_shot_all_reduce_out(input, reduce_op, group_name, out);
}

template <int alignment>
static __global__ void multimem_all_gather_kernel(
    char* input_ptr,
    char* output_mc_ptr,
    size_t bytes_per_rank,
    uint32_t** signal_pads,
    size_t rank,
    size_t world_size) {
  sync_remote_blocks<std::memory_order_relaxed>(signal_pads, rank, world_size);
  __syncthreads();

  const size_t start = bytes_per_rank * rank;

  auto offset = (blockDim.x * blockIdx.x + threadIdx.x) * alignment;
  auto stride = blockDim.x * gridDim.x * alignment;
  for (size_t i = offset; i < bytes_per_rank; i += stride) {
    auto vec = ld_vec<alignment>(input_ptr + i);
    multimem_st<alignment>(output_mc_ptr + start + i, vec);
  }

  __syncthreads();
  sync_remote_blocks<std::memory_order_acq_rel>(signal_pads, rank, world_size);
}

at::Tensor multimem_all_gather_out(
    const at::Tensor& input,
    std::string group_name,
    at::Tensor out) {
  auto symm_mem = c10d::symmetric_memory::rendezvous(out, group_name);
  TORCH_CHECK(
      symm_mem != nullptr,
      "multimem_all_gather_out: output must be allocated with empty_strided_p2p().");
  TORCH_CHECK(
      symm_mem->has_multicast_support(),
      "multimem_all_gather_out: output must have multicast support.");

  TORCH_CHECK(
      input.is_contiguous(),
      "multimem_all_gather_out: input must be contiguous.");
  TORCH_CHECK(
      out.is_contiguous(),
      "multimem_all_gather_out: output must be contiguous.");

  TORCH_CHECK(
      input.dim() == out.dim(),
      "multimem_all_gather_out: input/output dimension mismatch.");

  TORCH_CHECK(
      out.sizes()[0] == input.sizes()[0] * symm_mem->get_world_size(),
      "multimem_all_gather_out: out.sizes()[0] must be equal to input.sizes[0] * world_size. (out.sizes():",
      out.sizes(),
      ", input.sizes(): ",
      input.sizes(),
      ", world_size: ",
      symm_mem->get_world_size(),
      ")");

  for (auto d = 1; d < input.dim(); ++d) {
    TORCH_CHECK(
        out.sizes()[d] == input.sizes()[d],
        "multimem_all_gather_out: all non-0th dimension of input and output must match.");
  }

  const size_t alignment =
      get_and_verify_alignment(out, "multimem_all_gather_out");

  int num_blocks = 0, num_threads = 0;
  init_elementwise_launch_config(
      input.numel() * input.element_size(),
      1,
      alignment,
      1,
      8,
      1024,
      num_blocks,
      num_threads);

  DISPATCH_ALIGNMENTS_16_8_4(alignment, [&]() {
    multimem_all_gather_kernel<k_alignment>
        <<<num_blocks, num_threads, 0, at::cuda::getCurrentCUDAStream()>>>(
            static_cast<char*>(input.data_ptr()),
            reinterpret_cast<char*>(symm_mem->get_multicast_ptr()) +
                out.storage_offset() * out.element_size(),
            input.numel() * input.element_size(),
            reinterpret_cast<uint32_t**>(symm_mem->get_signal_pad_ptrs_dev()),
            symm_mem->get_rank(),
            symm_mem->get_world_size());
    C10_CUDA_KERNEL_LAUNCH_CHECK();
  });
  return out;
}

// One-shot all-reduce is register-intensive because it stages values loaded
// from peers in registers before performing reduction. Setting the thread
// count to 512 to prevent/alleviate register spill.
constexpr size_t one_shot_all_reduce_max_num_blocks = 8;
constexpr size_t one_shot_all_reduce_max_num_threads = 512;

template <typename T, int alignment, int k_world_size>
static __launch_bounds__(one_shot_all_reduce_max_num_threads) __global__
    void one_shot_all_reduce_kernel(
        T** input_ptrs,
        T* output_ptr,
        size_t input_offset,
        size_t numel,
        uint32_t** signal_pads,
        size_t rank,
        size_t world_size) {
  static_assert(alignment % sizeof(T) == 0);
  constexpr size_t numel_per_thread = alignment / sizeof(T);

  sync_remote_blocks<std::memory_order_relaxed>(signal_pads, rank, world_size);
  __syncthreads();

  auto offset = (blockDim.x * blockIdx.x + threadIdx.x) * numel_per_thread;
  auto stride = blockDim.x * gridDim.x * numel_per_thread;

  for (size_t i = offset; i < numel; i += stride) {
    auto vec = load_and_reduce<T, alignment, k_world_size>(
        input_ptrs, rank, world_size, input_offset + i);
    st_vec<alignment>(output_ptr + i, vec);
  }

  __syncthreads();
  sync_remote_blocks<std::memory_order_relaxed>(signal_pads, rank, world_size);
}

at::Tensor one_shot_all_reduce_out(
    const at::Tensor& input,
    std::string reduce_op,
    std::string group_name,
    at::Tensor out) {
  TORCH_CHECK(
      input.is_contiguous(), "one_shot_all_reduce: input must be contiguous.");
  TORCH_CHECK(
      out.is_contiguous(), "one_shot_all_reduce: output must be contiguous.");
  TORCH_CHECK(
      out.sizes() == input.sizes(),
      "one_shot_all_reduce: input/output size mismatch.");
  TORCH_CHECK(
      reduce_op == "sum",
      "one_shot_all_reduce: only sum is supported for now.");

  auto symm_mem = c10d::symmetric_memory::rendezvous(input, group_name);
  TORCH_CHECK(
      symm_mem != nullptr,
      "one_shot_all_reduce: input must be allocated with empty_strided_p2p().");

  const size_t alignment =
      get_and_verify_alignment(input, "one_shot_all_reduce");

  int num_blocks = 0, num_threads = 0;
  init_elementwise_launch_config(
      input.numel(),
      input.element_size(),
      alignment,
      1,
      one_shot_all_reduce_max_num_blocks,
      one_shot_all_reduce_max_num_threads,
      num_blocks,
      num_threads);

  AT_DISPATCH_FLOAT_AND_BFLOAT16(
      input.scalar_type(), "one_shot_all_reduce", [&]() {
        DISPATCH_ALIGNMENTS_16_8_4(alignment, [&]() {
          DISPATCH_WORLD_SIZES(symm_mem->get_world_size(), [&]() {
            one_shot_all_reduce_kernel<scalar_t, k_alignment, k_world_size>
                <<<num_blocks,
                   num_threads,
                   0,
                   at::cuda::getCurrentCUDAStream()>>>(
                    reinterpret_cast<scalar_t**>(
                        symm_mem->get_buffer_ptrs_dev()),
                    out.data_ptr<scalar_t>(),
                    input.storage_offset(),
                    input.numel(),
                    reinterpret_cast<uint32_t**>(
                        symm_mem->get_signal_pad_ptrs_dev()),
                    symm_mem->get_rank(),
                    symm_mem->get_world_size());
            C10_CUDA_KERNEL_LAUNCH_CHECK();
          });
        });
      });
  return out;
}

at::Tensor one_shot_all_reduce(
    const at::Tensor& input,
    std::string reduce_op,
    std::string group_name) {
  auto out = at::empty_like(input);
  return one_shot_all_reduce_out(input, reduce_op, group_name, out);
}

constexpr size_t two_shot_all_reduce_max_num_blocks = 24;
constexpr size_t two_shot_all_reduce_max_num_threads = 512;

template <typename T, int alignment, int k_world_size>
static __launch_bounds__(two_shot_all_reduce_max_num_threads) __global__
    void two_shot_all_reduce_kernel(
        T** input_ptrs,
        T* output_ptr,
        size_t input_offset,
        size_t numel,
        uint32_t** signal_pads,
        size_t rank,
        size_t world_size) {
  static_assert(alignment % sizeof(T) == 0);
  constexpr size_t numel_per_thread = alignment / sizeof(T);

  sync_remote_blocks<std::memory_order_acq_rel>(signal_pads, rank, world_size);
  __syncthreads();

  const size_t numel_per_rank =
      at::round_up(numel, alignment * world_size) / world_size;
  const size_t start = numel_per_rank * rank;

  auto offset = (blockDim.x * blockIdx.x + threadIdx.x) * numel_per_thread;
  auto stride = blockDim.x * gridDim.x * numel_per_thread;
  for (size_t i = offset; i < numel_per_rank; i += stride) {
    if (start + i >= numel) {
      continue;
    }
    auto vec = load_and_reduce<T, alignment, k_world_size>(
        input_ptrs, rank, world_size, input_offset + start + i);
    // store to local buffer
    st_vec<alignment>(input_ptrs[rank] + input_offset + start + i, vec);
  }

  __syncthreads();
  sync_remote_blocks<std::memory_order_acq_rel>(signal_pads, rank, world_size);
  __syncthreads();
  for (size_t i = offset; i < numel_per_rank; i += stride) {
    Vec<alignment> tmp[k_world_size];
#pragma unroll k_world_size
    for (size_t step = 0; step < k_world_size; ++step) {
      size_t remote_rank = (rank + step) % k_world_size;
      size_t remote_start = numel_per_rank * remote_rank;
      if (remote_start + i >= numel) {
        continue;
      }
      tmp[step] = ld_vec<alignment>(
          input_ptrs[remote_rank] + input_offset + remote_start + i);
    }
#pragma unroll k_world_size
    for (size_t step = 0; step < k_world_size; ++step) {
      size_t remote_rank = (rank + step) % k_world_size;
      size_t remote_start = numel_per_rank * remote_rank;
      if (remote_start + i >= numel) {
        continue;
      }
      st_vec<alignment>(
          output_ptr + remote_start + i, tmp[step]);
    }
  }
  // need to make sure all blocks exit simultaneously so that the data
  // is not corrupted by the subsequent kernels
  __syncthreads();
  sync_remote_blocks<std::memory_order_acq_rel>(signal_pads, rank, world_size);
}

template <typename T, int alignment, int k_world_size>
static __launch_bounds__(two_shot_all_reduce_max_num_threads) __global__
    void two_shot_all_reduce_kernel_inplace(
        T** input_ptrs,
        size_t input_offset,
        size_t numel,
        uint32_t** signal_pads,
        size_t rank,
        size_t world_size) {
  static_assert(alignment % sizeof(T) == 0);
  constexpr size_t numel_per_thread = alignment / sizeof(T);

  sync_remote_blocks<std::memory_order_relaxed>(signal_pads, rank, world_size);
  __syncthreads();

  const size_t numel_per_rank =
      at::round_up(numel, alignment * world_size) / world_size;
  const size_t start = numel_per_rank * rank;

  auto offset = (blockDim.x * blockIdx.x + threadIdx.x) * numel_per_thread;
  auto stride = blockDim.x * gridDim.x * numel_per_thread;
  for (size_t i = offset; i < numel_per_rank; i += stride) {
    if (start + i >= numel) {
      continue;
    }
    auto vec = load_and_reduce<T, alignment, k_world_size>(
        input_ptrs, rank, world_size, input_offset + start + i);
    for (size_t step = 0; step < world_size; ++step) {
      size_t remote_rank = (rank + step) % world_size;
      st_vec<alignment>(
          input_ptrs[remote_rank] + input_offset + start + i, vec);
    }
  }

  __syncthreads();
  sync_remote_blocks<std::memory_order_acq_rel>(signal_pads, rank, world_size);
}

at::Tensor two_shot_all_reduce_impl(
    at::Tensor input,
    std::optional<at::Tensor> output,
    std::string reduce_op,
    std::string group_name) {
  TORCH_CHECK(
      input.is_contiguous(), "two_shot_all_reduce: input must be contiguous.");
  TORCH_CHECK(
      reduce_op == "sum",
      "two_shot_all_reduce: only sum is supported for now.");

  auto symm_mem = c10d::symmetric_memory::rendezvous(input, group_name);
  TORCH_CHECK(
      symm_mem != nullptr,
      "two_shot_all_reduce: input must be allocated with empty_strided_p2p().");

  const size_t alignment =
      get_and_verify_alignment(input, "two_shot_all_reduce");

  if (output.has_value()) {
    const size_t output_alignment =
        get_and_verify_alignment(*output, "two_shot_all_reduce");
    TORCH_CHECK(
        alignment <= output_alignment,
        "two_shot_all_reduce: output alignment must be equal to or larger than input.");
  }

  int num_blocks = 0, num_threads = 0;
  init_elementwise_launch_config(
      input.numel(),
      input.element_size(),
      alignment,
      symm_mem->get_world_size(),
      two_shot_all_reduce_max_num_blocks,
      two_shot_all_reduce_max_num_threads,
      num_blocks,
      num_threads);

  if (!output.has_value()) {
    AT_DISPATCH_FLOAT_AND_BFLOAT16(
        input.scalar_type(), "two_shot_all_reduce", [&]() {
          DISPATCH_ALIGNMENTS_16_8_4(alignment, [&]() {
            DISPATCH_WORLD_SIZES(symm_mem->get_world_size(), [&]() {
              two_shot_all_reduce_kernel_inplace<
                  scalar_t,
                  k_alignment,
                  k_world_size>
                  <<<num_blocks,
                     num_threads,
                     0,
                     at::cuda::getCurrentCUDAStream()>>>(
                      reinterpret_cast<scalar_t**>(
                          symm_mem->get_buffer_ptrs_dev()),
                      input.storage_offset(),
                      input.numel(),
                      reinterpret_cast<uint32_t**>(
                          symm_mem->get_signal_pad_ptrs_dev()),
                      symm_mem->get_rank(),
                      symm_mem->get_world_size());
              C10_CUDA_KERNEL_LAUNCH_CHECK();
            });
          });
        });
    return input;
  } else {
    AT_DISPATCH_FLOAT_AND_BFLOAT16(
        input.scalar_type(), "two_shot_all_reduce", [&]() {
          DISPATCH_ALIGNMENTS_16_8_4(alignment, [&]() {
            DISPATCH_WORLD_SIZES_NO_DEFAULT(symm_mem->get_world_size(), [&]() {
              two_shot_all_reduce_kernel<scalar_t, k_alignment, k_world_size>
                  <<<num_blocks,
                     num_threads,
                     0,
                     at::cuda::getCurrentCUDAStream()>>>(
                      reinterpret_cast<scalar_t**>(
                          symm_mem->get_buffer_ptrs_dev()),
                      output->data_ptr<scalar_t>(),
                      input.storage_offset(),
                      input.numel(),
                      reinterpret_cast<uint32_t**>(
                          symm_mem->get_signal_pad_ptrs_dev()),
                      symm_mem->get_rank(),
                      symm_mem->get_world_size());
              C10_CUDA_KERNEL_LAUNCH_CHECK();
            });
          });
        });
    return *output;
  }
}

at::Tensor two_shot_all_reduce_(
    at::Tensor input,
    std::string reduce_op,
    std::string group_name) {
  return two_shot_all_reduce_impl(input, c10::nullopt, reduce_op, group_name);
}

at::Tensor two_shot_all_reduce_out(
    at::Tensor input,
    std::string reduce_op,
    std::string group_name,
    at::Tensor output) {
  return two_shot_all_reduce_impl(input, output, reduce_op, group_name);
}
} // namespace
#endif // #if defined(CUDART_VERSION) && CUDART_VERSION >= 12030

namespace {

at::Tensor memset32_(
    at::Tensor& input,
    int64_t offset,
    int64_t val,
    int64_t count) {
#if !defined(USE_ROCM) && defined(PYTORCH_C10_DRIVER_API_SUPPORTED)
  TORCH_CHECK(
      input.dim() == 1 && input.is_contiguous() &&
          input.scalar_type() == c10::ScalarType::UInt32,
      "symm_mem::memset32_: input must be a flat, contiguous uint32 tensor.");

  TORCH_CHECK(
      offset >= 0,
      "symm_mem::memset32_: offset must be greater than or equal to 0 (got ",
      offset,
      ")");

  TORCH_CHECK(
      count > 0,
      "symm_mem::memset32_: count must be a positive integer (got ",
      count,
      ")");

  TORCH_CHECK(
      val >= 0 &&
          static_cast<size_t>(val) <= std::numeric_limits<uint32_t>::max(),
      "symm_mem::memset32_: val must be in the range of "
      "[0, 4294967295] (uint32_t).")

  auto element_size = c10::elementSize(input.scalar_type());
  TORCH_CHECK(
      offset + count <= input.numel(),
      "symm_mem::memset32_: offset + count (",
      offset + count,
      ") exceeded the numel of the input (",
      input.numel(),
      ")");

  auto addr = reinterpret_cast<uint32_t*>(input.data_ptr()) + offset;

  c10::cuda::CUDAGuard guard(input.device());
  auto driver_api = c10::cuda::DriverAPI::get();
  C10_CUDA_DRIVER_CHECK(driver_api->cuMemsetD32Async_(
      reinterpret_cast<CUdeviceptr>(addr),
      val,
      count,
      at::cuda::getCurrentCUDAStream()));
#else
  TORCH_CHECK(
      false, "CUDASymmetricMemory requires PYTORCH_C10_DRIVER_API_SUPPORTED");
#endif
  return input;
}

at::Tensor stream_write_value32_(
    at::Tensor& input,
    int64_t offset,
    int64_t val) {
#if !defined(USE_ROCM) && defined(PYTORCH_C10_DRIVER_API_SUPPORTED)
  TORCH_CHECK(
      input.dim() == 1 && input.is_contiguous() &&
          input.scalar_type() == c10::ScalarType::UInt32,
      "symm_mem::stream_write_value32_: input must be a flat, contiguous "
      "uint32 tensor.");

  TORCH_CHECK(
      offset >= 0,
      "symm_mem::stream_write_value32_: offset must be greater than or "
      "equal to 0 (got ",
      offset,
      ")");

  TORCH_CHECK(
      val >= 0 &&
          static_cast<size_t>(val) <= std::numeric_limits<uint32_t>::max(),
      "symm_mem::stream_write_value32_: "
      "val must be in the range of [0, 4294967295] (uint32_t).")

  auto element_size = c10::elementSize(input.scalar_type());
  TORCH_CHECK(
      offset < input.numel(),
      "symm_mem::stream_write_value32_: offset (",
      offset,
      ") exceeded the numel of the input (",
      input.numel(),
      ")");

  auto addr = reinterpret_cast<uint32_t*>(input.data_ptr()) + offset;

  c10::cuda::CUDAGuard guard(input.device());
  auto driver_api = c10::cuda::DriverAPI::get();
  // According to the documentation of CUstreamWriteValue_flags,
  // cuStreamWriteValue32 will provide a memory fence before the write, which
  // has similar semantics to __threadfence_system() but is scoped to the
  // stream rather than a CUDA thread.
  C10_CUDA_DRIVER_CHECK(driver_api->cuStreamWriteValue32_(
      at::cuda::getCurrentCUDAStream(),
      reinterpret_cast<CUdeviceptr>(addr),
      val,
      0));
#else
  TORCH_CHECK(
      false, "CUDASymmetricMemory requires PYTORCH_C10_DRIVER_API_SUPPORTED");
#endif
  return input;
}

} // namespace

TORCH_LIBRARY_IMPL(symm_mem, CUDA, m) {
#if defined(CUDART_VERSION) && CUDART_VERSION >= 12030
  m.impl("multimem_all_reduce_", ::multimem_all_reduce_);

  // NOTE: [multimem_one_shot_all_reduce]
  // multimem.ld_reduce does not guarantee a fixed accumulation order. This
  // means that while multimem_one_shot_all_reduce is faster and has higher
  // numerical accuracy than one_shot_all_reduce, it doesn't guarantee
  // identical results across ranks. There may be use cases that can take
  // advantage of this property, but it should not be used without
  // understanding the caveats.
  m.impl("multimem_one_shot_all_reduce", ::multimem_one_shot_all_reduce);
  m.impl(
      "multimem_one_shot_all_reduce_out", ::multimem_one_shot_all_reduce_out);
  m.impl("multimem_all_gather_out", ::multimem_all_gather_out);
  m.impl("one_shot_all_reduce", ::one_shot_all_reduce);
  m.impl("one_shot_all_reduce_out", ::one_shot_all_reduce_out);
  m.impl("two_shot_all_reduce_", ::two_shot_all_reduce_);
  m.impl("two_shot_all_reduce_out", ::two_shot_all_reduce_out);

  m.impl("_async_input_mm", c10d::cuda::detail::async_input_mm);
#endif
  m.impl("stream_write_value32_", ::stream_write_value32_);
  m.impl("memset32_", ::memset32_);
}
