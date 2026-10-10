from __future__ import annotations

import argparse
from pathlib import Path

from chimera_quantum.evidence import EvidenceBoundRuntime
from chimera_quantum.runtime import QuantumRuntime


def main() -> None:
    parser = argparse.ArgumentParser(description="Run an evidence-bound Chimera quantum scenario")
    parser.add_argument("--out", default="artifacts/chimera-quantum/evidence.json")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    bound = EvidenceBoundRuntime(QuantumRuntime.local(qubits=12, seed=args.seed))
    bound.execute_many([
        {"op": "PREPARE_GHZ"},
        {"op": "H", "target": 3},
        {"op": "H", "target": 3},
        {"op": "MEASURE_ALL"},
    ])

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = bound.export_json()
    out.write_text(payload, encoding="utf-8")
    print(payload, end="")


if __name__ == "__main__":
    main()
