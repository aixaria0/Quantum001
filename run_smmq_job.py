from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path
import json
import sys

from chimera_quantum.identity import PersistentEd25519Identity
from chimera_quantum.smmq import build_signed_smmq_receipt, validate_execution_request
from chimera_quantum.smmq_braket import dry_run_smmq_request, execute_smmq_request


def read_request(path: str) -> dict:
    if path == "-":
        return json.load(sys.stdin)
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(value: dict, path: str) -> None:
    text = json.dumps(value, indent=2, sort_keys=True) + "\n"
    if path == "-":
        sys.stdout.write(text)
        return
    output = Path(path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text, encoding="utf-8")


def main() -> int:
    parser = ArgumentParser(description="Execute an SMM-Q epistemic Ising job through Quantum001.")
    parser.add_argument("--request", required=True, help="request JSON path, or - for stdin")
    parser.add_argument("--out", default="-", help="receipt JSON path, or - for stdout")
    parser.add_argument("--backend", default="local", choices=["local", "sv1", "dm1", "qpu"])
    parser.add_argument("--qpu-arn", default=None)
    parser.add_argument("--identity-key", default="artifacts/smmq/executor.key")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    request = validate_execution_request(read_request(args.request))
    if args.dry_run:
        write_json(dry_run_smmq_request(request, backend=args.backend, qpu_arn=args.qpu_arn), args.out)
        return 0

    execution = execute_smmq_request(request, backend=args.backend, qpu_arn=args.qpu_arn)
    identity = PersistentEd25519Identity.load_or_create(args.identity_key)
    receipt = build_signed_smmq_receipt(request, execution, identity)
    write_json(receipt, args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
