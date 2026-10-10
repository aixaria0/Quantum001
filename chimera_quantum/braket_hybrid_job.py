from __future__ import annotations

import os
from pathlib import Path

from .braket_config import target_from_env

# This module is optional: importing it requires the Amazon Braket SDK.
from braket.jobs.config import InstanceConfig, OutputDataConfig, StoppingCondition
from braket.jobs.hybrid_job import hybrid_job

_TARGET = target_from_env()
_REQUIREMENTS = str((Path(__file__).resolve().parent.parent / "requirements-braket.txt"))
_S3_OUTPUT = os.getenv("BRAKET_S3_OUTPUT")
_ROLE_ARN = os.getenv("BRAKET_ROLE_ARN")
_INSTANCE_TYPE = os.getenv("BRAKET_INSTANCE_TYPE", "ml.m5.large")
_MAX_RUNTIME = int(os.getenv("BRAKET_MAX_RUNTIME_SECONDS", "3600"))

_DECORATOR_OPTIONS = {
    "device": _TARGET.device,
    "dependencies": _REQUIREMENTS,
    "local": _TARGET.hybrid_local,
    "instance_config": InstanceConfig(instanceType=_INSTANCE_TYPE),
    "stopping_condition": StoppingCondition(maxRuntimeInSeconds=_MAX_RUNTIME),
    "tags": {"project": "chimera", "component": "quantum-execution-v1"},
}
if _S3_OUTPUT:
    _DECORATOR_OPTIONS["output_data_config"] = OutputDataConfig(s3Path=_S3_OUTPUT)
if _ROLE_ARN:
    _DECORATOR_OPTIONS["role_arn"] = _ROLE_ARN


@hybrid_job(**_DECORATOR_OPTIONS)
def variational_hybrid_job(
    iterations: int = 8,
    shots: int = 200,
    learning_rate: float = 0.2,
    initial_theta: float = 0.3,
):
    """Small iterative hybrid workload usable on local, SV1, DM1 or a QPU.

    The algorithm minimizes <Z0> for RY(theta)-CNOT using parameter-shift
    gradients. Metrics are emitted through the Braket metrics API. For managed
    jobs those metrics are available to Braket/CloudWatch monitoring surfaces.
    """
    import math

    from braket.aws import AwsDevice
    from braket.circuits import Circuit, Observable
    from braket.devices import LocalSimulator
    from braket.jobs import get_job_device_arn
    from braket.jobs.metrics import log_metric

    device_arn = get_job_device_arn()
    if device_arn.startswith("local:"):
        device = LocalSimulator("braket_sv")
    else:
        device = AwsDevice(device_arn)

    def evaluate(theta: float) -> float:
        circuit = Circuit().ry(0, theta).cnot(0, 1)
        circuit.expectation(observable=Observable.Z(), target=0)
        task = device.run(circuit, shots=shots)
        return float(task.result().values[0])

    theta = float(initial_theta)
    history = []
    for iteration in range(int(iterations)):
        cost = evaluate(theta)
        plus = evaluate(theta + math.pi / 2)
        minus = evaluate(theta - math.pi / 2)
        gradient = 0.5 * (plus - minus)
        theta -= float(learning_rate) * gradient

        log_metric(metric_name="cost", value=cost, iteration_number=iteration)
        log_metric(metric_name="theta", value=theta, iteration_number=iteration)
        log_metric(metric_name="gradient", value=gradient, iteration_number=iteration)
        history.append({
            "iteration": iteration,
            "cost": cost,
            "theta": theta,
            "gradient": gradient,
        })

    final_cost = evaluate(theta)
    log_metric(metric_name="final_cost", value=final_cost, iteration_number=int(iterations))
    return {
        "device": device_arn,
        "iterations": int(iterations),
        "shots": int(shots),
        "final_theta": theta,
        "final_cost": final_cost,
        "history": history,
    }
