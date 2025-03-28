# Owner(s): ["module: linear algebra"]

import contextlib
import json
import math
import re
import tempfile
import unittest
from typing import Optional

import torch
from torch.testing._internal.common_cuda import (
    PLATFORM_SUPPORTS_FP8,
    PLATFORM_SUPPORTS_MX_GEMM,
    SM89OrLater,
    SM90OrLater,
)
from torch.testing._internal.common_device_type import instantiate_device_type_tests
from torch.testing._internal.common_quantized import (
    _f32_to_floatx_unpacked,
    _floatx_unpacked_to_f32,
)
from torch.testing._internal.common_utils import (
    IS_WINDOWS,
    parametrize,
    run_tests,
    TEST_WITH_ROCM,
    TestCase,
)


# Protects against includes accidentally setting the default dtype
assert torch.get_default_dtype() is torch.float32

f8_msg = "FP8 is only supported on H100+, SM 8.9 and MI300+ devices"
mx_skip_msg = "MX gemm is only supported on CUDA capability 10.0+"

if torch.version.hip and "gfx94" in torch.cuda.get_device_properties(0).gcnArchName:
    e4m3_type = torch.float8_e4m3fnuz
    e5m2_type = torch.float8_e5m2fnuz
    E4M3_MAX_POS = torch.finfo(torch.float8_e4m3fnuz).max
    E5M2_MAX_POS = torch.finfo(torch.float8_e5m2fnuz).max
else:
    e4m3_type = torch.float8_e4m3fn
    e5m2_type = torch.float8_e5m2
    E4M3_MAX_POS = torch.finfo(torch.float8_e4m3fn).max
    E5M2_MAX_POS = torch.finfo(torch.float8_e5m2).max

# avoid division by zero when calculating scale
EPS = 1e-12


def amax_to_scale(
    amax: torch.Tensor, float8_dtype: torch.dtype, orig_dtype: torch.dtype
):
    """Converts the amax value of a tensor to the fp8 scale.
    Args:
        amax: The amax value of the tensor.
        float8_dtype: the float8 dtype.
        orig_dtype: The original dtype of the tensor.
    """
    scale = torch.empty_like(amax, dtype=torch.float32)
    if float8_dtype == e4m3_type:
        res = E4M3_MAX_POS / torch.clamp(amax, min=EPS)
    elif float8_dtype == e5m2_type:
        res = E4M3_MAX_POS / torch.clamp(amax, min=EPS)
    else:
        raise ValueError(f"Unsupported float8_dtype: {float8_dtype}")

    # Ensure the scale is representable in float16,
    # this helps when amax is small. We are assuming that we don't need
    # to care about this for float32/bfloat16
    if orig_dtype is torch.float16:
        res = torch.clamp(res, max=torch.finfo(torch.float16).max)

    scale.copy_(res)
    return scale


def tensor_to_scale(x: torch.Tensor, float8_dtype: torch.dtype, dim=None):
    if dim is None:
        amax = torch.max(torch.abs(x))
    else:
        amax = torch.max(torch.abs(x), dim=dim, keepdim=True).values

    return amax_to_scale(amax, float8_dtype, x.dtype)


def mm_float8_emulated(x, x_scale, y, y_scale, out_dtype) -> torch.Tensor:
    # naive implementation: dq -> op -> q
    x_fp32 = x.to(torch.float) / x_scale
    y_fp32 = y.to(torch.float) / y_scale
    out_fp32 = torch.mm(x_fp32, y_fp32)

    return out_fp32.to(out_dtype)


def addmm_float8_unwrapped(
    a_data: torch.Tensor,
    a_scale: torch.Tensor,
    b_data: torch.Tensor,
    b_scale: torch.tensor,
    output_dtype: torch.dtype,
    output_scale: Optional[torch.Tensor],
    bias: Optional[torch.Tensor] = None,
) -> torch.Tensor:
    a_inverse_scale = a_scale.reciprocal()
    b_inverse_scale = b_scale.reciprocal()
    if output_dtype == torch.float32 and bias is not None:
        # Bias is not supported by _scaled_mm when output is fp32
        output = torch._scaled_mm(
            a_data,
            b_data,
            scale_a=a_inverse_scale,
            scale_b=b_inverse_scale,
            scale_result=output_scale,
            out_dtype=output_dtype,
        )
        output += bias
        return output
    output = torch._scaled_mm(
        a_data,
        b_data,
        bias=bias,
        scale_a=a_inverse_scale,
        scale_b=b_inverse_scale,
        scale_result=output_scale,
        out_dtype=output_dtype,
    )
    return output


def mm_float8(
    a: torch.Tensor,
    b: torch.Tensor,
    a_scale: torch.Tensor,
    b_scale: torch.Tensor,
    output_dtype: torch.dtype,  # output dtype
    output_scale: Optional[torch.Tensor] = None,  # output scale, precomputed
) -> torch.Tensor:
    return addmm_float8_unwrapped(a, a_scale, b, b_scale, output_dtype, output_scale)


def to_fp8_saturated(x: torch.Tensor, fp8_dtype: torch.dtype):
    if fp8_dtype == e4m3_type:
        x = x.clamp(min=-1 * E4M3_MAX_POS, max=E4M3_MAX_POS)
    elif fp8_dtype == e5m2_type:
        x = x.clamp(min=-1 * E5M2_MAX_POS, max=E5M2_MAX_POS)
    else:
        raise ValueError(f"to_fp8_saturated(): Unsupported fp8_dtype: {fp8_dtype}")

    return x.to(fp8_dtype)


# copied from https://github.com/drisspg/transformer_nuggets/blob/main/transformer_nuggets/mx/to_blocked.py
def ceil_div(a, b):
    return (a + b - 1) // b


def to_blocked(input_matrix) -> torch.Tensor:
    """
    Rearrange a large matrix by breaking it into blocks and applying the rearrangement pattern.

    See:
        https://docs.nvidia.com/cuda/cublas/index.html#d-block-scaling-factors-layout

    Args:
        input_matrix: Input tensor of shape (H, W)

    Returns:
        Rearranged tensor of shape (32*ceil_div(H,128), 16*ceil_div(W,4))
    """
    rows, cols = input_matrix.shape
    n_row_blocks = ceil_div(rows, 128)
    n_col_blocks = ceil_div(cols, 4)

    # Calculate the padded shape
    padded_rows = n_row_blocks * 128
    padded_cols = n_col_blocks * 4

    padded = input_matrix
    # Ideally we would use torch.nn.pad but it doesn't support float8_e8m0fnu for now
    if (rows, cols) != (padded_rows, padded_cols):
        padded = torch.zeros(
            (padded_rows, padded_cols),
            device=input_matrix.device,
            dtype=input_matrix.dtype,
        )
        padded[:rows, :cols] = input_matrix

    # Rearrange the blocks
    blocks = padded.view(n_row_blocks, 128, n_col_blocks, 4).permute(0, 2, 1, 3)
    rearranged = blocks.reshape(-1, 4, 32, 4).transpose(1, 2).reshape(-1, 32, 16)

    return rearranged.flatten()


def compute_error(x: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
    """Computes the error between two tensors in dB.

    For more details see:
        https://en.wikipedia.org/wiki/Signal-to-noise_ratio

    Args:
        x: The original tensor.
        y: The tensor to compare to the original tensor.
    """
    Ps = torch.norm(x)
    Pn = torch.norm(x - y)
    return 20 * torch.log10(Ps / Pn)


# largest power of 2 representable in `torch.float8_e4m3fn`
F8E4M3_LARGEST_POW2 = 8
# max value of `torch.float8_e4m3fn` (448)
F8E4M3_MAX_VAL = torch.finfo(torch.float8_e4m3fn).max
# exponent bias of `torch.float8_e8m0fnu`
F8E8M0_EXP_BIAS = 127
# exponent and mantissa bits of `torch.float4_e2m1fn_x2`
FP4_EBITS, FP4_MBITS = 2, 1
FP4_MAX_VAL = 6.0


def data_to_mx_scale(x, block_size):
    # simple implementation of https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf
    # section 6.3, not all edge cases (such as NaN) are handled/tested
    orig_shape = x.shape
    x = x.reshape(-1, block_size)
    max_abs = torch.amax(torch.abs(x), 1)
    largest_p2_lt_max_abs = torch.floor(torch.log2(max_abs))
    scale_e8m0_unbiased = largest_p2_lt_max_abs - F8E4M3_LARGEST_POW2
    scale_e8m0_unbiased = torch.clamp(
        scale_e8m0_unbiased, -1 * F8E8M0_EXP_BIAS, F8E8M0_EXP_BIAS
    )
    scale_e8m0_biased = scale_e8m0_unbiased + F8E8M0_EXP_BIAS
    scale_e8m0_biased = scale_e8m0_biased.to(torch.uint8)
    scale_e8m0_biased = scale_e8m0_biased.view(torch.float8_e8m0fnu)
    return scale_e8m0_biased.reshape(orig_shape[0], -1)


def data_to_nvfp4_scale(x, block_size):
    orig_shape = x.shape
    x = x.reshape(-1, block_size)
    max_abs = torch.amax(torch.abs(x), 1) + 1e-12

    # x_orig_max / scale = x_in_fp4_domain_max
    # x_orig_max / x_in_fp4_domain_max = scale
    scale = max_abs / FP4_MAX_VAL

    # for the purposes of this function, just clamp to representable range of
    # `torch.float8_e4m3fn`. In real code, we would expect the modeling code to
    # handle this before the input data hits this function.
    scale = scale.clamp(max=F8E4M3_MAX_VAL)

    # cast to target dtype
    scale = scale.to(torch.float8_e4m3fn)
    scale = scale.reshape(orig_shape[0], -1)
    return scale


def down_size(size):
    assert size[-1] % 2 == 0, f"{size} last dim not divisible by two"
    return (*size[:-1], size[-1] // 2)


def pack_uint4(uint8_data) -> torch.Tensor:
    # converting to uint8 for operations
    shape = uint8_data.shape
    assert shape[-1] % 2 == 0
    uint8_data = uint8_data.contiguous().view(-1)
    return (uint8_data[1::2] << 4 | uint8_data[::2]).view(down_size(shape))


def _bfloat16_to_float4_e2m1fn_x2(x):
    assert x.dtype == torch.bfloat16
    x = _f32_to_floatx_unpacked(x.float(), FP4_EBITS, FP4_MBITS)
    x = pack_uint4(x)
    x = x.view(torch.float4_e2m1fn_x2)
    return x


class TestFP8Matmul(TestCase):
    def _test_tautological_mm(
        self,
        device: str = "cuda",
        x_dtype: torch.dtype = e4m3_type,
        y_dtype: torch.dtype = e4m3_type,
        out_dtype: Optional[torch.dtype] = None,
        size: int = 16,
    ) -> None:
        if device != "cpu" and torch.cuda.is_available() and not PLATFORM_SUPPORTS_FP8:
            raise unittest.SkipTest(f8_msg)
        x_fp8 = torch.rand(size, size, device=device).to(x_dtype)
        y_fp8 = torch.eye(size, device=device, dtype=y_dtype).t()
        out_fp32 = torch.mm(x_fp8.to(torch.float), y_fp8.to(torch.float))
        scale_a = torch.tensor(1.0, device=device)
        scale_b = torch.tensor(1.0, device=device)
        out_fp8 = torch._scaled_mm(x_fp8, y_fp8, scale_a, scale_b, out_dtype=out_dtype)
        if out_dtype is not None:
            self.assertEqual(out_dtype, out_fp8.dtype)
        self.assertEqual(out_fp32, out_fp8.to(torch.float))

    def test_float8_basics(self, device) -> None:
        if device != "cpu" and torch.cuda.is_available() and not PLATFORM_SUPPORTS_FP8:
            raise unittest.SkipTest(f8_msg)
        self._test_tautological_mm(device, e4m3_type, e4m3_type, size=16)
        # According to https://docs.nvidia.com/cuda/cublas/#id99 8F_E5M2 MM is unsupported
        # supported on ROCm but fails on CUDA
        ctx = (
            self.assertRaises(RuntimeError)
            if torch.version.hip is None and device != "cpu"
            else contextlib.nullcontext()
        )
        with ctx:
            self._test_tautological_mm(device, e5m2_type, e5m2_type)

        self._test_tautological_mm(device, e4m3_type, e5m2_type, size=32)
        self._test_tautological_mm(device, e5m2_type, e4m3_type, size=48)

        self._test_tautological_mm(device, size=64, out_dtype=torch.float16)
        self._test_tautological_mm(device, size=96, out_dtype=torch.float32)
        self._test_tautological_mm(device, size=80, out_dtype=torch.bfloat16)

        with self.assertRaises(
            AssertionError if torch.version.hip or device == "cpu" else RuntimeError
        ):
            self._test_tautological_mm(device, out_dtype=e5m2_type)

    def test_float8_scale(self, device) -> None:
        if device != "cpu" and torch.cuda.is_available() and not PLATFORM_SUPPORTS_FP8:
            raise unittest.SkipTest(f8_msg)
        size = (16, 16)
        x = torch.full(size, 0.5, device=device, dtype=e4m3_type)
        # hipblaslt does not yet support mixed e4m3_type input
        y_type = e4m3_type if torch.version.hip else e5m2_type
        y = torch.full(size, 0.5, device=device, dtype=y_type).t()
        scale_one = torch.tensor(1.0, device=device)
        scale_a = torch.tensor(1.5, device=device)
        scale_b = torch.tensor(0.66, device=device)
        out_fp8 = torch._scaled_mm(x, y, scale_a=scale_one, scale_b=scale_one)
        self.assertEqual(out_fp8.to(torch.float), torch.full(size, 4.0, device=device))
        out_fp8_s = torch._scaled_mm(x, y, scale_a=scale_a, scale_b=scale_b)
        self.assertEqual(out_fp8, out_fp8_s)

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8, f8_msg)
    @parametrize("base_dtype", [torch.float16, torch.bfloat16, torch.float32])
    def test_scaled_mm_vs_emulated(self, base_dtype):
        torch.manual_seed(42)
        input_dtype = e4m3_type
        output_dtype = base_dtype
        compare_type = torch.float32

        x = torch.randn(16, 16, device="cuda", dtype=base_dtype)
        y = torch.randn(32, 16, device="cuda", dtype=base_dtype).t()

        x_scale = tensor_to_scale(x, input_dtype).float()
        y_scale = tensor_to_scale(y, input_dtype).float()

        x_fp8 = to_fp8_saturated(x * x_scale, input_dtype)
        y_fp8 = to_fp8_saturated(y * y_scale, input_dtype)

        # Calculate actual F8 mm
        out_scaled_mm = mm_float8(
            x_fp8, y_fp8, a_scale=x_scale, b_scale=y_scale, output_dtype=output_dtype
        )

        # Calculate emulated F8 mm
        out_emulated = mm_float8_emulated(x_fp8, x_scale, y_fp8, y_scale, output_dtype)

        if output_dtype != base_dtype:
            out_scaled_mm = out_scaled_mm.to(compare_type)
            out_scaled_mm = out_scaled_mm / tensor_to_scale(out_scaled_mm, input_dtype)

            out_emulated = out_emulated.to(compare_type)
            out_emulated = out_emulated / tensor_to_scale(out_emulated, input_dtype)

        if base_dtype in {torch.bfloat16, torch.float16}:
            atol, rtol = 7e-2, 7e-2
        else:
            atol, rtol = 3e-3, 3e-3

        torch.testing.assert_close(out_scaled_mm, out_emulated, atol=atol, rtol=rtol)

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8, f8_msg)
    @parametrize("base_dtype", [torch.float16, torch.bfloat16, torch.float32])
    def test_scaled_mm_change_stride(self, base_dtype):
        torch.manual_seed(42)
        input_dtype = e4m3_type
        output_dtype = base_dtype
        compare_type = torch.float32

        x = torch.empty_strided((16, 16), (16, 1), device="cuda", dtype=base_dtype)
        y = torch.empty_strided((16, 32), (1, 64), device="cuda", dtype=base_dtype)

        x.normal_()
        y.normal_()

        x_scale = tensor_to_scale(x, input_dtype).float()
        y_scale = tensor_to_scale(y, input_dtype).float()

        x_fp8 = to_fp8_saturated(x * x_scale, input_dtype)
        y_fp8 = to_fp8_saturated(y * y_scale, input_dtype)

        # Calculate actual F8 mm
        out_scaled_mm = mm_float8(
            x_fp8, y_fp8, a_scale=x_scale, b_scale=y_scale, output_dtype=output_dtype
        )

        # Calculate emulated F8 mm
        out_emulated = mm_float8_emulated(x_fp8, x_scale, y_fp8, y_scale, output_dtype)

        if output_dtype != base_dtype:
            out_scaled_mm = out_scaled_mm.to(compare_type)
            out_scaled_mm = out_scaled_mm / tensor_to_scale(out_scaled_mm, input_dtype)

            out_emulated = out_emulated.to(compare_type)
            out_emulated = out_emulated / tensor_to_scale(out_emulated, input_dtype)

        if base_dtype in {torch.bfloat16, torch.float16}:
            atol, rtol = 7e-2, 7e-2
        else:
            atol, rtol = 3e-3, 3e-3

        torch.testing.assert_close(out_scaled_mm, out_emulated, atol=atol, rtol=rtol)

    def test_float8_bias(self, device) -> None:
        if device != "cpu" and torch.cuda.is_available() and not PLATFORM_SUPPORTS_FP8:
            raise unittest.SkipTest(f8_msg)
        (k, l, m) = (16, 48, 32)
        x = torch.ones((k, l), device=device).to(e4m3_type)
        y = torch.full((m, l), 0.25, device=device, dtype=e4m3_type).t()
        bias = torch.full((m,), 4.0, device=device, dtype=torch.half)
        scale_a = torch.tensor(1.0, device=device)
        scale_b = torch.tensor(1.0, device=device)
        out_fp8 = torch._scaled_mm(x, y, scale_a=scale_a, scale_b=scale_b)
        outb_fp8 = torch._scaled_mm(x, y, scale_a=scale_a, scale_b=scale_b, bias=bias)
        # this fails on ROCm currently because hipblaslt doesn't have amax op
        out_fp32 = out_fp8.to(torch.float32)
        outb_fp32 = outb_fp8.to(torch.float32)
        difference = torch.abs(out_fp32 - outb_fp32)
        self.assertEqual(
            difference, torch.tensor(4.0, device=device).expand_as(out_fp32)
        )

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8, f8_msg)
    @parametrize("bias", [True, False])
    def test_non_divisible_leading_dim(self, device, bias: bool) -> None:
        x = torch.rand((17, 16), device=device).to(e4m3_type)
        y = torch.rand((16, 16), device=device).to(e4m3_type).t()
        scale_a = torch.tensor(1.0, device=device)
        scale_b = torch.tensor(1.0, device=device)
        input_bias = None
        if bias:
            input_bias = torch.rand((16,), device=device).to(torch.half)
        _ = torch._scaled_mm(x, y, scale_a, scale_b, bias=input_bias)

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8, f8_msg)
    def test_float8_bias_relu_edgecase(self, device) -> None:
        (k, l, m) = (16, 48, 32)
        x = torch.full((k, l), 0.0, device=device).to(e4m3_type)
        y = torch.full((m, l), 1.0, device=device, dtype=e4m3_type).t()
        bias = torch.full((m,), -3.0, device=device, dtype=torch.half)
        scale_a = torch.tensor(1.0, device=device)
        scale_b = torch.tensor(1.0, device=device)
        outb_fp8 = torch._scaled_mm(x, y, scale_a, scale_b, bias=bias)
        outb_fp32 = outb_fp8.to(torch.float32)
        self.assertEqual(
            outb_fp32, torch.tensor(-3.0, device=device).expand_as(outb_fp32)
        )

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8, f8_msg)
    def test_float32_output_errors_with_bias(self, device) -> None:
        (k, l, m) = (16, 48, 32)
        x = torch.rand((k, l), device=device).to(e4m3_type)
        y = torch.full((m, l), 0.25, device=device, dtype=e4m3_type).t()
        scale_a = torch.tensor(1.0, device=device)
        scale_b = torch.tensor(1.0, device=device)
        bias = torch.full((m,), 4.0, device=device, dtype=torch.bfloat16)
        self.assertRaisesRegex(
            RuntimeError,
            "Bias is not supported when out_dtype is set to Float32",
            lambda: torch._scaled_mm(
                x, y, scale_a, scale_b, bias=bias, out_dtype=torch.float32
            ),
        )

    @unittest.skipIf(PLATFORM_SUPPORTS_FP8 or not torch.cuda.is_available(), f8_msg)
    def test_error_message_fp8_pre_sm89(self, device) -> None:
        (k, l, m) = (16, 48, 32)
        x = torch.rand((k, l), device=device).to(e4m3_type)
        y = torch.rand((m, l), device=device).to(e4m3_type).t()
        scale_a = torch.tensor(1.0, device=device)
        scale_b = torch.tensor(1.0, device=device)
        self.assertRaisesRegex(
            RuntimeError,
            r"torch\.\_scaled\_mm is only supported on CUDA devices with compute capability \>\= 9\.0 or 8\.9, or ROCm MI300\+",
            lambda: torch._scaled_mm(x, y, scale_a, scale_b, out_dtype=torch.float32),
        )

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8, f8_msg)
    def test_float8_scale_fast_accum(self, device) -> None:
        size = (16, 16)
        x = torch.full(size, 0.5, device=device, dtype=e4m3_type)
        # hipblaslt does not yet support mixed e4m3_type input
        y_type = e4m3_type if torch.version.hip else e5m2_type
        y = torch.full(size, 0.5, device=device, dtype=y_type).t()
        scale_a = torch.tensor(1.5, device=device)
        scale_b = torch.tensor(0.66, device=device)
        out_fp8 = torch._scaled_mm(x, y, scale_a, scale_b, use_fast_accum=True)
        self.assertEqual(out_fp8.to(torch.float), torch.full(size, 4.0, device=device))
        out_fp8_s = torch._scaled_mm(
            x, y, scale_a=scale_a, scale_b=scale_b, use_fast_accum=True
        )
        self.assertEqual(out_fp8, out_fp8_s)

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8 or IS_WINDOWS, f8_msg)
    @unittest.skipIf(
        not SM89OrLater, "rowwise implementation is currently sm89+ specific"
    )
    @parametrize("use_fast_accum", [True, False])
    def test_float8_rowwise_scaling_sanity(self, device, use_fast_accum: bool) -> None:
        M, K, N = (1024, 512, 2048)
        fill_value = 0.5
        x = torch.full((M, K), fill_value, device=device)
        y = torch.full((N, K), fill_value, device=device)

        x_scales = torch.ones((x.shape[0], 1), device=device, dtype=torch.float32)
        y_scales = torch.ones((1, y.shape[0]), device=device, dtype=torch.float32)

        x_fp8 = x.to(e4m3_type)
        y_fp8 = y.to(e4m3_type).t()

        out_fp8 = torch._scaled_mm(
            x_fp8,
            y_fp8,
            scale_a=x_scales,
            scale_b=y_scales,
            out_dtype=torch.bfloat16,
            use_fast_accum=use_fast_accum,
        )
        self.assertEqual(
            out_fp8.to(torch.float32),
            torch.full((M, N), K * (fill_value**2), device=device),
        )

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8 or IS_WINDOWS, f8_msg)
    def test_float8_error_messages(self, device) -> None:
        M, K, N = (1024, 512, 2048)
        fill_value = 0.5
        x = torch.full((M, K), fill_value, device=device)
        y = torch.full((N, K), fill_value, device=device)

        x_fp8 = x.to(e4m3_type)
        y_fp8 = y.to(e4m3_type).t()

        with self.assertRaisesRegex(
            RuntimeError,
            re.escape(
                "For RowWise scaling, scale_a should be (1024, 1) and scale_b "
                "should be (1, 2048). Got scale_a.size()=(1, 1) and scale_b.size()=(1, 2)"
            ),
        ):
            torch._scaled_mm(
                x_fp8,
                y_fp8,
                scale_a=torch.ones((1, 1), device="cuda"),
                scale_b=torch.ones((1, 2), device="cuda"),
                out_dtype=torch.bfloat16,
            )

        with self.assertRaisesRegex(
            RuntimeError,
            re.escape(
                " For RowWise scaling, scale_a should be (1024, 1) and scale_b "
                "should be (1, 2048). Got scale_a.size()=(1024, 1) and scale_b.size()=(1, 2049)"
            ),
        ):
            torch._scaled_mm(
                x_fp8,
                y_fp8,
                scale_a=torch.ones((M, 1), device="cuda"),
                scale_b=torch.ones((1, N + 1), device="cuda"),
                out_dtype=torch.bfloat16,
            )
        with self.assertRaisesRegex(
            RuntimeError,
            re.escape(
                "For non-TensorWise scaling, scale tensors must be 2-dimensional"
            ),
        ):
            torch._scaled_mm(
                x_fp8,
                y_fp8,
                scale_a=torch.ones((M), device="cuda"),
                scale_b=torch.ones((N, N), device="cuda"),
                out_dtype=torch.bfloat16,
            )

        with self.assertRaisesRegex(
            RuntimeError,
            re.escape(
                "Both scale_a and scale_b must be contiguous for RowWise scaling."
            ),
        ):
            torch._scaled_mm(
                x_fp8,
                y_fp8,
                scale_a=torch.ones((M, 1), device="cuda"),
                scale_b=torch.ones((1, N * 2), device="cuda")[:, ::2],
                out_dtype=torch.bfloat16,
            )

        # Note re.compile is used, not re.escape. This is to accomodate fn vs fnuz type message.
        with self.assertRaisesRegex(
            RuntimeError,
            r"Expected b\.dtype\(\) == at::kFloat8_e4m3fnu?z? to be true, but got false\.",
        ):
            torch._scaled_mm(
                x_fp8,
                y_fp8.to(e5m2_type),
                scale_a=torch.ones((M, 1), device="cuda"),
                scale_b=torch.ones((1, N), device="cuda"),
                out_dtype=torch.bfloat16,
            )

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8 or IS_WINDOWS, f8_msg)
    @unittest.skipIf(
        not SM89OrLater, "rowwise implementation is currently sm89+ specific"
    )
    @parametrize("base_dtype", [torch.bfloat16])
    def test_scaled_mm_vs_emulated_row_wise(self, base_dtype):
        torch.manual_seed(42)
        input_dtype = e4m3_type
        output_dtype = base_dtype

        x = torch.randn(16, 16, device="cuda", dtype=base_dtype)
        y = torch.randn(32, 16, device="cuda", dtype=base_dtype).t()

        x_scales = tensor_to_scale(x, input_dtype, dim=1).float()
        y_scales = tensor_to_scale(y, input_dtype, dim=0).float()

        x_fp8 = to_fp8_saturated(x * x_scales, e4m3_type)
        y_fp8 = to_fp8_saturated(y * y_scales, e4m3_type)

        # Calculate actual F8 mm
        out_scaled_mm = mm_float8(
            x_fp8, y_fp8, a_scale=x_scales, b_scale=y_scales, output_dtype=output_dtype
        )

        # Calculate emulated F8 mm
        out_emulated = mm_float8_emulated(
            x_fp8, x_scales, y_fp8, y_scales, output_dtype
        )

        if base_dtype in {torch.bfloat16, torch.float16}:
            atol, rtol = 7e-2, 7e-2
        else:
            atol, rtol = 2e-3, 2e-3

        torch.testing.assert_close(out_scaled_mm, out_emulated, atol=atol, rtol=rtol)

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8, f8_msg)
    @parametrize("which_dim_zero", [0, 1, 2])
    @parametrize("use_torch_compile", [False, True])
    def test_zero_dim_tensorwise(self, which_dim_zero, use_torch_compile) -> None:
        device = "cuda"
        x_dtype, y_dtype = torch.float8_e4m3fn, torch.float8_e4m3fn
        out_dtype = torch.bfloat16
        M, K, N = 32, 32, 32
        if which_dim_zero == 0:
            M = 0
        elif which_dim_zero == 1:
            K = 0
        elif which_dim_zero == 2:
            N = 0

        x_fp8 = torch.zeros(M, K, device=device).to(x_dtype)
        y_fp8 = torch.zeros(N, K, device=device, dtype=y_dtype).t()
        out_fp32 = torch.mm(x_fp8.to(torch.float), y_fp8.to(torch.float))
        scale_a = torch.tensor(float("-inf"), device=device)
        scale_b = torch.tensor(float("-inf"), device=device)
        f = torch._scaled_mm
        if use_torch_compile:
            f = torch.compile(torch._scaled_mm)
        out_fp8 = f(x_fp8, y_fp8, scale_a, scale_b, out_dtype=out_dtype)
        self.assertEqual(out_dtype, out_fp8.dtype)
        self.assertEqual(out_fp32, out_fp8.to(torch.float))

    @unittest.skipIf(TEST_WITH_ROCM, "ROCm doesn't support sm carveout")
    @unittest.skipIf(IS_WINDOWS, "Windows doesn't support row-wise scaling")
    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8, f8_msg)
    @unittest.skipIf(not SM90OrLater, "sm89 kernel isn't opted into carveout yet")
    def test_honor_sm_carveout(self) -> None:
        torch.manual_seed(42)

        x = torch.randn(8192, 2048, device="cuda", dtype=torch.float32)
        y = torch.randn(8192, 2048, device="cuda", dtype=torch.float32).t()
        x_scales = tensor_to_scale(x, e4m3_type, dim=1).reciprocal()
        y_scales = tensor_to_scale(y, e4m3_type, dim=0).reciprocal()
        x_fp8 = to_fp8_saturated(x / x_scales, e4m3_type)
        y_fp8 = to_fp8_saturated(y / y_scales, e4m3_type)

        with tempfile.NamedTemporaryFile() as f:
            with torch.profiler.profile(
                activities=[torch.profiler.ProfilerActivity.CUDA]
            ) as prof:
                self.assertIsNone(torch._C._get_sm_carveout_experimental())
                torch._scaled_mm(
                    x_fp8,
                    y_fp8,
                    scale_a=x_scales,
                    scale_b=y_scales,
                    out_dtype=torch.bfloat16,
                )
                torch._C._set_sm_carveout_experimental(0)
                self.assertEqual(torch._C._get_sm_carveout_experimental(), 0)
                torch._scaled_mm(
                    x_fp8,
                    y_fp8,
                    scale_a=x_scales,
                    scale_b=y_scales,
                    out_dtype=torch.bfloat16,
                )
                torch._C._set_sm_carveout_experimental(66)
                self.assertEqual(torch._C._get_sm_carveout_experimental(), 66)
                torch._scaled_mm(
                    x_fp8,
                    y_fp8,
                    scale_a=x_scales,
                    scale_b=y_scales,
                    out_dtype=torch.bfloat16,
                )
                torch._C._set_sm_carveout_experimental(None)
                self.assertIsNone(torch._C._get_sm_carveout_experimental())
                torch._scaled_mm(
                    x_fp8,
                    y_fp8,
                    scale_a=x_scales,
                    scale_b=y_scales,
                    out_dtype=torch.bfloat16,
                )

            prof.export_chrome_trace(f.name)
            no_carveout, carveout_0, carveout_66, no_carveout_again = [
                math.prod(evt.get("args", {}).get("grid", []))
                for evt in json.load(open(f.name))["traceEvents"]
                if evt.get("cat", "") == "kernel"
            ]

            self.assertEqual(no_carveout, no_carveout_again)
            self.assertNotEqual(no_carveout, carveout_66)
            self.assertNotEqual(carveout_66, carveout_0)

    def test_pack_uint4(self):
        """
        Verify that given a tensor with high precision values [val0, val1],
        the x2 packed representation is val1:val0 (from MSB to LSB), and
        not val0:val1.

        Note that the packing function is private to this file, but it's still
        good to test that we are packing in the expected way.
        """
        hp_data = torch.tensor([0b00000010, 0b00001011], dtype=torch.uint8)
        lp_data_actual = pack_uint4(hp_data)
        lp_data_expected = torch.tensor([0b10110010], dtype=torch.uint8)
        torch.testing.assert_close(lp_data_actual, lp_data_expected, atol=0, rtol=0)

    @unittest.skipIf(not PLATFORM_SUPPORTS_MX_GEMM, mx_skip_msg)
    @parametrize(
        "test_case_name",
        [
            "a_eye_b_eye",
            "a_ones_b_ones",
            "a_ones_modified_b_ones",
            "a_ones_b_ones_modified",
            "a_scale_modified_b_ones",
            "a_ones_b_scale_modified",
            "data_random_scales_one",
            "data_random_scales_from_data",
        ],
    )
    @parametrize("fast_accum", [False, True])
    @parametrize(
        "mkn",
        [
            # Nice shapes
            (128, 128, 128),
            (256, 256, 256),
            (128, 256, 512),
            (256, 512, 128),
            (512, 128, 256),
            # Non block multiples
            (65, 96, 112),
            (197, 224, 272),
            # K not multiple of 32 (skipped for fp4)
            (197, 240, 272),
            # Very unbalanced
            (1023, 64, 48),
            (31, 1024, 64),
            (45, 96, 1024),
            # Mixed large and small
            (2, 1024, 128),
            (127, 96, 1024),
            (1025, 128, 96),
        ],
        name_fn=lambda mkn: f"{mkn[0]}_{mkn[1]}_{mkn[2]}",
    )
    @parametrize("recipe", ["mxfp8", "nvfp4"])
    def test_blockwise_mxfp8_nvfp4_numerics(
        self, test_case_name, fast_accum, mkn, recipe
    ) -> None:
        if recipe == "nvfp4" and fast_accum:
            return unittest.skip(
                "fast_accum not supported in nvfp4 cublas gemm, skipping"
            )

        device = "cuda"
        M, K, N = mkn
        if recipe == "nvfp4" and K % 32 != 0:
            return unittest.skip(
                "K must be divisible by 32 for nvfp4 cublas gemm, skipping"
            )

        BLOCK_SIZE = 16 if recipe == "nvfp4" else 32
        require_exact_match = True
        approx_match_sqnr_target = 22.0

        if test_case_name == "a_eye_b_eye":
            if not ((M == K) and (M == N)):
                return unittest.skip(
                    "this test is only defined for M == K == N, skipping"
                )
            A_ref = torch.eye(M, device=device, dtype=torch.bfloat16)
            B_ref = torch.eye(M, device=device, dtype=torch.bfloat16)

            if recipe == "mxfp8":
                A = A_ref.to(torch.float8_e4m3fn)
                B = B_ref.to(torch.float8_e4m3fn)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
            else:  # nvfp4
                A = _bfloat16_to_float4_e2m1fn_x2(A_ref)
                B = _bfloat16_to_float4_e2m1fn_x2(B_ref)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )

        elif test_case_name == "a_ones_b_ones":
            A_ref = torch.ones(M, K, device=device, dtype=torch.bfloat16)
            B_ref = torch.ones(N, K, device=device, dtype=torch.bfloat16)

            if recipe == "mxfp8":
                A = A_ref.to(torch.float8_e4m3fn)
                B = B_ref.to(torch.float8_e4m3fn)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
            else:  # nvfp4
                A = _bfloat16_to_float4_e2m1fn_x2(A_ref)
                B = _bfloat16_to_float4_e2m1fn_x2(B_ref)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )

        elif test_case_name == "a_ones_modified_b_ones":
            A_ref = torch.ones(M, K, device=device, dtype=torch.bfloat16)
            B_ref = torch.ones(N, K, device=device, dtype=torch.bfloat16)
            A_ref[1][0:BLOCK_SIZE] = 2

            if recipe == "mxfp8":
                A = A_ref.to(torch.float8_e4m3fn)
                B = B_ref.to(torch.float8_e4m3fn)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
            else:  # nvfp4
                A = _bfloat16_to_float4_e2m1fn_x2(A_ref)
                B = _bfloat16_to_float4_e2m1fn_x2(B_ref)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )

        elif test_case_name == "a_ones_b_ones_modified":
            A_ref = torch.ones(M, K, device=device, dtype=torch.bfloat16)
            B_ref = torch.ones(N, K, device=device, dtype=torch.bfloat16)
            B_ref[1][0:BLOCK_SIZE] = 2

            if recipe == "mxfp8":
                A = A_ref.to(torch.float8_e4m3fn)
                B = B_ref.to(torch.float8_e4m3fn)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
            else:  # nvfp4
                A = _bfloat16_to_float4_e2m1fn_x2(A_ref)
                B = _bfloat16_to_float4_e2m1fn_x2(B_ref)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )

        elif test_case_name == "a_scale_modified_b_ones":
            A_ref = torch.ones(M, K, device=device, dtype=torch.bfloat16)
            B_ref = torch.ones(N, K, device=device, dtype=torch.bfloat16)

            if recipe == "mxfp8":
                A = A_ref.to(torch.float8_e4m3fn)
                B = B_ref.to(torch.float8_e4m3fn)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                A_ref[1][0:BLOCK_SIZE] = 4
                A[1][0:BLOCK_SIZE] = 2
                A_scale[1][0] = 2
            else:  # nvfp4
                A = _bfloat16_to_float4_e2m1fn_x2(A_ref)
                B = _bfloat16_to_float4_e2m1fn_x2(B_ref)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                A_ref[1][0:BLOCK_SIZE] = 4
                A.view(torch.uint8)[1][0 : (BLOCK_SIZE // 2)] = 0b01000100
                A_scale[1][0] = 2

        elif test_case_name == "a_ones_b_scale_modified":
            A_ref = torch.ones(M, K, device=device, dtype=torch.bfloat16)
            B_ref = torch.ones(N, K, device=device, dtype=torch.bfloat16)

            if recipe == "mxfp8":
                A = A_ref.to(torch.float8_e4m3fn)
                B = B_ref.to(torch.float8_e4m3fn)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                B_ref[1][0:BLOCK_SIZE] = 4
                B[1][0:BLOCK_SIZE] = 2
                B_scale[1][0] = 2
            else:  # nvfp4
                A = _bfloat16_to_float4_e2m1fn_x2(A_ref)
                B = _bfloat16_to_float4_e2m1fn_x2(B_ref)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                B_ref[1][0:BLOCK_SIZE] = 4
                B.view(torch.uint8)[1][0 : (BLOCK_SIZE // 2)] = 0b01000100
                B_scale[1][0] = 2

        elif test_case_name == "data_random_scales_one":
            require_exact_match = False

            if recipe == "mxfp8":
                # scales all-ones, element data random while being exactly representable in float8_e4m3fn
                # generate integers in [0, 255] and interpret as float8_e4m3fn
                A_ref = (
                    torch.randint(0, 255, (M, K), device=device, dtype=torch.uint8)
                    .view(torch.float8_e4m3fn)
                    .to(torch.bfloat16)
                )
                B_ref = (
                    torch.randint(0, 255, (N, K), device=device, dtype=torch.uint8)
                    .view(torch.float8_e4m3fn)
                    .to(torch.bfloat16)
                )
                # modification: don't allow NaN values
                A_ref[torch.isnan(A_ref)] = 0
                B_ref[torch.isnan(B_ref)] = 0
                A = A_ref.to(torch.float8_e4m3fn)
                B = B_ref.to(torch.float8_e4m3fn)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e8m0fnu,
                )
            else:  # nvfp4
                # scales all-ones, element data random while being exactly representable in float4_e2m1fn_x2
                # generate integers in [0, 16] and cast to bfloat16
                A_ref = _floatx_unpacked_to_f32(
                    torch.randint(0, 16, (M, K), device=device, dtype=torch.uint8),
                    FP4_EBITS,
                    FP4_MBITS,
                ).bfloat16()
                B_ref = _floatx_unpacked_to_f32(
                    torch.randint(0, 16, (N, K), device=device, dtype=torch.uint8),
                    FP4_EBITS,
                    FP4_MBITS,
                ).bfloat16()
                A = _bfloat16_to_float4_e2m1fn_x2(A_ref)
                B = _bfloat16_to_float4_e2m1fn_x2(B_ref)
                A_scale = torch.full(
                    (M, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )
                B_scale = torch.full(
                    (N, ceil_div(K, BLOCK_SIZE)),
                    1.0,
                    device=device,
                    dtype=torch.float8_e4m3fn,
                )

        elif test_case_name == "data_random_scales_from_data":
            if not K % BLOCK_SIZE == 0:
                return unittest.skip(
                    f"this test is only defined for K a multiple of {BLOCK_SIZE}, skipping"
                )
            require_exact_match = False
            # random data, scales from data
            A_ref = torch.randn((M, K), device=device, dtype=torch.bfloat16) * 1000
            B_ref = torch.randn((N, K), device=device, dtype=torch.bfloat16) * 1000

            if recipe == "mxfp8":
                # Calculate scales based on the inputs
                A_scale = data_to_mx_scale(A_ref, BLOCK_SIZE)
                B_scale = data_to_mx_scale(B_ref, BLOCK_SIZE)
                max_val = F8E4M3_MAX_VAL
                min_val = -1 * max_val
                A = (
                    A_ref.reshape(-1, BLOCK_SIZE)
                    / A_scale.reshape(M * ceil_div(K, BLOCK_SIZE), 1).float()
                ).reshape(M, K)
                A = A.clamp(min=min_val, max=max_val).to(torch.float8_e4m3fn)
                B = (
                    B_ref.reshape(-1, BLOCK_SIZE)
                    / B_scale.reshape(N * ceil_div(K, BLOCK_SIZE), 1).float()
                ).reshape(N, K)
                B = B.clamp(min=min_val, max=max_val).to(torch.float8_e4m3fn)
            else:  # nvfp4
                A_scale = data_to_nvfp4_scale(A_ref, BLOCK_SIZE)
                B_scale = data_to_nvfp4_scale(B_ref, BLOCK_SIZE)
                max_val = FP4_MAX_VAL
                min_val = -1 * max_val

                A = (
                    A_ref.reshape(-1, BLOCK_SIZE)
                    / A_scale.reshape(M * ceil_div(K, BLOCK_SIZE), 1).bfloat16()
                ).reshape(M, K)
                A = A.clamp(min=min_val, max=max_val)
                A = _bfloat16_to_float4_e2m1fn_x2(A)
                B = (
                    B_ref.reshape(-1, BLOCK_SIZE)
                    / B_scale.reshape(N * ceil_div(K, BLOCK_SIZE), 1).bfloat16()
                ).reshape(N, K)
                B = B.clamp(min=min_val, max=max_val)
                B = _bfloat16_to_float4_e2m1fn_x2(B)

                approx_match_sqnr_target = 16.0

        C_ref = A_ref @ B_ref.t()

        # convert to swizzled format
        A_scale = to_blocked(A_scale)
        B_scale = to_blocked(B_scale)

        C = torch._scaled_mm(
            A,
            B.t(),
            A_scale,
            B_scale,
            out_dtype=torch.bfloat16,
            use_fast_accum=fast_accum,
        )

        if require_exact_match:
            torch.testing.assert_close(C, C_ref, atol=0, rtol=0)
        else:
            sqnr = compute_error(C_ref, C)
            assert sqnr.item() > approx_match_sqnr_target

    @unittest.skipIf(not PLATFORM_SUPPORTS_FP8 or IS_WINDOWS, f8_msg)
    @parametrize("recipe", ["mxfp8", "nvfp4"])
    def test_blockwise_mxfp8_nvfp4_error_messages(self, device, recipe) -> None:
        M, K, N = (1024, 512, 2048)
        BLOCK_SIZE_K = 16 if recipe == "nvfp4" else 32
        BLOCK_SIZE_MN = 128
        fill_value = 0.5
        scale_dtype = torch.float8_e4m3fn if recipe == "nvfp4" else torch.float8_e8m0fnu

        x = torch.full((M, K), fill_value, device=device)
        y = torch.full((N, K), fill_value, device=device)

        if recipe == "mxfp8":
            x_lowp = x.to(e4m3_type)
            y_lowp = y.to(e4m3_type).t()
        else:  # nvfp4
            x_lowp = _bfloat16_to_float4_e2m1fn_x2(x.bfloat16())
            y_lowp = _bfloat16_to_float4_e2m1fn_x2(y.bfloat16()).t()

        num_k_blocks = ceil_div(K, BLOCK_SIZE_K)
        padded_num_k_blocks = ceil_div(num_k_blocks, 4) * 4
        expected_a_size = (
            BLOCK_SIZE_MN * ceil_div(M, BLOCK_SIZE_MN) * padded_num_k_blocks
        )
        expected_b_size = (
            BLOCK_SIZE_MN * ceil_div(N, BLOCK_SIZE_MN) * padded_num_k_blocks
        )

        # Test wrong scale tensor size for scale_a with correct dtype
        with self.assertRaisesRegex(
            RuntimeError,
            re.escape(
                f"For BlockWise scaling: Expected scale_a size to be {expected_a_size} "
                f"but got {expected_a_size - 1}"
            ),
        ):
            incorrect_size_a = torch.ones(
                expected_a_size - 1, device=device, dtype=scale_dtype
            )
            correct_size_b = torch.ones(
                expected_b_size, device=device, dtype=scale_dtype
            )
            torch._scaled_mm(
                x_lowp,
                y_lowp,
                scale_a=incorrect_size_a,
                scale_b=correct_size_b,
                out_dtype=torch.bfloat16,
            )

        # Test wrong scale tensor size for scale_b with correct dtype
        with self.assertRaisesRegex(
            RuntimeError,
            re.escape(
                f"For BlockWise scaling: Expected scale_b size to be {expected_b_size} "
                f"but got {expected_b_size + 1}"
            ),
        ):
            correct_size_a = torch.ones(
                expected_a_size, device=device, dtype=scale_dtype
            )
            incorrect_size_b = torch.ones(
                expected_b_size + 1, device=device, dtype=scale_dtype
            )
            torch._scaled_mm(
                x_lowp,
                y_lowp,
                scale_a=correct_size_a,
                scale_b=incorrect_size_b,
                out_dtype=torch.bfloat16,
            )

        # Test non-contiguous scale tensors with correct dtype
        with self.assertRaisesRegex(
            RuntimeError,
            re.escape(
                "For BlockWise scaling: Both scale_a and scale_b must be contiguous"
            ),
        ):
            non_contiguous_a = torch.ones(
                expected_a_size * 2, device=device, dtype=scale_dtype
            )[::2]
            contiguous_b = torch.ones(expected_b_size, device=device, dtype=scale_dtype)
            torch._scaled_mm(
                x_lowp,
                y_lowp,
                scale_a=non_contiguous_a,
                scale_b=contiguous_b,
                out_dtype=torch.bfloat16,
            )

    def grouped_mm_helper(
        self, alist, blist, ascalelist, bscalelist, outlist, use_fast_accum
    ):
        for a, b, ascale, bscale, out in zip(
            alist, blist, ascalelist, bscalelist, outlist
        ):
            out_ref = torch._scaled_mm(
                a,
                b.t(),
                ascale.view(-1, 1),
                bscale.view(1, -1),
                out_dtype=torch.bfloat16,
                use_fast_accum=use_fast_accum,
            )
            self.assertEqual(out, out_ref)

    @unittest.skipIf(TEST_WITH_ROCM, "ROCm doesn't support CUTLASS")
    @unittest.skipIf(not SM90OrLater, "Grouped gemm supported on SM90")
    @parametrize("fast_accum", [False, True])
    @parametrize("strided", [False, True])
    def test_grouped_gemm_2d_2d(self, fast_accum, strided):
        device = "cuda"
        m, n, k, n_groups = 16, 16, 16, 4  # all sizes have to be divisible by 16
        a = torch.randn(m, k * n_groups + k * int(strided), device=device).to(
            torch.float8_e4m3fn
        )[:, : k * n_groups]
        b = torch.randn(n, k * n_groups + k * int(strided), device=device).to(
            torch.float8_e4m3fn
        )[:, : k * n_groups]
        scale_a = torch.arange(m * n_groups, device=device, dtype=torch.float32) / 4
        scale_b = torch.arange(n * n_groups, device=device, dtype=torch.float32) / 4
        offs = torch.arange(k, n_groups * k + 1, k, device=device, dtype=torch.int32)
        out = torch._scaled_grouped_mm(
            a,
            b.t(),
            scale_a,
            scale_b,
            offs=offs,
            out_dtype=torch.bfloat16,
            use_fast_accum=fast_accum,
        )
        offs_cpu = offs.cpu()
        alist, blist, ascalelist, bscalelist = [], [], [], []
        start = 0
        for i in range(n_groups):
            alist.append(a[:, start : offs_cpu[i]])
            blist.append(b[:, start : offs_cpu[i]])
            ascalelist.append(scale_a[i * m : (i + 1) * m])
            bscalelist.append(scale_b[i * n : (i + 1) * n])
            start = offs_cpu[i]
        self.grouped_mm_helper(alist, blist, ascalelist, bscalelist, out, fast_accum)

    @unittest.skipIf(TEST_WITH_ROCM, "ROCm doesn't support CUTLASS")
    @unittest.skipIf(not SM90OrLater, "Grouped gemm supported on SM90")
    @parametrize("fast_accum", [False, True])
    @parametrize("strided", [False, True])
    def test_grouped_gemm_2d_3d(self, fast_accum, strided):
        device = "cuda"
        s_int = int(strided)
        m, n, k, n_groups = 16, 32, 16, 4
        a = torch.randn(m * n_groups, k * (1 + s_int), device=device).to(
            torch.float8_e4m3fn
        )[:, :k]
        b = torch.randn(n_groups * (1 + s_int), n, k * (1 + s_int), device=device).to(
            torch.float8_e4m3fn
        )[:: (1 + s_int), :, :k]
        self.assertTrue(a.is_contiguous() is not strided)
        self.assertTrue(b.is_contiguous() is not strided)
        offs = torch.arange(m, n_groups * m + 1, m, device="cuda", dtype=torch.int32)
        scale_a = torch.arange(n_groups * m, device="cuda", dtype=torch.float32)
        scale_b = torch.ones(n_groups * n, device="cuda", dtype=torch.float32).view(
            n_groups, n
        )

        out = torch._scaled_grouped_mm(
            a,
            b.transpose(-2, -1),
            scale_a,
            scale_b,
            offs=offs,
            out_dtype=torch.bfloat16,
            use_fast_accum=fast_accum,
        )

        offs_cpu = offs.cpu()
        alist, ascalelist, outlist = [], [], []
        start = 0
        for i in range(n_groups):
            alist.append(a[start : offs_cpu[i]])
            ascalelist.append(scale_a[start : offs_cpu[i]])
            outlist.append(out[start : offs_cpu[i]])
            start = offs_cpu[i]
        self.grouped_mm_helper(alist, b, ascalelist, scale_b, outlist, fast_accum)

    @unittest.skipIf(TEST_WITH_ROCM, "ROCm doesn't support CUTLASS")
    @unittest.skipIf(not SM90OrLater, "Grouped gemm supported on SM90")
    @parametrize("fast_accum", [False, True])
    @parametrize("strided", [False, True])
    def test_grouped_gemm_3d_3d(self, fast_accum, strided):
        device = "cuda"
        s_int = int(strided)
        m, n, k, n_groups = 16, 32, 16, 4
        a = torch.randn(n_groups * (1 + s_int), m, k * (1 + s_int), device=device).to(
            torch.float8_e4m3fn
        )[:: (1 + s_int), :, :k]
        b = torch.randn(n_groups * (1 + s_int), n, k * (1 + s_int), device=device).to(
            torch.float8_e4m3fn
        )[:: (1 + s_int), :, :k]
        self.assertTrue(a.is_contiguous() is not strided)
        self.assertTrue(b.is_contiguous() is not strided)
        scale_a = torch.ones(n_groups * m, device="cuda", dtype=torch.float32).view(
            n_groups, m
        )
        scale_b = torch.ones(n_groups * n, device="cuda", dtype=torch.float32).view(
            n_groups, n
        )

        out = torch._scaled_grouped_mm(
            a,
            b.transpose(-2, -1),
            scale_a,
            scale_b,
            out_dtype=torch.bfloat16,
            use_fast_accum=fast_accum,
        )

        self.grouped_mm_helper(a, b, scale_a, scale_b, out, fast_accum)

    @unittest.skipIf(TEST_WITH_ROCM, "ROCm doesn't support CUTLASS")
    @unittest.skipIf(not SM90OrLater, "Grouped gemm supported on SM90")
    @parametrize("fast_accum", [False, True])
    @parametrize("strided", [False, True])
    def test_grouped_gemm_3d_2d(self, fast_accum, strided):
        device = "cuda"
        s_int = int(strided)
        m, n, k, n_groups = 16, 32, 16, 4
        a = torch.randn(n_groups * (1 + s_int), m, k * (1 + s_int), device=device).to(
            torch.float8_e4m3fn
        )[:: (1 + s_int), :, :k]
        b = torch.randn(n * n_groups, k * (1 + s_int), device=device).to(
            torch.float8_e4m3fn
        )[:, :k]
        self.assertTrue(a.is_contiguous() is not strided)
        self.assertTrue(b.is_contiguous() is not strided)
        scale_a = torch.arange(n_groups * m, device="cuda", dtype=torch.float32).view(
            n_groups, m
        )
        scale_b = torch.arange(n_groups * n, device="cuda", dtype=torch.float32)
        offs = torch.arange(n, n_groups * n + 1, n, device="cuda", dtype=torch.int32)

        out = torch._scaled_grouped_mm(
            a,
            b.transpose(-2, -1),
            scale_a,
            scale_b,
            offs=offs,
            out_dtype=torch.bfloat16,
            use_fast_accum=fast_accum,
        )
        offs_cpu = offs.cpu()
        blist, bscalelist, outlist = [], [], []
        start = 0
        for i in range(n_groups):
            blist.append(b[start : offs_cpu[i]])
            bscalelist.append(scale_b[start : offs_cpu[i]])
            outlist.append(out[:, start : offs_cpu[i]])
            start = offs_cpu[i]
        self.grouped_mm_helper(a, blist, scale_a, bscalelist, outlist, fast_accum)

    @unittest.skipIf(not PLATFORM_SUPPORTS_MX_GEMM, mx_skip_msg)
    def test_blockwise_mxfp8_compile(self) -> None:
        device = "cuda"
        M, K, N = 128, 128, 128
        BLOCK_SIZE = 32

        A_ref = torch.eye(M, device=device, dtype=torch.bfloat16)
        B_ref = torch.eye(M, device=device, dtype=torch.bfloat16)

        A = A_ref.to(torch.float8_e4m3fn)
        B = B_ref.to(torch.float8_e4m3fn)

        A_scale = torch.full(
            (M, ceil_div(K, BLOCK_SIZE)), 1.0, device=device, dtype=torch.float8_e8m0fnu
        )
        B_scale = torch.full(
            (N, ceil_div(K, BLOCK_SIZE)), 1.0, device=device, dtype=torch.float8_e8m0fnu
        )
        C_ref = A_ref @ B_ref.t()

        compiled_scaled_mm = torch.compile(torch._scaled_mm, backend="inductor")
        C = compiled_scaled_mm(
            A,
            B.t(),
            A_scale,
            B_scale,
            out_dtype=torch.bfloat16,
            use_fast_accum=False,
        )
        torch.testing.assert_close(C, C_ref, atol=0, rtol=0)


instantiate_device_type_tests(TestFP8Matmul, globals())

if __name__ == "__main__":
    TestCase._default_dtype_check_enabled = True
    run_tests()
