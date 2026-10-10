from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Mapping, Sequence
import hashlib
import json
import time
import uuid

AETHER_HASH_SOURCE = "aixaria0/aether-runtime@93e6f7c6e4276ad92e2fcccbae8d6ab8fda21a1e"


@dataclass(frozen=True)
class JournalEvent:
    sequence: int
    event_id: str
    task_id: str
    event_type: str
    timestamp_ns_decimal: str
    payload_json: str
    previous_hash: str | None
    event_hash: str


def hash_event(
    previous_hash: str | None,
    event_id: str,
    task_id: str,
    event_type: str,
    timestamp_ns_decimal: str,
    payload_json: str,
) -> str:
    """Port of Aether's length-prefixed SHA-256 journal event hash.

    Rust `str.len()` counts UTF-8 bytes, so this implementation prefixes the byte
    length rather than Python's Unicode code-point length.
    """
    digest = hashlib.sha256()
    for text in (
        previous_hash or "",
        event_id,
        task_id,
        event_type,
        timestamp_ns_decimal,
        payload_json,
    ):
        raw = text.encode("utf-8")
        digest.update(len(raw).to_bytes(8, "big", signed=False))
        digest.update(raw)
    return digest.hexdigest()


class QuantumJournal:
    def __init__(self):
        self.events: list[JournalEvent] = []

    def append(
        self,
        task_id: str,
        event_type: str,
        payload: Mapping[str, str],
        *,
        event_id: str | None = None,
        timestamp_ns: int | None = None,
    ) -> JournalEvent:
        if not task_id or not event_type:
            raise ValueError("task_id and event_type are required")
        if any(not isinstance(k, str) or not isinstance(v, str) for k, v in payload.items()):
            raise ValueError("journal payload must be a string-to-string mapping")

        event_id = event_id or str(uuid.uuid4())
        timestamp_ns = time.time_ns() if timestamp_ns is None else int(timestamp_ns)
        if timestamp_ns < 0:
            raise ValueError("timestamp must be non-negative")
        timestamp = str(timestamp_ns)
        payload_json = json.dumps(dict(payload), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        previous_hash = self.events[-1].event_hash if self.events else None
        event_hash = hash_event(
            previous_hash,
            event_id,
            task_id,
            event_type,
            timestamp,
            payload_json,
        )
        event = JournalEvent(
            sequence=len(self.events) + 1,
            event_id=event_id,
            task_id=task_id,
            event_type=event_type,
            timestamp_ns_decimal=timestamp,
            payload_json=payload_json,
            previous_hash=previous_hash,
            event_hash=event_hash,
        )
        self.events.append(event)
        return event

    @staticmethod
    def verify(events: Sequence[JournalEvent]) -> dict[str, object]:
        previous: str | None = None
        for index, event in enumerate(events, start=1):
            expected = hash_event(
                previous,
                event.event_id,
                event.task_id,
                event.event_type,
                event.timestamp_ns_decimal,
                event.payload_json,
            )
            if event.sequence != index or event.previous_hash != previous or event.event_hash != expected:
                return {
                    "valid": False,
                    "event_count": len(events),
                    "head_hash": previous,
                    "first_invalid_sequence": event.sequence,
                }
            previous = event.event_hash
        return {
            "valid": True,
            "event_count": len(events),
            "head_hash": previous,
            "first_invalid_sequence": None,
        }

    def export(self) -> dict[str, object]:
        verification = self.verify(self.events)
        return {
            "schema": "chimera-quantum-journal/v1",
            "hash_algorithm": "aether-length-prefixed-sha256/v1",
            "hash_source": AETHER_HASH_SOURCE,
            "coverage": "genesis_to_snapshot_head",
            "verification": verification,
            "events": [asdict(event) for event in self.events],
        }
