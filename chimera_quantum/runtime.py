from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Protocol

from .commands import QuantumCommand, QuantumOp
from .engine import QuantumEngine


class QuantumBackend(Protocol):
    name: str

    def execute(self, command: QuantumCommand) -> dict[str, Any]: ...
    def snapshot(self) -> dict[str, Any]: ...


@dataclass
class NumpyStatevectorBackend:
    engine: QuantumEngine
    name: str = "numpy-statevector"

    @classmethod
    def create(cls, qubits: int = 12, seed: int = 0) -> "NumpyStatevectorBackend":
        return cls(QuantumEngine(qubits=qubits, seed=seed))

    def _validate_index(self, q: int | None) -> int:
        if q is None or not 0 <= q < self.engine.qubits:
            raise ValueError("qubit out of range")
        return q

    def execute(self, command: QuantumCommand) -> dict[str, Any]:
        op = command.op
        result: Any = None

        if op is QuantumOp.PREPARE_GHZ:
            self.engine.prepare_ghz()
        elif op is QuantumOp.ZERO:
            self.engine.prepare_zero()
        elif op is QuantumOp.H:
            self.engine.h(self._validate_index(command.target))
        elif op is QuantumOp.X:
            self.engine.x(self._validate_index(command.target))
        elif op is QuantumOp.CNOT:
            control = self._validate_index(command.control)
            target = self._validate_index(command.target)
            self.engine.cnot(control, target)
        elif op is QuantumOp.MEASURE_ALL:
            result = self.engine.measure_all()
        elif op is QuantumOp.INSPECT:
            pass
        else:  # pragma: no cover - Enum makes this defensive only.
            raise ValueError(f"unsupported op: {op}")

        payload = self.snapshot()
        payload["op"] = op.value
        if result is not None:
            payload["result"] = result
        return payload

    def snapshot(self) -> dict[str, Any]:
        engine = self.engine
        return {
            "backend": self.name,
            "qubits": engine.qubits,
            "state_hash": engine.state_hash(),
            "norm": engine.norm(),
            "event_count": len(engine.events),
        }


class QuantumRuntime:
    """Policy boundary between untrusted intent and quantum state mutation."""

    def __init__(self, backend: QuantumBackend):
        self.backend = backend

    @classmethod
    def local(cls, qubits: int = 12, seed: int = 0) -> "QuantumRuntime":
        return cls(NumpyStatevectorBackend.create(qubits=qubits, seed=seed))

    def execute(self, raw: dict[str, Any] | QuantumCommand) -> dict[str, Any]:
        command = raw if isinstance(raw, QuantumCommand) else QuantumCommand.from_mapping(raw)
        return self.backend.execute(command)

    def execute_many(self, commands: Iterable[dict[str, Any] | QuantumCommand]) -> list[dict[str, Any]]:
        return [self.execute(command) for command in commands]
