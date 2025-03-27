# Owner(s): ["module: mps"]
# Collection of op level benchmarks for MPS
# Useful as reference tool when migrating ops from MPS to Metal
import itertools
import timeit
from typing import Optional

import torch
from torch.utils.benchmark import Compare, Measurement, Timer


def bench_unary_op(func, x, label) -> Measurement:
    sync_cmd = "torch.mps.synchronize()" if "mps" in str(x.device) else ""
    t = Timer(
        stmt=f"f(x);{sync_cmd}",
        globals={"f": func, "x": x},
        language="python",
        timer=timeit.default_timer,
        sub_label=f"{func.__name__} ({str(x.dtype)})",
        description=label,
        env=torch.__version__,
    )
    return t.blocked_autorange()


def bench_binary_op(func, x, y, label) -> Measurement:
    sync_cmd = "torch.mps.synchronize()" if "mps" in str(x.device) else ""
    t = Timer(
        stmt=f"f(x, y);{sync_cmd}",
        globals={"f": func, "x": x, "y": y},
        language="python",
        timer=timeit.default_timer,
        sub_label=f"{func.__name__} ({str(x.dtype)}, {str(y.dtype)})",
        description=label,
        env=torch.__version__,
    )
    return t.blocked_autorange()


def bench_unary(
    unary_func, device: str = "mps", dtype: torch.dtype = torch.float32
) -> list[Measurement]:
    x = torch.testing.make_tensor(1024, 1024, device=device, dtype=dtype)
    x_s = torch.testing.make_tensor(1024, 2048, device=device, dtype=dtype)[::, ::2]
    rc = []
    rc.append(bench_unary_op(unary_func, x, "dense"))
    rc.append(bench_unary_op(unary_func, x.t(), "transposed"))
    rc.append(bench_unary_op(unary_func, x_s, "strided"))
    rc.append(bench_unary_op(unary_func, x_s.t(), "strided + transposed"))
    return rc


def bench_binary(
    binary_func,
    device: str = "mps",
    dt_a: torch.dtype = torch.float32,
    dt_b: Optional[torch.dtype] = None,
) -> list[Measurement]:
    dt_b = dt_b if dt_b is not None else dt_a
    x = torch.testing.make_tensor(1024, 1024, device=device, dtype=dt_a)
    y = torch.testing.make_tensor(1024, 1024, device=device, dtype=dt_b)
    s = torch.testing.make_tensor((), device=device, dtype=dt_b)
    rc = []
    rc.append(bench_binary_op(binary_func, x, y, "dense-dense"))
    rc.append(bench_binary_op(binary_func, x.t(), y.t(), "transp-transp"))
    rc.append(bench_binary_op(binary_func, x, y.t(), "dense-transp"))
    rc.append(bench_binary_op(binary_func, x.t(), y, "transp-dense"))
    rc.append(bench_binary_op(binary_func, x, s, "dense-scalar"))
    rc.append(bench_binary_op(binary_func, x, y[0], "dense-bcast"))
    return rc


def main() -> None:
    dtypes = [torch.float16, torch.float32]
    # Profile unary ops
    rc = []
    for op, dtype in itertools.product([torch.sqrt, torch.sin], dtypes):
        rc.extend(bench_unary(op, dtype=dtype))
    Compare(rc).print()

    # Profile binary ops
    rc = []
    ops = [torch.fmax, torch.add]
    for op, dtype in itertools.product(ops, dtypes):
        rc.extend(bench_binary(op, dt_a=dtype))
    for op in ops:
        rc.extend(bench_binary(op, dt_b=torch.float16))
    Compare(rc).print()


if __name__ == "__main__":
    main()
