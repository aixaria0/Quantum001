from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Mapping


class QuantumOp(str, Enum):
    PREPARE_GHZ = "PREPARE_GHZ"
    ZERO = "ZERO"
    H = "H"
    X = "X"
    CNOT = "CNOT"
    MEASURE_ALL = "MEASURE_ALL"
    INSPECT = "INSPECT"


@dataclass(frozen=True)
class QuantumCommand:
    op: QuantumOp
    target: int | None = None
    control: int | None = None

    @classmethod
    def from_mapping(cls, raw: Mapping[str, Any]) -> "QuantumCommand":
        if "op" not in raw:
            raise ValueError("command requires op")
        try:
            op = QuantumOp(str(raw["op"]).upper())
        except ValueError as exc:
            raise ValueError(f"unsupported quantum op: {raw['op']}") from exc

        target = raw.get("target")
        control = raw.get("control")
        if target is not None and (isinstance(target, bool) or not isinstance(target, int)):
            raise ValueError("target must be an integer")
        if control is not None and (isinstance(control, bool) or not isinstance(control, int)):
            raise ValueError("control must be an integer")

        command = cls(op=op, target=target, control=control)
        command.validate_shape()
        return command

    def validate_shape(self) -> None:
        if self.op in {QuantumOp.H, QuantumOp.X}:
            if self.target is None or self.control is not None:
                raise ValueError(f"{self.op.value} requires target only")
        elif self.op is QuantumOp.CNOT:
            if self.control is None or self.target is None:
                raise ValueError("CNOT requires control and target")
            if self.control == self.target:
                raise ValueError("CNOT control and target must differ")
        elif self.op in {
            QuantumOp.PREPARE_GHZ,
            QuantumOp.ZERO,
            QuantumOp.MEASURE_ALL,
            QuantumOp.INSPECT,
        }:
            if self.target is not None or self.control is not None:
                raise ValueError(f"{self.op.value} accepts no qubit arguments")
