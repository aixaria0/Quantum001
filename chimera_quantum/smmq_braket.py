from __future__ import annotations

from typing import Any, Mapping

from .braket_config import resolve_braket_target
from .smmq import qaoa_gate_spec, validate_execution_request


def dry_run_smmq_request(
    request: Mapping[str, Any],
    *,
    backend: str = "local",
    qpu_arn: str | None = None,
) -> dict[str, Any]:
    request = validate_execution_request(request)
    target = resolve_braket_target(backend, qpu_arn)
    gates = qaoa_gate_spec(request)
    return {
        "schema": "smm-q/braket-dry-run-v1",
        "job_digest": request["job"]["digest"],
        "backend": target.alias,
        "device": target.device,
        "execution_class": target.execution_mode,
        "qubits": len(request["job"]["ising"]["variables"]),
        "shots": request["shots"],
        "gate_count": len(gates),
        "gates": gates,
        "qpu_execution": False,
    }


def build_braket_circuit(request: Mapping[str, Any]):
    """Build the QAOA circuit lazily so core contract tests do not require Braket."""
    from braket.circuits import Circuit

    request = validate_execution_request(request)
    circuit = Circuit()
    for operation in qaoa_gate_spec(request):
        gate = operation["gate"]
        if gate == "H":
            circuit.h(operation["target"])
        elif gate == "RZ":
            circuit.rz(operation["target"], operation["angle"])
        elif gate == "ZZ":
            circuit.zz(operation["targets"][0], operation["targets"][1], operation["angle"])
        elif gate == "RX":
            circuit.rx(operation["target"], operation["angle"])
        else:  # pragma: no cover - gate spec is closed above.
            raise ValueError(f"unsupported gate: {gate}")
    return circuit


def execute_smmq_request(
    request: Mapping[str, Any],
    *,
    backend: str = "local",
    qpu_arn: str | None = None,
) -> dict[str, Any]:
    request = validate_execution_request(request)
    target = resolve_braket_target(backend, qpu_arn)
    circuit = build_braket_circuit(request)

    if target.execution_mode == "embedded-simulator":
        from braket.devices import LocalSimulator

        device = LocalSimulator("braket_sv")
    else:
        from braket.aws import AwsDevice

        device = AwsDevice(target.device)

    task = device.run(circuit, shots=request["shots"])
    result = task.result()
    counts = dict(result.measurement_counts or {})
    measured_qubits = [int(value) for value in (result.measured_qubits or [])]
    task_id = getattr(task, "id", None) or getattr(task, "arn", None) or "local-task"
    return {
        "backend": target.alias,
        "device": target.device,
        "execution_class": target.execution_mode,
        "task_id": str(task_id),
        "measurement_counts": {str(key): int(value) for key, value in counts.items()},
        "measured_qubits": measured_qubits,
    }
