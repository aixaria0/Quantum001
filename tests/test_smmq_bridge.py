from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import json

import pytest

from chimera_quantum.identity import PersistentEd25519Identity
from chimera_quantum.smmq import (
    build_signed_smmq_receipt,
    ising_energy,
    object_digest,
    qaoa_gate_spec,
    summarize_measurements,
    validate_execution_request,
    validate_smmq_job,
    verify_signed_smmq_receipt,
)
from chimera_quantum.smmq_braket import dry_run_smmq_request

FIXTURE = Path(__file__).parent / "fixtures" / "smmq-request-v1.json"


def load_request() -> dict:
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


def test_cross_runtime_fixture_digests_and_contract_validate():
    request = validate_execution_request(load_request())
    assert request["job"]["ising"]["digest"] == "7f4f219ba159725e515a6ab2632b95fae28243dc35598c423777d63d8db7b5e3"
    assert request["job"]["digest"] == "f0c042463eeac9b959ba4b8229e11ff9592d0679738a1e3bac9224db4e2b5c69"
    assert object_digest(request) == "c9e36476eeb9b5e10a94553d2784cfc4341564f1012652056c27a67052d70f7a"


def test_tampered_smmq_job_is_rejected():
    request = load_request()
    request["job"]["ising"]["h"][0] = 0.25
    with pytest.raises(ValueError, match="digest mismatch"):
        validate_smmq_job(request["job"])


def test_qaoa_gate_spec_matches_ising_hamiltonian_angles():
    request = load_request()
    gates = qaoa_gate_spec(request)
    assert len(gates) == 19
    assert gates[:3] == [
        {"gate": "H", "target": 0},
        {"gate": "H", "target": 1},
        {"gate": "H", "target": 2},
    ]
    first_rz = next(gate for gate in gates if gate["gate"] == "RZ")
    first_zz = next(gate for gate in gates if gate["gate"] == "ZZ")
    assert first_rz["target"] == 0
    assert first_rz["angle"] == pytest.approx(0.28)
    assert first_zz["targets"] == [0, 1]
    assert first_zz["angle"] == pytest.approx(0.42)


def test_measurement_summary_uses_declared_qubit_order_and_recomputes_energy():
    request = load_request()
    summary = summarize_measurements(request["job"], {"101": 40, "010": 24}, [0, 1, 2])
    assert summary["shots"] == 64
    assert summary["mode"]["bits"] == [1, 0, 1]
    assert summary["best_observed"]["selected"] == ["c1", "c3"]
    assert summary["best_observed"]["energy"] == pytest.approx(-1.05)
    assert ising_energy(request["job"], [1, 0, 1]) == pytest.approx(-1.05)


def test_signed_receipt_verifies_and_tamper_fails(tmp_path: Path):
    request = load_request()
    identity = PersistentEd25519Identity.load_or_create(tmp_path / "executor.key")
    execution = {
        "backend": "local",
        "device": "local:braket/braket.local.qubit",
        "execution_class": "embedded-simulator",
        "task_id": "fixture-task",
        "measurement_counts": {"101": 40, "010": 24},
        "measured_qubits": [0, 1, 2],
    }
    receipt = build_signed_smmq_receipt(request, execution, identity)
    assert receipt["best_observed"]["selected"] == ["c1", "c3"]
    assert receipt["qpu_execution_claimed"] is False
    assert verify_signed_smmq_receipt(receipt)["valid"] is True

    tampered = deepcopy(receipt)
    tampered["best_observed"]["bits"] = [0, 0, 0]
    assert verify_signed_smmq_receipt(tampered)["valid"] is False


def test_braket_dry_run_is_explicitly_non_execution():
    dry = dry_run_smmq_request(load_request(), backend="sv1")
    assert dry["schema"] == "smm-q/braket-dry-run-v1"
    assert dry["execution_class"] == "managed-simulator"
    assert dry["qpu_execution"] is False
    assert dry["gate_count"] == 19
