from __future__ import annotations

from dataclasses import asdict
from typing import Any
import hashlib
import json
import os

from .identity import PersistentEd25519Identity, SIGNING_ALGORITHM
from .journal import JournalEvent, QuantumJournal
from .omega_bridge import verify_omega_envelope
from .receipt import canonical_bytes, verify_signed_receipt

VERIFIER_DOMAIN = "chimera.quantum-verifier-receipt.v1"
CERTIFICATE_DOMAIN = "chimera.quantum-final-certificate.v1"
RCHAIN_SEMANTICS_SOURCE = "aixaria0/RCHAIN-COMPLIER@3f1ffb5901288500294230314004d04a6d863a13"


def package_digest(package: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_bytes(package)).hexdigest()


def build_assurance_package(evidence: dict[str, Any], execution_receipt: dict[str, Any], omega_envelope: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema": "chimera-quantum-assurance-package/v1",
        "evidence": evidence,
        "execution_receipt": execution_receipt,
        "omega_envelope": omega_envelope,
    }


def verify_package(package: dict[str, Any]) -> dict[str, Any]:
    checks: dict[str, bool] = {}
    checks["schema"] = package.get("schema") == "chimera-quantum-assurance-package/v1"
    evidence = package.get("evidence") or {}
    receipt = package.get("execution_receipt") or {}
    omega = package.get("omega_envelope") or {}

    receipt_report = verify_signed_receipt(receipt) if isinstance(receipt, dict) else {"valid": False}
    checks["execution_receipt_signature"] = bool(receipt_report.get("valid"))

    try:
        raw_events = evidence["journal"]["events"]
        events = [JournalEvent(**event) for event in raw_events]
        journal_report = QuantumJournal.verify(events)
        checks["journal_chain"] = bool(journal_report["valid"])
        checks["journal_receipt_binding"] = (
            receipt.get("journal_head_sha256") == journal_report["head_hash"]
            and receipt.get("journal_event_count") == journal_report["event_count"]
        )
        checks["state_receipt_binding"] = receipt.get("final_state_sha256") == evidence["final_state"]["state_hash"]
    except (KeyError, TypeError, ValueError):
        checks["journal_chain"] = False
        checks["journal_receipt_binding"] = False
        checks["state_receipt_binding"] = False

    try:
        omega_report = verify_omega_envelope(omega, str(omega["digest"]))
        checks["omega_trace_equality"] = omega_report.get("status") == "LOCALLY_SUPPORTED"
        observed_id = omega["claim"]["predicate"]["observed"][0]
        observed = next(node for node in omega["evidence"] if node["body"]["id"] == observed_id)
        trace = observed["body"]["payload"]["states"]
        final_commitment = str(receipt.get("final_state_sha256", "")).removeprefix("sha256:")
        checks["omega_receipt_binding"] = bool(trace) and trace[-1] == final_commitment
    except (KeyError, StopIteration, TypeError, ValueError):
        omega_report = {"status": "REJECTED"}
        checks["omega_trace_equality"] = False
        checks["omega_receipt_binding"] = False

    supported = all(checks.values())
    return {
        "schema": "chimera-quantum-package-verification/v1",
        "supported": supported,
        "checks": checks,
        "receipt_report": receipt_report,
        "omega_report": omega_report,
        "limitations": [
            "Verification is local deterministic reproduction, not independent organizational observation.",
            "A valid local certificate does not establish QPU execution unless separately evidenced.",
        ],
    }


def _verifier_body(receipt: dict[str, Any]) -> dict[str, Any]:
    fields = (
        "schema",
        "verifier_label",
        "process_id",
        "package_sha256",
        "verdict",
        "checks",
        "execution_receipt_sha256",
        "omega_envelope_digest",
    )
    return {field: receipt[field] for field in fields}


def _signed_digest(domain: str, body: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_bytes(body)).hexdigest()


def issue_verifier_receipt(package: dict[str, Any], identity: PersistentEd25519Identity, verifier_label: str) -> dict[str, Any]:
    verification = verify_package(package)
    verdict = "SUPPORTED" if verification["supported"] else "REFUTED"
    body = {
        "schema": "chimera-quantum-verifier-receipt/v1",
        "verifier_label": verifier_label,
        "process_id": os.getpid(),
        "package_sha256": package_digest(package),
        "verdict": verdict,
        "checks": verification["checks"],
        "execution_receipt_sha256": package["execution_receipt"]["receipt_sha256"],
        "omega_envelope_digest": package["omega_envelope"]["digest"],
    }
    digest = _signed_digest(VERIFIER_DOMAIN, body)
    info = identity.info()
    return {
        **body,
        "receipt_sha256": digest,
        "attestation": {
            "algorithm": SIGNING_ALGORITHM,
            "domain": VERIFIER_DOMAIN,
            "public_key_hex": info.public_key_hex,
            "key_fingerprint_sha256": info.fingerprint_sha256,
            "signature_hex": identity.sign_domain(VERIFIER_DOMAIN, digest.encode("ascii")),
        },
    }


def verify_verifier_receipt(receipt: dict[str, Any], expected_package_digest: str) -> bool:
    try:
        body = _verifier_body(receipt)
        digest = _signed_digest(VERIFIER_DOMAIN, body)
        attestation = receipt["attestation"]
        fingerprint = PersistentEd25519Identity.fingerprint_public_key_hex(attestation["public_key_hex"])
        return bool(
            receipt["receipt_sha256"] == digest
            and receipt["package_sha256"] == expected_package_digest
            and attestation["algorithm"] == SIGNING_ALGORITHM
            and attestation["domain"] == VERIFIER_DOMAIN
            and fingerprint == attestation["key_fingerprint_sha256"]
            and PersistentEd25519Identity.verify_domain(
                attestation["public_key_hex"],
                attestation["signature_hex"],
                VERIFIER_DOMAIN,
                digest.encode("ascii"),
            )
        )
    except (KeyError, TypeError, ValueError):
        return False


def _certificate_body(certificate: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in certificate.items() if key not in {"certificate_sha256", "attestation"}}


def finalize_certificate(
    package: dict[str, Any],
    verifier_receipts: list[dict[str, Any]],
    coordinator: PersistentEd25519Identity,
    *,
    quorum: int = 2,
) -> dict[str, Any]:
    digest = package_digest(package)
    valid = [receipt for receipt in verifier_receipts if verify_verifier_receipt(receipt, digest)]
    fingerprints = {receipt["attestation"]["key_fingerprint_sha256"] for receipt in valid}
    process_ids = {int(receipt["process_id"]) for receipt in valid}
    supported = [receipt for receipt in valid if receipt["verdict"] == "SUPPORTED"]
    refuted = [receipt for receipt in valid if receipt["verdict"] == "REFUTED"]
    process_independence = len(process_ids) >= quorum
    identity_independence = len(fingerprints) >= quorum

    if len(supported) >= quorum and process_independence and identity_independence:
        status = "PASS"
    elif len(refuted) >= quorum and process_independence and identity_independence:
        status = "FAIL"
    else:
        status = "BLOCKED"

    certificate: dict[str, Any] = {
        "schema": "chimera-quantum-final-certificate/v1",
        "status": status,
        "scope": "LOCAL_SIGNED_QUANTUM_EXECUTION_REPLAY_AND_TWO_PROCESS_VERIFICATION",
        "package_sha256": digest,
        "execution_receipt_sha256": package["execution_receipt"]["receipt_sha256"],
        "omega_envelope_digest": package["omega_envelope"]["digest"],
        "quorum_required": quorum,
        "valid_verifier_receipts": len(valid),
        "supporting_verifier_receipts": len(supported),
        "distinct_verifier_identities": len(fingerprints),
        "distinct_verifier_processes": len(process_ids),
        "process_independence": "CONFIRMED" if process_independence else "NOT_CONFIRMED",
        "identity_independence": "CONFIRMED" if identity_independence else "NOT_CONFIRMED",
        "organizational_independence": "UNKNOWN",
        "qpu_execution": "UNKNOWN",
        "rchain_semantics_source": RCHAIN_SEMANTICS_SOURCE,
        "verifier_receipts": verifier_receipts,
        "limitations": [
            "Distinct local processes and keys do not establish independent organizations or hosts.",
            "PASS is bounded to the included package, replay, signatures and trace equality.",
            "QPU execution remains UNKNOWN until a separately authenticated hardware/backend receipt is bound.",
        ],
    }
    body = _certificate_body(certificate)
    certificate_digest = _signed_digest(CERTIFICATE_DOMAIN, body)
    info = coordinator.info()
    certificate["certificate_sha256"] = certificate_digest
    certificate["attestation"] = {
        "algorithm": SIGNING_ALGORITHM,
        "domain": CERTIFICATE_DOMAIN,
        "public_key_hex": info.public_key_hex,
        "key_fingerprint_sha256": info.fingerprint_sha256,
        "signature_hex": coordinator.sign_domain(CERTIFICATE_DOMAIN, certificate_digest.encode("ascii")),
    }
    return certificate


def verify_final_certificate(certificate: dict[str, Any]) -> bool:
    try:
        body = _certificate_body(certificate)
        digest = _signed_digest(CERTIFICATE_DOMAIN, body)
        attestation = certificate["attestation"]
        fingerprint = PersistentEd25519Identity.fingerprint_public_key_hex(attestation["public_key_hex"])
        return bool(
            certificate["certificate_sha256"] == digest
            and attestation["algorithm"] == SIGNING_ALGORITHM
            and attestation["domain"] == CERTIFICATE_DOMAIN
            and fingerprint == attestation["key_fingerprint_sha256"]
            and PersistentEd25519Identity.verify_domain(
                attestation["public_key_hex"],
                attestation["signature_hex"],
                CERTIFICATE_DOMAIN,
                digest.encode("ascii"),
            )
        )
    except (KeyError, TypeError, ValueError):
        return False
