from __future__ import annotations

import argparse
import json

from chimera_quantum.braket_config import target_from_env


def main() -> None:
    parser = argparse.ArgumentParser(description="Launch Chimera Amazon Braket Hybrid Job")
    parser.add_argument("--iterations", type=int, default=8)
    parser.add_argument("--shots", type=int, default=200)
    parser.add_argument("--learning-rate", type=float, default=0.2)
    parser.add_argument("--initial-theta", type=float, default=0.3)
    parser.add_argument("--wait", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    target = target_from_env()
    print(json.dumps({
        "backend": target.alias,
        "device": target.device,
        "execution_mode": target.execution_mode,
        "hybrid_local": target.hybrid_local,
    }, indent=2))

    if args.dry_run:
        return

    from chimera_quantum.braket_hybrid_job import variational_hybrid_job

    job = variational_hybrid_job(
        iterations=args.iterations,
        shots=args.shots,
        learning_rate=args.learning_rate,
        initial_theta=args.initial_theta,
    )
    print(f"job_arn={getattr(job, 'arn', 'local-job')}")

    if args.wait:
        job.logs(wait=True)
        print(json.dumps(job.result(), indent=2, default=str))
        try:
            print(json.dumps(job.metrics(), indent=2, default=str))
        except AttributeError:
            # LocalQuantumJob does not expose every managed-job monitoring surface.
            pass


if __name__ == "__main__":
    main()
