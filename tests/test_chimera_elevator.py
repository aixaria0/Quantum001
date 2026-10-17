from __future__ import annotations

import json

from chimera_quantum.assurance import verify_final_certificate, verify_package
from chimera_quantum.elevator import run_elevator
from chimera_quantum.omega_bridge import omega_digest


def test_omega_claim_digest_matches_checked_in_omega_fixture():
    claim = {
        "assumptions": [
            "State digest positions refer to corresponding boundaries.",
            "The caller obtains the expected package digest through its own review process.",
        ],
        "epistemic_state": "HYPOTHESIS",
        "id": "fixture.trace-equality",
        "limitations": [
            "AI-generated synthetic fixture; repeated-digit digest tokens are placeholders, not measurements or claims of existing raw artifacts."
        ],
        "predicate": {
            "expected": "expected",
            "kind": "trace_equality",
            "negative_controls": ["control"],
            "observed": ["observed"],
        },
        "schema": "chimera-claim/v2",
        "statement": "The supplied observed state-commitment sequence equals the supplied expected sequence.",
        "target": {
            "configuration": "3333333333333333333333333333333333333333333333333333333333333333",
            "environment": "4444444444444444444444444444444444444444444444444444444444444444",
            "revision": "fixture-v1",
            "system": "synthetic-state-trace",
        },
    }
    assert omega_digest("claim/v2", claim) == "60e9ae9bd440c6bc44a407911624e5a0a3652a71eed5ccfff6bacb80da47bb10"


def test_full_elevator_produces_signed_two_process_pass(tmp_path):
    result = run_elevator(tmp_path / "elevator", seed=7)
    assert result["status"] == "PASS"
    assert result["distinct_verifier_processes"] == 2
    assert result["distinct_verifier_identities"] == 2
    assert result["qpu_execution"] == "UNKNOWN"

    root = tmp_path / "elevator"
    package = json.loads((root / "assurance-package.json").read_text(encoding="utf-8"))
    certificate = json.loads((root / "final-certificate.json").read_text(encoding="utf-8"))
    assert verify_package(package)["supported"] is True
    assert verify_final_certificate(certificate) is True


def test_package_tamper_is_refuted(tmp_path):
    run_elevator(tmp_path / "elevator", seed=11)
    root = tmp_path / "elevator"
    package = json.loads((root / "assurance-package.json").read_text(encoding="utf-8"))
    package["evidence"]["final_state"]["state_hash"] = "sha256:" + "0" * 64
    report = verify_package(package)
    assert report["supported"] is False
    assert report["checks"]["state_receipt_binding"] is False
