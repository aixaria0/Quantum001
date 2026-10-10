from __future__ import annotations

from argparse import ArgumentParser
import json

from chimera_quantum.cxp import write_cxp_run


def main() -> int:
    parser = ArgumentParser(description="Export an executed Quantum001 elevator workspace as chimera-run/v2.")
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--output")
    parser.add_argument("--objective", default="Execute and verify the bounded 12-qubit quantum lane")
    args = parser.parse_args()
    run = write_cxp_run(args.workspace, args.output, objective=args.objective)
    print(json.dumps({"status": "ASSURED", "run_id": run["run_id"], "cxp_sha256": run["cxp_sha256"]}, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
