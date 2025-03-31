# mypy: allow-untyped-defs
from enum import Enum
from typing import Any, Callable

import torch
from torch._C._profiler import (
    _ProfilerEvent,
    ActiveProfilerType,
    ProfilerActivity,
    ProfilerConfig,
)

# Defined in torch/csrc/autograd/init.cpp

class DeviceType(Enum):
    CPU = ...
    CUDA = ...
    XPU = ...
    MKLDNN = ...
    OPENGL = ...
    OPENCL = ...
    IDEEP = ...
    HIP = ...
    FPGA = ...
    MAIA = ...
    XLA = ...
    MTIA = ...
    MPS = ...
    HPU = ...
    Meta = ...
    Vulkan = ...
    Metal = ...
    PrivateUse1 = ...

class ProfilerEvent:
    def cpu_elapsed_us(self, other: ProfilerEvent) -> float: ...
    def cpu_memory_usage(self) -> int: ...
    def cuda_elapsed_us(self, other: ProfilerEvent) -> float: ...
    def privateuse1_elapsed_us(self, other: ProfilerEvent) -> float: ...
    def cuda_memory_usage(self) -> int: ...
    def device(self) -> int: ...
    def handle(self) -> int: ...
    def has_cuda(self) -> bool: ...
    def is_remote(self) -> bool: ...
    def kind(self) -> int: ...
    def name(self) -> str: ...
    def node_id(self) -> int: ...
    def sequence_nr(self) -> int: ...
    def shapes(self) -> list[list[int]]: ...
    def thread_id(self) -> int: ...
    def flops(self) -> float: ...
    def is_async(self) -> bool: ...

class _KinetoEvent:
    def name(self) -> str: ...
    def overload_name(self) -> str: ...
    def device_index(self) -> int: ...
    def device_resource_id(self) -> int: ...
    def start_ns(self) -> int: ...
    def end_ns(self) -> int: ...
    def duration_ns(self) -> int: ...
    def is_async(self) -> bool: ...
    def linked_correlation_id(self) -> int: ...
    def shapes(self) -> list[list[int]]: ...
    def dtypes(self) -> list[str]: ...
    def concrete_inputs(self) -> list[Any]: ...
    def kwinputs(self) -> dict[str, Any]: ...
    def device_type(self) -> DeviceType: ...
    def start_thread_id(self) -> int: ...
    def end_thread_id(self) -> int: ...
    def correlation_id(self) -> int: ...
    def fwd_thread_id(self) -> int: ...
    def stack(self) -> list[str]: ...
    def scope(self) -> int: ...
    def sequence_nr(self) -> int: ...
    def flops(self) -> int: ...
    def cuda_elapsed_us(self) -> int: ...
    def privateuse1_elapsed_us(self) -> int: ...
    def is_user_annotation(self) -> bool: ...

class _ProfilerResult:
    def events(self) -> list[_KinetoEvent]: ...
    def legacy_events(self) -> list[list[ProfilerEvent]]: ...
    def save(self, path: str) -> None: ...
    def experimental_event_tree(self) -> list[_ProfilerEvent]: ...
    def trace_start_ns(self) -> int: ...

class SavedTensor: ...

def _enable_profiler(
    config: ProfilerConfig,
    activities: set[ProfilerActivity],
) -> None: ...
def _prepare_profiler(
    config: ProfilerConfig,
    activities: set[ProfilerActivity],
) -> None: ...
def _toggle_collection_dynamic(
    enable: bool,
    activities: set[ProfilerActivity],
) -> None: ...
def _disable_profiler() -> _ProfilerResult: ...
def _profiler_enabled() -> bool: ...
def _add_metadata_json(key: str, value: str) -> None: ...
def _kineto_step() -> None: ...
def _get_current_graph_task_keep_graph() -> bool: ...
def _get_sequence_nr() -> int: ...
def kineto_available() -> bool: ...
def _record_function_with_args_enter(name: str, *args) -> torch.Tensor: ...
def _record_function_with_args_exit(handle: torch.Tensor) -> None: ...
def _supported_activities() -> set[ProfilerActivity]: ...
def _enable_record_function(enable: bool) -> None: ...
def _set_empty_test_observer(is_global: bool, sampling_prob: float) -> None: ...
def _push_saved_tensors_default_hooks(
    pack_hook: Callable[[torch.Tensor], Any],
    unpack_hook: Callable[[Any], torch.Tensor],
) -> None: ...
def _pop_saved_tensors_default_hooks() -> None: ...
def _top_saved_tensors_default_hooks(
    ignore_is_tracing: bool,
) -> tuple[Callable[[torch.Tensor], Any], Callable[[Any], torch.Tensor]]: ...
def _unsafe_set_version_counter(
    t: tuple[torch.Tensor, ...], prev_version: tuple[int, ...]
) -> None: ...
def _enable_profiler_legacy(config: ProfilerConfig) -> None: ...
def _disable_profiler_legacy() -> list[list[ProfilerEvent]]: ...
def _profiler_type() -> ActiveProfilerType: ...
def _saved_tensors_hooks_enable() -> None: ...
def _saved_tensors_hooks_disable(message: str, fail_if_non_empty=True) -> None: ...
def _saved_tensors_hooks_get_disabled_error_message() -> str | None: ...
def _saved_tensors_hooks_set_tracing(is_tracing: bool) -> bool: ...

class CreationMeta(Enum):
    DEFAULT = ...
    IN_CUSTOM_FUNCTION = ...
    MULTI_OUTPUT_NODE = ...
    NO_GRAD_MODE = ...
    INFERENCE_MODE = ...

def _set_creation_meta(t: torch.Tensor, creation_meta: CreationMeta) -> None: ...
def _get_creation_meta(t: torch.Tensor) -> CreationMeta: ...
