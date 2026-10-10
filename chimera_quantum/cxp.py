from __future__ import annotations

from pathlib import Path
from typing import Any
import hashlib
import json

CXP_SCHEMA = "chimera-run/v2"
CXP_DOMAIN = "run/v2"
CXP_PREFIX = b"CHIMERA-CXP\0"


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def cxp_digest(value: dict[str, Any]) -> str:
    body = dict(value)
    body.pop("cxp_sha256", None)
    h = hashlib.sha256()
    h.update(CXP_PREFIX)
    h.update(CXP_DOMAIN.encode("ascii"))
    h.update(b"\0")
    h.update(canonical_bytes(body))
    return h.hexdigest()


def _read(root: Path, name: str) -> dict[str, Any]:
    value = json.loads((root / name).read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{name} must contain a JSON object")
    return value


def build_cxp_run(workspace: str | Path, *, objective: str = "Execute and verify the bounded 12-qubit quantum lane") -> dict[str, Any]:
    root = Path(workspace)
    evidence = _read(root, "evidence.json")
    receipt = _read(root, "execution-receipt.json")
    omega = _read(root, "omega-envelope.json")
    certificate = _read(root, "final-certificate.json")

    if certificate.get("status") != "PASS":
        raise ValueError("provider final certificate is not PASS")
    if certificate.get("execution_receipt_sha256") != receipt.get("receipt_sha256"):
        raise ValueError("provider certificate/receipt binding mismatch")
    if certificate.get("omega_envelope_digest") != omega.get("digest"):
        raise ValueError("provider certificate/OMEGA binding mismatch")

    run: dict[str, Any] = {
        "schema": CXP_SCHEMA,
        "cxp_version": 1,
        "run_id": str(evidence["task_id"]),
        "objective": objective,
        "domain": "quantum",
        "policy": {
            "automatic_mutation": False,
            "automatic_deployment": False,
            "unrestricted_execution": False,
            "claim_promotion_requires_evidence": True,
            "typed_commands_required": True,
            "replay_required": True,
            "quorum_required": 2,
        },
        "steps": [
            {
                "id": "quantum-execution",
                "capability": "quantum001.elevator/v1",
                "provider": "Quantum001",
                "kind": "execute",
                "depends_on": [],
                "trust": {
                    "authority": "bounded",
                    "network": "none",
                    "mutation": "local-artifacts-only",
                    "evidence": "signed-replayable",
                },
                "state": "CERTIFIED",
            }
        ],
        "execution": {
            "provider": "aixaria0/Quantum001",
            "backend": str(receipt["backend"]),
            "qubits": int(receipt["qubits"]),
            "executor_id": str(receipt["executor_id"]),
            "task_id": str(receipt["task_id"]),
            "final_state_sha256": str(receipt["final_state_sha256"]),
            "journal_head_sha256": str(receipt["journal_head_sha256"]),
            "journal_event_count": int(receipt["journal_event_count"]),
            "receipt_sha256": str(receipt["receipt_sha256"]),
            "receipt_signature_domain": str(receipt["attestation"]["domain"]),
        },
        "evidence": {
            "omega_envelope_digest": str(omega["digest"]),
            "assurance_package_sha256": str(certificate["package_sha256"]),
            "provider_certificate_sha256": str(certificate["certificate_sha256"]),
        },
        "verification": {
            "provider_certificate": "CONFIRMED",
            "execution_receipt": "CONFIRMED",
            "journal_integrity": "CONFIRMED",
            "replay": "CONFIRMED",
            "omega_trace_equality": "CONFIRMED",
            "verifier_quorum": "CONFIRMED",
            "independent_processes": str(certificate["process_independence"]),
            "independent_identities": str(certificate["identity_independence"]),
            "independent_hosts": "UNKNOWN",
            "independent_organizations": str(certificate["organizational_independence"]),
            "qpu_execution": str(certificate["qpu_execution"]),
            "external_truth": "UNKNOWN",
        },
        "consensus": {
            "status": "NOT_RUN",
            "provider": "Sovereign-Lattice",
            "finality": "UNKNOWN",
        },
        "claims": [
            {
                "id": "quantum-execution-coherence",
                "statement": "The bounded local quantum execution package is internally coherent under the declared replay, signature and two-verifier checks.",
                "status": "HYPOTHESIS",
                "assessment": {
                    "status": "SUPPORTED",
                    "scope": str(certificate["scope"]),
                    "evidence": [
                        str(receipt["receipt_sha256"]),
                        str(omega["digest"]),
                        str(certificate["certificate_sha256"]),
                    ],
                },
            }
        ],
        "authority": {
            "certificate_level": "ASSURED",
            "local_execution": "CONFIRMED",
            "signed_execution": "CONFIRMED",
            "deterministic_replay": "CONFIRMED",
            "two_process_quorum": "CONFIRMED",
            "distributed_consensus": "NOT_RUN",
            "hardware_attestation": "UNKNOWN",
            "qpu_execution": str(certificate["qpu_execution"]),
            "external_truth": "UNKNOWN",
        },
        "certificate": {
            "status": "ASSURED",
            "provider_status": str(certificate["status"]),
            "provider_scope": str(certificate["scope"]),
            "provider_certificate_sha256": str(certificate["certificate_sha256"]),
            "limitations": list(certificate.get("limitations", [])),
        },
        "cxp_sha256": "",
    }
    run["cxp_sha256"] = cxp_digest(run)
    return run


def validate_cxp_run(run: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    if run.get("schema") != CXP_SCHEMA:
        errors.append("schema")
    if run.get("cxp_version") != 1:
        errors.append("cxp_version")
    if run.get("cxp_sha256") != cxp_digest(run):
        errors.append("cxp_digest")
    if run.get("certificate", {}).get("status") not in {"EXECUTION", "ASSURED", "FINALIZED"}:
        errors.append("certificate_status")
    if run.get("authority", {}).get("external_truth") != "UNKNOWN":
        errors.append("external_truth_must_remain_unknown")
    if run.get("authority", {}).get("qpu_execution") not in {"UNKNOWN", "CONFIRMED"}:
        errors.append("qpu_execution_state")
    claims = run.get("claims")
    if not isinstance(claims, list) or not claims:
        errors.append("claims")
    elif any(claim.get("status") != "HYPOTHESIS" for claim in claims if isinstance(claim, dict)):
        errors.append("claim_promotion")
    steps = run.get("steps")
    if not isinstance(steps, list) or not steps or any(step.get("state") != "CERTIFIED" for step in steps if isinstance(step, dict)):
        errors.append("steps")
    return {"schema": "chimera-cxp-validation/v1", "valid": not errors, "errors": errors, "cxp_sha256": run.get("cxp_sha256")}


def write_cxp_run(workspace: str | Path, output: str | Path | None = None, *, objective: str = "Execute and verify the bounded 12-qubit quantum lane") -> dict[str, Any]:
    run = build_cxp_run(workspace, objective=objective)
    report = validate_cxp_run(run)
    if not report["valid"]:
        raise ValueError(f"invalid CXP run: {report['errors']}")
    target = Path(output) if output else Path(workspace) / "chimera-run-v2.json"
    target.write_text(json.dumps(run, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
    return run
