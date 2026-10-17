from __future__ import annotations

from copy import deepcopy
from typing import Any, Mapping
import hashlib
import json
import math

from .identity import PersistentEd25519Identity, SIGNING_ALGORITHM

JOB_SCHEMA = "smm-q/epistemic-job-v1"
ISING_SCHEMA = "smm-q/ising-v1"
REQUEST_SCHEMA = "smm-q/execution-request-v1"
RECEIPT_SCHEMA = "smm-q/quantum001-execution-receipt/v1"
RECEIPT_SIGNATURE_DOMAIN = "smm-q.quantum001-execution-receipt.v1"
MAX_VARIABLES = 12
MAX_SHOTS = 50_000


def canonical_json(value: Any) -> str:
    """Canonical JSON shared with SMM's sorted-key stable serializer for bounded wire values."""
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)


def canonical_bytes(value: Any) -> bytes:
    return canonical_json(value).encode("utf-8")


def sha256_hex(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def object_digest(value: Any) -> str:
    return sha256_hex(canonical_bytes(value))


def _finite(value: Any, label: str) -> float:
    if isinstance(value, bool):
        raise ValueError(f"{label} must be a finite number")
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{label} must be a finite number") from exc
    if not math.isfinite(number) or abs(number) > 1_000_000:
        raise ValueError(f"{label} must be finite and bounded")
    return number


def _hex64(value: Any, label: str) -> str:
    text = str(value or "").lower()
    if len(text) != 64 or any(ch not in "0123456789abcdef" for ch in text):
        raise ValueError(f"{label} must be a 64-character lowercase hex digest")
    return text


def _verify_embedded_digest(value: Mapping[str, Any], label: str) -> str:
    supplied = _hex64(value.get("digest"), f"{label}.digest")
    body = {key: deepcopy(item) for key, item in value.items() if key != "digest"}
    expected = object_digest(body)
    if supplied != expected:
        raise ValueError(f"{label} digest mismatch")
    return supplied


def validate_smmq_job(raw: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(raw, Mapping) or raw.get("schema") != JOB_SCHEMA:
        raise ValueError("unsupported SMM-Q job schema")
    job = deepcopy(dict(raw))
    _hex64(job.get("graphDigest"), "graphDigest")
    _hex64(job.get("quboDigest"), "quboDigest")

    ising = job.get("ising")
    if not isinstance(ising, Mapping) or ising.get("schema") != ISING_SCHEMA:
        raise ValueError("missing or unsupported Ising payload")
    ising = deepcopy(dict(ising))
    variables = ising.get("variables")
    h = ising.get("h")
    couplings = ising.get("couplings")
    if not isinstance(variables, list) or not 1 <= len(variables) <= MAX_VARIABLES:
        raise ValueError(f"variables must contain 1..{MAX_VARIABLES} entries")
    if not isinstance(h, list) or len(h) != len(variables):
        raise ValueError("Ising h vector must match variable count")
    if not isinstance(couplings, list):
        raise ValueError("Ising couplings must be a list")

    claim_ids: set[str] = set()
    for index, variable in enumerate(variables):
        if not isinstance(variable, Mapping) or variable.get("index") != index:
            raise ValueError("variables must use contiguous zero-based indexes")
        claim_id = str(variable.get("claimId") or "").strip()
        if not claim_id or claim_id in claim_ids or len(claim_id) > 120:
            raise ValueError("claim IDs must be non-empty and unique")
        claim_ids.add(claim_id)
        _finite(variable.get("utility", 0), f"variables[{index}].utility")
        _finite(h[index], f"h[{index}]")

    seen_pairs: set[tuple[int, int]] = set()
    for position, coupling in enumerate(couplings):
        if not isinstance(coupling, Mapping):
            raise ValueError("coupling entries must be objects")
        i, j = coupling.get("i"), coupling.get("j")
        if not isinstance(i, int) or not isinstance(j, int) or not (0 <= i < j < len(variables)):
            raise ValueError("couplings must use ordered in-range indexes")
        if (i, j) in seen_pairs:
            raise ValueError("duplicate Ising coupling")
        seen_pairs.add((i, j))
        _finite(coupling.get("value"), f"couplings[{position}].value")

    _finite(ising.get("offset", 0), "ising.offset")
    _verify_embedded_digest(ising, "ising")
    job["ising"] = ising
    _verify_embedded_digest(job, "job")
    return job


def validate_execution_request(raw: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(raw, Mapping) or raw.get("schema") != REQUEST_SCHEMA:
        raise ValueError("unsupported SMM-Q execution request schema")
    request = deepcopy(dict(raw))
    request["job"] = validate_smmq_job(request.get("job") or {})
    parameters = request.get("parameters")
    if not isinstance(parameters, Mapping):
        raise ValueError("parameters are required")
    gammas = parameters.get("gammas")
    betas = parameters.get("betas")
    if not isinstance(gammas, list) or not isinstance(betas, list) or not 1 <= len(gammas) <= 2 or len(gammas) != len(betas):
        raise ValueError("QAOA parameters require matching gamma/beta arrays with depth 1..2")
    request["parameters"] = {
        "gammas": [_finite(value, f"gamma[{index}]") for index, value in enumerate(gammas)],
        "betas": [_finite(value, f"beta[{index}]") for index, value in enumerate(betas)],
    }
    shots = request.get("shots", 1024)
    if isinstance(shots, bool) or not isinstance(shots, int) or not 1 <= shots <= MAX_SHOTS:
        raise ValueError(f"shots must be an integer in [1, {MAX_SHOTS}]")
    request["shots"] = shots
    if "source" in request and not isinstance(request["source"], Mapping):
        raise ValueError("source must be an object when supplied")
    return request


def ising_energy(job: Mapping[str, Any], bits: list[int]) -> float:
    ising = job["ising"]
    n = len(ising["variables"])
    if len(bits) != n or any(bit not in (0, 1) for bit in bits):
        raise ValueError("bit vector does not match Ising variable count")
    spins = [1.0 - 2.0 * bit for bit in bits]
    energy = float(ising.get("offset", 0))
    energy += sum(float(ising["h"][i]) * spins[i] for i in range(n))
    for term in ising["couplings"]:
        energy += float(term["value"]) * spins[term["i"]] * spins[term["j"]]
    return float(energy)


def qaoa_gate_spec(request: Mapping[str, Any]) -> list[dict[str, Any]]:
    request = validate_execution_request(request)
    ising = request["job"]["ising"]
    n = len(ising["variables"])
    gates: list[dict[str, Any]] = [{"gate": "H", "target": q} for q in range(n)]
    for layer, (gamma, beta) in enumerate(zip(request["parameters"]["gammas"], request["parameters"]["betas"])):
        for q, field in enumerate(ising["h"]):
            angle = 2.0 * gamma * float(field)
            if abs(angle) > 1e-15:
                gates.append({"gate": "RZ", "target": q, "angle": angle, "layer": layer})
        for term in ising["couplings"]:
            angle = 2.0 * gamma * float(term["value"])
            if abs(angle) > 1e-15:
                gates.append({"gate": "ZZ", "targets": [term["i"], term["j"]], "angle": angle, "layer": layer})
        for q in range(n):
            gates.append({"gate": "RX", "target": q, "angle": 2.0 * beta, "layer": layer})
    return gates


def _bits_from_measurement(bitstring: str, measured_qubits: list[int], n: int) -> list[int]:
    if len(bitstring) != len(measured_qubits) or any(ch not in "01" for ch in bitstring):
        raise ValueError("invalid measurement bitstring")
    if sorted(measured_qubits) != list(range(n)) or len(set(measured_qubits)) != n:
        raise ValueError("execution must measure every SMM-Q variable exactly once")
    bits = [0] * n
    for char, qubit in zip(bitstring, measured_qubits):
        bits[qubit] = int(char)
    return bits


def summarize_measurements(job: Mapping[str, Any], counts: Mapping[str, int], measured_qubits: list[int]) -> dict[str, Any]:
    job = validate_smmq_job(job)
    n = len(job["ising"]["variables"])
    if not isinstance(counts, Mapping) or not counts:
        raise ValueError("measurement counts are required")
    rows = []
    total = 0
    for bitstring, raw_count in counts.items():
        if isinstance(raw_count, bool) or not isinstance(raw_count, int) or raw_count <= 0:
            raise ValueError("measurement counts must be positive integers")
        bits = _bits_from_measurement(str(bitstring), measured_qubits, n)
        energy = ising_energy(job, bits)
        selected = [job["ising"]["variables"][i]["claimId"] for i, bit in enumerate(bits) if bit]
        rows.append({"bitstring": str(bitstring), "bits": bits, "count": raw_count, "energy": energy, "selected": selected})
        total += raw_count
    mode = sorted(rows, key=lambda row: (-row["count"], row["bitstring"]))[0]
    best = sorted(rows, key=lambda row: (row["energy"], -row["count"], row["bitstring"]))[0]
    normalized_counts = {key: int(counts[key]) for key in sorted(counts)}
    return {
        "shots": total,
        "counts_sha256": object_digest(normalized_counts),
        "mode": mode,
        "best_observed": best,
    }


def build_signed_smmq_receipt(
    request: Mapping[str, Any],
    execution: Mapping[str, Any],
    identity: PersistentEd25519Identity,
) -> dict[str, Any]:
    request = validate_execution_request(request)
    measured_qubits = [int(value) for value in execution.get("measured_qubits", [])]
    summary = summarize_measurements(request["job"], execution.get("measurement_counts") or {}, measured_qubits)
    if summary["shots"] != request["shots"]:
        raise ValueError("observed shot count does not match execution request")
    execution_class = str(execution.get("execution_class") or "unknown")
    body = {
        "schema": RECEIPT_SCHEMA,
        "request_sha256": object_digest(request),
        "job_digest": request["job"]["digest"],
        "graph_digest": request["job"]["graphDigest"],
        "qubo_digest": request["job"]["quboDigest"],
        "backend": str(execution.get("backend") or "unknown"),
        "device": str(execution.get("device") or "unknown"),
        "execution_class": execution_class,
        "task_id": str(execution.get("task_id") or "unknown"),
        "shots": request["shots"],
        "parameters": request["parameters"],
        "measured_qubits": measured_qubits,
        "counts_sha256": summary["counts_sha256"],
        "mode": summary["mode"],
        "best_observed": summary["best_observed"],
        "qpu_execution_claimed": execution_class == "qpu",
        "authority": {
            "executor_signature": "SIGNED",
            "cloud_task_identity": "RECORDED_NOT_INDEPENDENTLY_VERIFIED",
            "physical_qpu_execution": "SELF_REPORTED" if execution_class == "qpu" else "NOT_CLAIMED",
            "external_truth": "UNKNOWN",
        },
    }
    receipt_sha256 = object_digest(body)
    info = identity.info()
    attestation = {
        "algorithm": SIGNING_ALGORITHM,
        "domain": RECEIPT_SIGNATURE_DOMAIN,
        "public_key_hex": info.public_key_hex,
        "key_fingerprint_sha256": info.fingerprint_sha256,
        "signature_hex": identity.sign_domain(RECEIPT_SIGNATURE_DOMAIN, receipt_sha256.encode("ascii")),
    }
    return {**body, "receipt_sha256": receipt_sha256, "attestation": attestation}


def verify_signed_smmq_receipt(receipt: Mapping[str, Any]) -> dict[str, bool]:
    try:
        body = {key: deepcopy(value) for key, value in receipt.items() if key not in {"receipt_sha256", "attestation"}}
        digest_matches = receipt.get("receipt_sha256") == object_digest(body)
        attestation = receipt.get("attestation") or {}
        algorithm_supported = attestation.get("algorithm") == SIGNING_ALGORITHM
        domain_matches = attestation.get("domain") == RECEIPT_SIGNATURE_DOMAIN
        fingerprint_matches = (
            PersistentEd25519Identity.fingerprint_public_key_hex(str(attestation.get("public_key_hex", "")))
            == attestation.get("key_fingerprint_sha256")
        )
        signature_valid = algorithm_supported and domain_matches and PersistentEd25519Identity.verify_domain(
            str(attestation.get("public_key_hex", "")),
            str(attestation.get("signature_hex", "")),
            RECEIPT_SIGNATURE_DOMAIN,
            str(receipt.get("receipt_sha256", "")).encode("ascii"),
        )
        schema_valid = receipt.get("schema") == RECEIPT_SCHEMA
        valid = digest_matches and algorithm_supported and domain_matches and fingerprint_matches and signature_valid and schema_valid
    except (TypeError, ValueError, KeyError):
        digest_matches = algorithm_supported = domain_matches = fingerprint_matches = signature_valid = schema_valid = valid = False
    return {
        "digest_matches": digest_matches,
        "algorithm_supported": algorithm_supported,
        "domain_matches": domain_matches,
        "fingerprint_matches": fingerprint_matches,
        "signature_valid": signature_valid,
        "schema_valid": schema_valid,
        "valid": valid,
    }
