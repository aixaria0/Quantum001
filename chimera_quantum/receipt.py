from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any
import hashlib
import json

from .engine import QuantumEngine
from .evidence import EvidenceBoundRuntime
from .identity import PersistentEd25519Identity, SIGNING_ALGORITHM

RECEIPT_SIGNATURE_DOMAIN = "chimera.quantum-execution-receipt.v1"
EXECUTOR_ID = "chimera-quantum-python-v1"

POLICY = {
    "schema": "chimera-quantum-policy/v1",
    "max_qubits": 12,
    "allowed_ops": ["prepare_ghz", "zero", "h", "x", "cnot", "measure_all", "inspect"],
    "requires_typed_commands": True,
    "requires_replay_match": True,
    "requires_journal_integrity": True,
}


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def sha256_hex(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def policy_digest() -> str:
    return sha256_hex(canonical_bytes(POLICY))


@dataclass(frozen=True)
class ReceiptAttestation:
    algorithm: str
    domain: str
    public_key_hex: str
    key_fingerprint_sha256: str
    signature_hex: str


RECEIPT_FIELDS = (
    "receipt_version",
    "task_id",
    "backend",
    "qubits",
    "command_manifest_sha256",
    "final_state_sha256",
    "journal_head_sha256",
    "journal_event_count",
    "replay_state_sha256",
    "policy_sha256",
    "executor_id",
    "verified",
)


def _body(receipt: dict[str, Any]) -> dict[str, Any]:
    return {field: receipt[field] for field in RECEIPT_FIELDS}


def receipt_digest(receipt: dict[str, Any]) -> str:
    return sha256_hex(canonical_bytes(_body(receipt)))


def _command_manifest(evidence: dict[str, Any]) -> list[str]:
    events = evidence["journal"]["events"]
    return [event["payload_json"] for event in events if event["event_type"] == "COMMAND_EXECUTED"]


def build_signed_receipt(bound: EvidenceBoundRuntime, identity: PersistentEd25519Identity) -> dict[str, Any]:
    evidence = bound.export()
    backend = bound.runtime.backend
    engine = getattr(backend, "engine", None)
    if not isinstance(engine, QuantumEngine):
        raise ValueError("signed local receipt currently requires the NumPy QuantumEngine backend")

    replay = QuantumEngine.replay(engine.qubits, engine.seed, engine.events)
    replay_hash = replay.state_hash()
    final_hash = engine.state_hash()
    journal_verification = evidence["journal"]["verification"]
    verified = bool(
        journal_verification["valid"]
        and replay_hash == final_hash
        and abs(engine.norm() - 1.0) <= 1e-12
    )
    manifest = _command_manifest(evidence)
    receipt: dict[str, Any] = {
        "schema": "chimera-quantum-execution-receipt/v1",
        "receipt_version": 1,
        "receipt_sha256": "",
        "task_id": bound.task_id,
        "backend": backend.name,
        "qubits": engine.qubits,
        "command_manifest_sha256": sha256_hex(canonical_bytes(manifest)),
        "final_state_sha256": final_hash,
        "journal_head_sha256": journal_verification["head_hash"],
        "journal_event_count": int(journal_verification["event_count"]),
        "replay_state_sha256": replay_hash,
        "policy_sha256": policy_digest(),
        "executor_id": EXECUTOR_ID,
        "verified": verified,
        "attestation": None,
    }
    receipt["receipt_sha256"] = receipt_digest(receipt)
    info = identity.info()
    receipt["attestation"] = asdict(
        ReceiptAttestation(
            algorithm=SIGNING_ALGORITHM,
            domain=RECEIPT_SIGNATURE_DOMAIN,
            public_key_hex=info.public_key_hex,
            key_fingerprint_sha256=info.fingerprint_sha256,
            signature_hex=identity.sign_domain(RECEIPT_SIGNATURE_DOMAIN, receipt["receipt_sha256"].encode("ascii")),
        )
    )
    return receipt


def verify_signed_receipt(receipt: dict[str, Any]) -> dict[str, bool]:
    try:
        digest_matches = receipt.get("receipt_sha256") == receipt_digest(receipt)
        attestation = receipt.get("attestation") or {}
        algorithm_supported = attestation.get("algorithm") == SIGNING_ALGORITHM
        domain_matches = attestation.get("domain") == RECEIPT_SIGNATURE_DOMAIN
        fingerprint = PersistentEd25519Identity.fingerprint_public_key_hex(str(attestation.get("public_key_hex", "")))
        fingerprint_matches = fingerprint == attestation.get("key_fingerprint_sha256")
        signature_valid = algorithm_supported and domain_matches and PersistentEd25519Identity.verify_domain(
            str(attestation.get("public_key_hex", "")),
            str(attestation.get("signature_hex", "")),
            RECEIPT_SIGNATURE_DOMAIN,
            str(receipt.get("receipt_sha256", "")).encode("ascii"),
        )
        semantic_binding = (
            receipt.get("schema") == "chimera-quantum-execution-receipt/v1"
            and receipt.get("policy_sha256") == policy_digest()
            and receipt.get("replay_state_sha256") == receipt.get("final_state_sha256")
            and receipt.get("verified") is True
        )
        valid = digest_matches and algorithm_supported and domain_matches and fingerprint_matches and signature_valid and semantic_binding
    except (KeyError, TypeError, ValueError):
        digest_matches = algorithm_supported = domain_matches = fingerprint_matches = signature_valid = semantic_binding = valid = False
    return {
        "digest_matches": digest_matches,
        "algorithm_supported": algorithm_supported,
        "domain_matches": domain_matches,
        "fingerprint_matches": fingerprint_matches,
        "signature_valid": signature_valid,
        "semantic_binding": semantic_binding,
        "valid": valid,
    }
