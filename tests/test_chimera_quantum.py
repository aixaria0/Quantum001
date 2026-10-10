from pathlib import Path

import numpy as np

from chimera_quantum import QuantumEngine


def test_ghz_12_has_expected_invariants():
    engine = QuantumEngine(qubits=12, seed=7)
    engine.prepare_ghz()

    assert abs(engine.norm() - 1.0) < 1e-12
    assert abs(engine.ghz_fidelity() - 1.0) < 1e-12
    assert abs(engine.zz(0, 11) - 1.0) < 1e-12
    assert np.count_nonzero(np.abs(engine.state) > 1e-12) == 2


def test_seeded_measurement_and_replay_are_deterministic(tmp_path: Path):
    engine = QuantumEngine(qubits=12, seed=42)
    engine.prepare_ghz()
    measured = engine.measure_all()
    assert measured in {"0" * 12, "1" * 12}

    engine.save(tmp_path)
    restored = QuantumEngine.load(tmp_path)

    assert restored.state_hash() == engine.state_hash()
    assert restored.events == engine.events


def test_checkpoint_tamper_is_detected(tmp_path: Path):
    engine = QuantumEngine(qubits=3, seed=1)
    engine.prepare_ghz()
    engine.save(tmp_path)

    checkpoint = np.load(tmp_path / "state.npy", allow_pickle=False)
    checkpoint[0] = 0
    np.save(tmp_path / "state.npy", checkpoint, allow_pickle=False)

    try:
        QuantumEngine.load(tmp_path)
    except ValueError as exc:
        assert "checkpoint diverges" in str(exc)
    else:
        raise AssertionError("tampered checkpoint must be rejected")


def test_event_tamper_is_detected(tmp_path: Path):
    engine = QuantumEngine(qubits=3, seed=1)
    engine.prepare_ghz()
    engine.save(tmp_path)

    path = tmp_path / "events.ndjson"
    text = path.read_text(encoding="utf-8")
    path.write_text(text.replace('"GHZ"', '"ZERO"'), encoding="utf-8")

    try:
        QuantumEngine.load(tmp_path)
    except ValueError as exc:
        assert "replay hash" in str(exc)
    else:
        raise AssertionError("tampered event log must be rejected")
