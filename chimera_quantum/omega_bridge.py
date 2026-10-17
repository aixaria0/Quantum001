from __future__ import annotations

from copy import deepcopy
from typing import Any
import hashlib
import json

from .engine import QuantumEngine

OMEGA_SOURCE = "aixaria0/CHIMERA-OMEGA@9ab2390364fd8c89f29fa46569b58d33ddb61869"
OMEGA_PREFIX = b"CHIMERA-OMEGA\x00"


def omega_canonical_json(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, int) and not isinstance(value, bool):
        if value < 0 or value > 9_007_199_254_740_991:
            raise ValueError("unsupported number")
        return str(value)
    if isinstance(value, float):
        raise ValueError("unsupported number")
    if isinstance(value, str):
        if len(value.encode("utf-8")) > 4096:
            raise ValueError("string exceeds 4096 bytes")
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(omega_canonical_json(item) for item in value) + "]"
    if isinstance(value, dict):
        pairs: list[str] = []
        for key in sorted(value):
            if not isinstance(key, str) or not key.isascii() or len(key.encode("utf-8")) > 128:
                raise ValueError("invalid object key")
            pairs.append(json.dumps(key, separators=(",", ":")) + ":" + omega_canonical_json(value[key]))
        return "{" + ",".join(pairs) + "}"
    raise TypeError(f"unsupported JSON value: {type(value)!r}")


def omega_digest(domain: str, value: Any) -> str:
    if "\x00" in domain:
        raise ValueError("NUL in hash domain")
    digest = hashlib.sha256()
    digest.update(OMEGA_PREFIX)
    digest.update(domain.encode("utf-8"))
    digest.update(b"\x00")
    digest.update(omega_canonical_json(value).encode("utf-8"))
    return digest.hexdigest()


def _state_commitment(state_hash: str) -> str:
    value = state_hash.removeprefix("sha256:")
    if len(value) != 64 or any(ch not in "0123456789abcdef" for ch in value):
        raise ValueError("invalid state commitment")
    return value


def state_trace(engine: QuantumEngine) -> list[str]:
    replay = QuantumEngine(qubits=engine.qubits, seed=engine.seed)
    trace = [_state_commitment(replay.state_hash())]
    for event in engine.events:
        replay.apply_event(event)
        trace.append(_state_commitment(replay.state_hash()))
    return trace


def _normalize(envelope: dict[str, Any]) -> dict[str, Any]:
    envelope = deepcopy(envelope)
    predicate = envelope["claim"]["predicate"]
    predicate["observed"] = sorted(predicate["observed"])
    predicate["negative_controls"] = sorted(predicate["negative_controls"])
    for node in envelope["evidence"]:
        node["body"]["parents"] = sorted(node["body"]["parents"])
    envelope["evidence"] = sorted(envelope["evidence"], key=lambda node: node["body"]["id"])
    return envelope


def seal_omega_envelope(envelope: dict[str, Any]) -> dict[str, Any]:
    envelope = _normalize(envelope)
    claim_digest = omega_digest("claim/v2", envelope["claim"])
    for node in envelope["evidence"]:
        node["body"]["claim_digest"] = claim_digest
        node["digest"] = omega_digest("evidence-node/v1", node["body"])
    body = {key: value for key, value in envelope.items() if key != "digest"}
    envelope["digest"] = omega_digest("envelope/v2", body)
    return envelope


def build_omega_envelope(engine: QuantumEngine, *, task_id: str) -> dict[str, Any]:
    trace = state_trace(engine)
    configuration = hashlib.sha256(f"qubits={engine.qubits};seed={engine.seed}".encode()).hexdigest()
    environment = hashlib.sha256(b"chimera-quantum-python-v1:numpy-statevector").hexdigest()
    replacement = "f" * 64 if trace[0] != "f" * 64 else "e" * 64
    claim = {
        "schema": "chimera-claim/v2",
        "id": f"quantum.trace.{task_id}",
        "statement": "The supplied observed quantum state-commitment sequence equals the deterministically replayed expected sequence.",
        "epistemic_state": "HYPOTHESIS",
        "target": {
            "system": "chimera-quantum-statevector",
            "revision": "quantum-execution-v1",
            "configuration": configuration,
            "environment": environment,
        },
        "assumptions": [
            "State commitments are SHA-256 digests of local NumPy complex128 state-vector bytes.",
            "The caller obtains the expected envelope digest through an independent review path.",
        ],
        "limitations": [
            "This envelope binds a local classical state-vector replay; it does not establish QPU execution.",
            "Producer identity is not established by the OMEGA trace-equality envelope itself.",
        ],
        "predicate": {
            "kind": "trace_equality",
            "expected": "expected",
            "observed": ["observed"],
            "negative_controls": ["control"],
        },
    }
    evidence = [
        {
            "body": {
                "schema": "chimera-evidence-node/v1",
                "id": "expected",
                "claim_digest": "",
                "parents": [],
                "evidence_class": "RECORDED",
                "producer": {"id": "chimera-quantum-replay", "kind": "PROGRAM"},
                "payload": {"kind": "state_trace", "states": trace},
            },
            "digest": "",
        },
        {
            "body": {
                "schema": "chimera-evidence-node/v1",
                "id": "observed",
                "claim_digest": "",
                "parents": [],
                "evidence_class": "RECORDED",
                "producer": {"id": "chimera-quantum-runtime", "kind": "PROGRAM"},
                "payload": {"kind": "state_trace", "states": trace},
            },
            "digest": "",
        },
        {
            "body": {
                "schema": "chimera-evidence-node/v1",
                "id": "control",
                "claim_digest": "",
                "parents": ["expected", "observed"],
                "evidence_class": "SYNTHETIC",
                "producer": {"id": "chimera-quantum-control", "kind": "PROGRAM"},
                "payload": {
                    "kind": "mutation_control",
                    "baseline": "observed",
                    "index": 0,
                    "replacement": replacement,
                },
            },
            "digest": "",
        },
    ]
    return seal_omega_envelope(
        {
            "schema": "chimera-evidence-envelope/v2",
            "policy": "omega.trace-equality/v1",
            "claim": claim,
            "evidence": evidence,
            "digest": "",
        }
    )


def first_divergence(expected: list[str], observed: list[str]) -> dict[str, Any] | None:
    for index in range(max(len(expected), len(observed))):
        left = expected[index] if index < len(expected) else None
        right = observed[index] if index < len(observed) else None
        if left != right:
            return {
                "index": index,
                "previous": expected[index - 1] if index > 0 and index - 1 < len(expected) else None,
                "expected": left,
                "observed": right,
            }
    return None


def verify_omega_envelope(envelope: dict[str, Any], expected_digest: str) -> dict[str, Any]:
    envelope = _normalize(envelope)
    if envelope.get("schema") != "chimera-evidence-envelope/v2" or envelope.get("policy") != "omega.trace-equality/v1":
        return {"status": "REJECTED", "reason": "schema_or_policy"}
    claim_digest = omega_digest("claim/v2", envelope["claim"])
    for node in envelope["evidence"]:
        if node["body"].get("claim_digest") != claim_digest:
            return {"status": "REJECTED", "reason": "claim_binding"}
        if node.get("digest") != omega_digest("evidence-node/v1", node["body"]):
            return {"status": "REJECTED", "reason": "node_digest"}
    body = {key: value for key, value in envelope.items() if key != "digest"}
    digest = omega_digest("envelope/v2", body)
    if envelope.get("digest") != digest or expected_digest != digest:
        return {"status": "REJECTED", "reason": "envelope_or_pin"}

    nodes = {node["body"]["id"]: node["body"] for node in envelope["evidence"]}
    predicate = envelope["claim"]["predicate"]
    expected = nodes[predicate["expected"]]["payload"]["states"]
    comparisons = []
    for ref in predicate["observed"]:
        divergence = first_divergence(expected, nodes[ref]["payload"]["states"])
        comparisons.append({"evidence_id": ref, "state": "CONTRADICTED" if divergence else "CONFIRMED", "first_divergence": divergence})

    controls = []
    controlled: set[str] = set()
    for ref in predicate["negative_controls"]:
        payload = nodes[ref]["payload"]
        baseline = payload["baseline"]
        original = nodes[baseline]["payload"]["states"]
        if first_divergence(expected, original):
            controls.append({"evidence_id": ref, "baseline": baseline, "state": "NOT_RUN"})
            continue
        mutated = list(original)
        index = int(payload["index"])
        if index < 0 or index >= len(mutated):
            return {"status": "REJECTED", "reason": "control_index"}
        mutated[index] = payload["replacement"]
        divergence = first_divergence(expected, mutated)
        state = "PASS" if divergence else "FAIL"
        if state == "PASS":
            controlled.add(baseline)
        controls.append({"evidence_id": ref, "baseline": baseline, "state": state, "first_divergence": divergence})

    conformance = "CONTRADICTED" if any(item["state"] == "CONTRADICTED" for item in comparisons) else "CONFIRMED"
    negative = "PASS" if comparisons and len(controlled) == len(comparisons) and not any(item["state"] == "FAIL" for item in controls) else "NOT_RUN"
    if conformance == "CONTRADICTED":
        status = "CONTRADICTED"
    elif conformance == "CONFIRMED" and negative == "PASS":
        status = "LOCALLY_SUPPORTED"
    else:
        status = "INCONCLUSIVE"
    return {
        "schema": "chimera-verification-report/v2-python-cross-check",
        "source": OMEGA_SOURCE,
        "status": status,
        "scope": "PINNED_ARTIFACT_TRACE_EQUALITY_ONLY",
        "envelope_digest": digest,
        "claim_digest": claim_digest,
        "comparisons": comparisons,
        "controls": controls,
        "dimensions": {
            "artifact_conformance": conformance,
            "negative_control": negative,
            "formal_proof": "UNKNOWN",
            "implementation_binding": "UNKNOWN",
            "runtime_reproduction": "UNKNOWN",
            "independent_observation": "UNKNOWN",
            "replay": "NOT_RUN",
            "production_reachability": "UNKNOWN",
            "finality_externality": "UNKNOWN",
        },
    }
