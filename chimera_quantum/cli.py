from __future__ import annotations

import argparse
import json
from pathlib import Path

from .engine import QuantumEngine


def main() -> None:
    parser = argparse.ArgumentParser(description="Chimera 12-qubit execution core")
    parser.add_argument("--workspace", default="artifacts/chimera-quantum/demo")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--measure", action="store_true")
    args = parser.parse_args()

    engine = QuantumEngine(qubits=12, seed=args.seed)
    engine.prepare_ghz()
    before = {
        "norm": engine.norm(),
        "ghz_fidelity": engine.ghz_fidelity(),
        "zz_0_11": engine.zz(0, 11),
        "state_hash": engine.state_hash(),
    }

    measurement = engine.measure_all() if args.measure else None
    workspace = Path(args.workspace)
    engine.save(workspace)
    restored = QuantumEngine.load(workspace)

    print(json.dumps({
        "before_measurement": before,
        "measurement": measurement,
        "restored_state_hash": restored.state_hash(),
        "event_count": len(restored.events),
        "replay_verified": restored.state_hash() == engine.state_hash(),
    }, indent=2))


if __name__ == "__main__":
    main()
