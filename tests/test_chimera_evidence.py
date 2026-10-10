from dataclasses import replace

from chimera_quantum.evidence import EvidenceBoundRuntime
from chimera_quantum.journal import QuantumJournal
from chimera_quantum.runtime import QuantumRuntime


def test_aether_derived_journal_chain_verifies_and_detects_tamper():
    journal = QuantumJournal()
    journal.append(
        "task-1",
        "TASK_ACCEPTED",
        {"backend": "numpy-statevector"},
        event_id="00000000-0000-0000-0000-000000000001",
        timestamp_ns=1_700_000_000_000_000_000,
    )
    journal.append(
        "task-1",
        "COMMAND_EXECUTED",
        {"op": "H", "target": "0", "unicode": "λ"},
        event_id="00000000-0000-0000-0000-000000000002",
        timestamp_ns=1_700_000_000_000_000_001,
    )

    status = QuantumJournal.verify(journal.events)
    assert status["valid"] is True
    assert status["event_count"] == 2
    assert status["head_hash"] == journal.events[-1].event_hash

    tampered = list(journal.events)
    tampered[1] = replace(tampered[1], payload_json='{"op":"X"}')
    rejected = QuantumJournal.verify(tampered)
    assert rejected["valid"] is False
    assert rejected["first_invalid_sequence"] == 2


def test_evidence_bound_runtime_records_state_transition_chain():
    bound = EvidenceBoundRuntime(QuantumRuntime.local(qubits=12, seed=42), task_id="quantum-task-1")
    results = bound.execute_many([
        {"op": "PREPARE_GHZ"},
        {"op": "H", "target": 3},
        {"op": "MEASURE_ALL"},
    ])
    evidence = bound.export()

    assert evidence["schema"] == "chimera-quantum-evidence/v1"
    assert evidence["final_state"]["state_hash"] == results[-1]["state_hash"]
    assert evidence["journal"]["verification"]["valid"] is True
    assert evidence["journal"]["verification"]["event_count"] == 4
    assert evidence["authority"]["signature_integrity"] == "UNKNOWN"
    assert evidence["authority"]["qpu_execution"] == "UNKNOWN"
