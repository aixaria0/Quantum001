from __future__ import annotations

import json

from chimera_quantum.cxp import build_cxp_run, validate_cxp_run
from chimera_quantum.elevator import run_elevator


def test_elevator_exports_valid_cxp(tmp_path):
    workspace = tmp_path / "elevator"
    result = run_elevator(workspace, seed=11)
    assert result["status"] == "PASS"
    run = build_cxp_run(workspace, objective="verify quantum lane")
    report = validate_cxp_run(run)
    assert report["valid"] is True
    assert run["schema"] == "chimera-run/v2"
    assert run["certificate"]["status"] == "ASSURED"
    assert run["authority"]["two_process_quorum"] == "CONFIRMED"
    assert run["authority"]["qpu_execution"] == "UNKNOWN"
    assert run["claims"][0]["status"] == "HYPOTHESIS"


def test_cxp_rejects_claim_promotion_even_if_digest_repaired(tmp_path):
    workspace = tmp_path / "elevator"
    run_elevator(workspace, seed=12)
    run = build_cxp_run(workspace)
    run["claims"][0]["status"] = "TRUE"
    from chimera_quantum.cxp import cxp_digest
    run["cxp_sha256"] = cxp_digest(run)
    report = validate_cxp_run(run)
    assert report["valid"] is False
    assert "claim_promotion" in report["errors"]


def test_cxp_rejects_digest_tamper(tmp_path):
    workspace = tmp_path / "elevator"
    run_elevator(workspace, seed=13)
    run = build_cxp_run(workspace)
    run["execution"]["qubits"] = 11
    report = validate_cxp_run(run)
    assert report["valid"] is False
    assert "cxp_digest" in report["errors"]
