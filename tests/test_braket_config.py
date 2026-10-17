import os

from chimera_quantum.braket_config import (
    DM1_ARN,
    LOCAL_EMBEDDED_DEVICE,
    SV1_ARN,
    resolve_braket_target,
    target_from_env,
)


def test_backend_aliases_are_explicit_and_stable():
    local = resolve_braket_target("local")
    assert local.device == LOCAL_EMBEDDED_DEVICE
    assert local.hybrid_local is True

    sv1 = resolve_braket_target("sv1")
    assert sv1.device == SV1_ARN
    assert sv1.execution_mode == "managed-simulator"

    dm1 = resolve_braket_target("DM1")
    assert dm1.device == DM1_ARN


def test_qpu_requires_explicit_arn():
    try:
        resolve_braket_target("qpu")
    except ValueError as exc:
        assert "QPU ARN" in str(exc)
    else:
        raise AssertionError("qpu alias without ARN must fail")

    target = resolve_braket_target(
        "qpu",
        "arn:aws:braket:eu-north-1::device/qpu/iqm/Garnet",
    )
    assert target.execution_mode == "qpu"


def test_tn1_is_fail_closed_because_service_is_retired():
    try:
        resolve_braket_target("tn1")
    except ValueError as exc:
        assert "retired" in str(exc).lower()
    else:
        raise AssertionError("retired TN1 must not silently resolve")


def test_environment_switch_requires_no_code_change(monkeypatch):
    monkeypatch.setenv("BRAKET_BACKEND", "sv1")
    monkeypatch.delenv("BRAKET_QPU_ARN", raising=False)
    assert target_from_env().device == SV1_ARN
