from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path
import json

from .assurance import issue_verifier_receipt
from .identity import PersistentEd25519Identity


def main() -> int:
    parser = ArgumentParser(description="Issue one signed local quantum verifier receipt.")
    parser.add_argument("--package", required=True)
    parser.add_argument("--key", required=True)
    parser.add_argument("--label", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    package = json.loads(Path(args.package).read_text(encoding="utf-8"))
    identity = PersistentEd25519Identity.load_or_create(args.key)
    receipt = issue_verifier_receipt(package, identity, args.label)
    Path(args.out).write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"verifier": args.label, "verdict": receipt["verdict"], "process_id": receipt["process_id"]}, sort_keys=True))
    return 0 if receipt["verdict"] == "SUPPORTED" else 1


if __name__ == "__main__":
    raise SystemExit(main())
