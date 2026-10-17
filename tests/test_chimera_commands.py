from chimera_quantum.commands import QuantumCommand, QuantumOp
from chimera_quantum.runtime import QuantumRuntime


def test_typed_command_contract_rejects_ambiguous_shapes():
    try:
        QuantumCommand.from_mapping({"op": "H"})
    except ValueError as exc:
        assert "target" in str(exc)
    else:
        raise AssertionError("H without target must fail")

    try:
        QuantumCommand.from_mapping({"op": "CNOT", "control": 1, "target": 1})
    except ValueError as exc:
        assert "must differ" in str(exc)
    else:
        raise AssertionError("CNOT self-loop must fail")


def test_runtime_executes_typed_plan_and_preserves_state_hashes():
    runtime = QuantumRuntime.local(qubits=12, seed=42)
    results = runtime.execute_many([
        {"op": "PREPARE_GHZ"},
        {"op": "INSPECT"},
        {"op": "H", "target": 3},
        {"op": "INSPECT"},
    ])

    assert results[0]["event_count"] == 1
    assert results[1]["state_hash"] == results[0]["state_hash"]
    assert results[2]["event_count"] == 2
    assert results[3]["state_hash"] == results[2]["state_hash"]
    assert results[0]["state_hash"] != results[2]["state_hash"]


def test_runtime_blocks_out_of_range_qubit_before_mutation():
    runtime = QuantumRuntime.local(qubits=3, seed=0)
    before = runtime.execute({"op": "INSPECT"})

    try:
        runtime.execute({"op": "X", "target": 9})
    except ValueError as exc:
        assert "out of range" in str(exc)
    else:
        raise AssertionError("out-of-range target must fail")

    after = runtime.execute({"op": "INSPECT"})
    assert before["state_hash"] == after["state_hash"]
    assert before["event_count"] == after["event_count"]


def test_enum_values_are_stable_contract_surface():
    assert QuantumOp.PREPARE_GHZ.value == "PREPARE_GHZ"
    assert QuantumOp.MEASURE_ALL.value == "MEASURE_ALL"
