from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path
import json
import subprocess
import sys

from .assurance import build_assurance_package, finalize_certificate, verify_final_certificate
from .evidence import EvidenceBoundRuntime
from .identity import PersistentEd25519Identity
from .omega_bridge import build_omega_envelope
from .receipt import build_signed_receipt
from .runtime import QuantumRuntime


def run_elevator(workspace: str | Path, *, seed: int = 42) -> dict[str, object]:
    root = Path(workspace)
    root.mkdir(parents=True, exist_ok=True)
    keys = root / "keys"
    keys.mkdir(exist_ok=True)

    runtime = QuantumRuntime.local(qubits=12, seed=seed)
    bound = EvidenceBoundRuntime(runtime)
    bound.execute_many(
        [
            {"op": "PREPARE_GHZ"},
            {"op": "H", "target": 3},
            {"op": "CNOT", "control": 3, "target": 5},
            {"op": "X", "target": 9},
            {"op": "INSPECT"},
        ]
    )

    execution_identity = PersistentEd25519Identity.load_or_create(keys / "executor.key")
    evidence = bound.export()
    receipt = build_signed_receipt(bound, execution_identity)
    engine = runtime.backend.engine
    omega = build_omega_envelope(engine, task_id=bound.task_id)
    package = build_assurance_package(evidence, receipt, omega)

    (root / "evidence.json").write_text(json.dumps(evidence, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (root / "execution-receipt.json").write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (root / "omega-envelope.json").write_text(json.dumps(omega, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    package_path = root / "assurance-package.json"
    package_path.write_text(json.dumps(package, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    verifier_specs = [
        ("verifier-a", keys / "verifier-a.key", root / "verifier-a.json"),
        ("verifier-b", keys / "verifier-b.key", root / "verifier-b.json"),
    ]
    processes: list[subprocess.Popen[str]] = []
    for label, key, out in verifier_specs:
        command = [
            sys.executable,
            "-m",
            "chimera_quantum.verifier_cli",
            "--package",
            str(package_path),
            "--key",
            str(key),
            "--label",
            label,
            "--out",
            str(out),
        ]
        processes.append(subprocess.Popen(command, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE))

    failures: list[str] = []
    for process in processes:
        stdout, stderr = process.communicate()
        if process.returncode != 0:
            failures.append(f"pid={process.pid} rc={process.returncode} stdout={stdout!r} stderr={stderr!r}")
    if failures:
        raise RuntimeError("verifier process failure: " + "; ".join(failures))

    verifier_receipts = [json.loads(out.read_text(encoding="utf-8")) for _, _, out in verifier_specs]
    coordinator = PersistentEd25519Identity.load_or_create(keys / "coordinator.key")
    certificate = finalize_certificate(package, verifier_receipts, coordinator, quorum=2)
    if not verify_final_certificate(certificate):
        raise RuntimeError("final certificate self-verification failed")
    certificate_path = root / "final-certificate.json"
    certificate_path.write_text(json.dumps(certificate, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    return {
        "status": certificate["status"],
        "task_id": bound.task_id,
        "final_state_sha256": receipt["final_state_sha256"],
        "execution_receipt_sha256": receipt["receipt_sha256"],
        "omega_envelope_digest": omega["digest"],
        "package_sha256": certificate["package_sha256"],
        "certificate_sha256": certificate["certificate_sha256"],
        "distinct_verifier_processes": certificate["distinct_verifier_processes"],
        "distinct_verifier_identities": certificate["distinct_verifier_identities"],
        "qpu_execution": certificate["qpu_execution"],
        "workspace": str(root),
    }


def main() -> int:
    parser = ArgumentParser(description="Run the Chimera quantum verification elevator lane.")
    parser.add_argument("--workspace", default="artifacts/chimera-elevator")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    result = run_elevator(args.workspace, seed=args.seed)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
