from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable
import hashlib
import json
import math

import numpy as np


@dataclass(frozen=True)
class QuantumEvent:
    seq: int
    op: str
    args: dict[str, Any]


class QuantumEngine:
    """Deterministic state-vector runtime for 1..12 qubits.

    The event log is authoritative. Checkpoints are caches and must match replay.
    Qubit 0 is represented by the least-significant basis bit.
    """

    def __init__(self, qubits: int = 12, seed: int = 0):
        if qubits < 1 or qubits > 12:
            raise ValueError("qubits must be in [1, 12]")
        self.qubits = qubits
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.state = np.zeros(1 << qubits, dtype=np.complex128)
        self.state[0] = 1.0
        self.events: list[QuantumEvent] = []

    @staticmethod
    def _h_matrix() -> np.ndarray:
        return np.array([[1, 1], [1, -1]], dtype=np.complex128) / math.sqrt(2)

    @staticmethod
    def _x_matrix() -> np.ndarray:
        return np.array([[0, 1], [1, 0]], dtype=np.complex128)

    def _append(self, op: str, **args: Any) -> None:
        self.events.append(QuantumEvent(len(self.events), op, args))

    def _apply_single(self, gate: np.ndarray, target: int) -> None:
        if not 0 <= target < self.qubits:
            raise ValueError("target qubit out of range")
        bit = 1 << target
        for i in range(len(self.state)):
            if i & bit:
                continue
            j = i | bit
            a, b = self.state[i], self.state[j]
            self.state[i] = gate[0, 0] * a + gate[0, 1] * b
            self.state[j] = gate[1, 0] * a + gate[1, 1] * b

    def h(self, target: int, *, record: bool = True) -> None:
        self._apply_single(self._h_matrix(), target)
        if record:
            self._append("H", target=target)

    def x(self, target: int, *, record: bool = True) -> None:
        self._apply_single(self._x_matrix(), target)
        if record:
            self._append("X", target=target)

    def cnot(self, control: int, target: int, *, record: bool = True) -> None:
        if control == target:
            raise ValueError("control and target must differ")
        if not (0 <= control < self.qubits and 0 <= target < self.qubits):
            raise ValueError("qubit out of range")
        cbit, tbit = 1 << control, 1 << target
        for i in range(len(self.state)):
            if (i & cbit) and not (i & tbit):
                j = i | tbit
                self.state[i], self.state[j] = self.state[j], self.state[i]
        if record:
            self._append("CNOT", control=control, target=target)

    def prepare_zero(self, *, record: bool = True) -> None:
        self.state.fill(0)
        self.state[0] = 1.0
        if record:
            self._append("ZERO")

    def prepare_ghz(self, *, record: bool = True) -> None:
        self.state.fill(0)
        self.state[0] = 1.0
        self.h(0, record=False)
        for q in range(1, self.qubits):
            self.cnot(0, q, record=False)
        if record:
            self._append("GHZ")

    def norm(self) -> float:
        return float(np.vdot(self.state, self.state).real)

    def state_hash(self) -> str:
        raw = self.state.view(np.float64).tobytes()
        return "sha256:" + hashlib.sha256(raw).hexdigest()

    def ghz_fidelity(self) -> float:
        amp = (self.state[0] + self.state[-1]) / math.sqrt(2)
        return float(abs(amp) ** 2)

    def zz(self, q1: int, q2: int) -> float:
        if not (0 <= q1 < self.qubits and 0 <= q2 < self.qubits):
            raise ValueError("qubit out of range")
        if q1 == q2:
            return 1.0
        mask1, mask2 = 1 << q1, 1 << q2
        result = 0.0
        for i, p in enumerate(np.abs(self.state) ** 2):
            z1 = -1.0 if i & mask1 else 1.0
            z2 = -1.0 if i & mask2 else 1.0
            result += p * z1 * z2
        return float(result)

    def measure_all(self, *, record: bool = True) -> str:
        probs = np.abs(self.state) ** 2
        idx = int(self.rng.choice(len(self.state), p=probs / probs.sum()))
        self.state.fill(0)
        self.state[idx] = 1.0
        bits = format(idx, f"0{self.qubits}b")[::-1]
        if record:
            self._append("MEASURE_ALL", result=bits)
        return bits

    def apply_event(self, event: QuantumEvent) -> None:
        args = event.args
        if event.op == "ZERO":
            self.prepare_zero(record=False)
        elif event.op == "GHZ":
            self.prepare_ghz(record=False)
        elif event.op == "H":
            self.h(int(args["target"]), record=False)
        elif event.op == "X":
            self.x(int(args["target"]), record=False)
        elif event.op == "CNOT":
            self.cnot(int(args["control"]), int(args["target"]), record=False)
        elif event.op == "MEASURE_ALL":
            bits = str(args["result"])
            idx = int(bits[::-1], 2)
            self.state.fill(0)
            self.state[idx] = 1.0
        else:
            raise ValueError(f"unsupported event: {event.op}")

    @classmethod
    def replay(cls, qubits: int, seed: int, events: Iterable[QuantumEvent]) -> "QuantumEngine":
        engine = cls(qubits=qubits, seed=seed)
        for expected_seq, event in enumerate(events):
            if event.seq != expected_seq:
                raise ValueError("event sequence is non-canonical")
            engine.apply_event(event)
            engine.events.append(event)
        return engine

    def save(self, root: str | Path) -> None:
        root = Path(root)
        root.mkdir(parents=True, exist_ok=True)
        manifest = {
            "version": 1,
            "qubits": self.qubits,
            "seed": self.seed,
            "state_hash": self.state_hash(),
            "event_count": len(self.events),
        }
        (root / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        with (root / "events.ndjson").open("w", encoding="utf-8") as fh:
            for event in self.events:
                fh.write(json.dumps(asdict(event), sort_keys=True) + "\n")
        np.save(root / "state.npy", self.state, allow_pickle=False)

    @classmethod
    def load(cls, root: str | Path) -> "QuantumEngine":
        root = Path(root)
        manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
        events: list[QuantumEvent] = []
        for line in (root / "events.ndjson").read_text(encoding="utf-8").splitlines():
            if line.strip():
                raw = json.loads(line)
                events.append(QuantumEvent(int(raw["seq"]), raw["op"], raw["args"]))
        if len(events) != int(manifest["event_count"]):
            raise ValueError("event count does not match manifest")
        engine = cls.replay(int(manifest["qubits"]), int(manifest["seed"]), events)
        if engine.state_hash() != manifest["state_hash"]:
            raise ValueError("replay hash does not match manifest")
        checkpoint = np.load(root / "state.npy", allow_pickle=False)
        if checkpoint.shape != engine.state.shape or not np.allclose(checkpoint, engine.state, atol=1e-12):
            raise ValueError("checkpoint diverges from replayed state")
        return engine
