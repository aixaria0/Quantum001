from __future__ import annotations

from dataclasses import dataclass
import os

SV1_ARN = "arn:aws:braket:::device/quantum-simulator/amazon/sv1"
DM1_ARN = "arn:aws:braket:::device/quantum-simulator/amazon/dm1"
LOCAL_EMBEDDED_DEVICE = "local:braket/braket.local.qubit"


@dataclass(frozen=True)
class BraketTarget:
    alias: str
    device: str
    hybrid_local: bool
    execution_mode: str


def resolve_braket_target(alias: str, qpu_arn: str | None = None) -> BraketTarget:
    key = alias.strip().lower()
    if key == "local":
        return BraketTarget(
            alias="local",
            device=LOCAL_EMBEDDED_DEVICE,
            hybrid_local=True,
            execution_mode="embedded-simulator",
        )
    if key == "sv1":
        return BraketTarget(
            alias="sv1",
            device=SV1_ARN,
            hybrid_local=False,
            execution_mode="managed-simulator",
        )
    if key == "dm1":
        return BraketTarget(
            alias="dm1",
            device=DM1_ARN,
            hybrid_local=False,
            execution_mode="managed-simulator",
        )
    if key == "tn1":
        raise ValueError("TN1 was retired by Amazon Braket in June 2026; use SV1 or DM1")
    if key == "qpu":
        if not qpu_arn or not qpu_arn.startswith("arn:aws") or ":braket:" not in qpu_arn or "/qpu/" not in qpu_arn:
            raise ValueError("qpu backend requires an explicit Amazon Braket QPU ARN")
        return BraketTarget(
            alias="qpu",
            device=qpu_arn,
            hybrid_local=False,
            execution_mode="qpu",
        )
    raise ValueError(f"unsupported Braket backend: {alias}")


def target_from_env() -> BraketTarget:
    return resolve_braket_target(
        os.getenv("BRAKET_BACKEND", "local"),
        os.getenv("BRAKET_QPU_ARN"),
    )
