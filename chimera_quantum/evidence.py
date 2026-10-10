from __future__ import annotations

from dataclasses import asdict
from typing import Any, Iterable
import json
import uuid

from .commands import QuantumCommand
from .journal import QuantumJournal
from .runtime import QuantumRuntime


class EvidenceBoundRuntime:
    """Executes typed quantum commands while producing a tamper-evident journal."""

    def __init__(self, runtime: QuantumRuntime, task_id: str | None = None):
        self.runtime = runtime
        self.task_id = task_id or str(uuid.uuid4())
        self.journal = QuantumJournal()
        self.journal.append(
            self.task_id,
            "TASK_ACCEPTED",
            {"backend": str(runtime.backend.name)},
        )

    def execute(self, raw: dict[str, Any] | QuantumCommand) -> dict[str, Any]:
        command = raw if isinstance(raw, QuantumCommand) else QuantumCommand.from_mapping(raw)
        before = self.runtime.backend.snapshot()
        result = self.runtime.execute(command)
        command_payload = {
            "op": command.op.value,
            "target": "" if command.target is None else str(command.target),
            "control": "" if command.control is None else str(command.control),
            "state_before": str(before["state_hash"]),
            "state_after": str(result["state_hash"]),
            "event_count_after": str(result["event_count"]),
        }
        if "result" in result:
            command_payload["measurement"] = str(result["result"])
        self.journal.append(self.task_id, "COMMAND_EXECUTED", command_payload)
        return result

    def execute_many(self, commands: Iterable[dict[str, Any] | QuantumCommand]) -> list[dict[str, Any]]:
        return [self.execute(command) for command in commands]

    def export(self) -> dict[str, Any]:
        journal = self.journal.export()
        snapshot = self.runtime.backend.snapshot()
        return {
            "schema": "chimera-quantum-evidence/v1",
            "task_id": self.task_id,
            "backend": self.runtime.backend.name,
            "final_state": snapshot,
            "journal": journal,
            "authority": {
                "execution_reproduced": False,
                "signature_integrity": "UNKNOWN",
                "independent_observation": "UNKNOWN",
                "qpu_execution": "UNKNOWN",
            },
        }

    def export_json(self) -> str:
        return json.dumps(self.export(), indent=2, sort_keys=True) + "\n"
