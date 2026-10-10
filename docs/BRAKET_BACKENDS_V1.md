# Amazon Braket Backend Adapter V1

This adapter implements the backend-switching requirement from the original design
without making the core state-vector runtime depend on AWS.

## Supported aliases

| `BRAKET_BACKEND` | Target | Notes |
|---|---|---|
| `local` | `local:braket/braket.local.qubit` | Local Hybrid Job / embedded simulator path |
| `sv1` | Amazon SV1 ARN | Managed state-vector simulator |
| `dm1` | Amazon DM1 ARN | Managed density-matrix simulator |
| `qpu` | `BRAKET_QPU_ARN` | Explicit QPU ARN required |

`tn1` deliberately fails closed. Amazon retired TN1 in June 2026, so preserving the
old alias as if it were executable would make the original template misleading.

## One-line switch

```bash
# Validate configuration only; no AWS call
BRAKET_BACKEND=sv1 python run_braket_job.py --dry-run

# Local Hybrid Job (Docker required by Amazon Braket local mode)
BRAKET_BACKEND=local python run_braket_job.py --iterations 5 --shots 100 --wait

# Managed simulator
BRAKET_BACKEND=sv1 python run_braket_job.py --iterations 10 --shots 500 --wait

# QPU: exact ARN is caller-selected, never guessed
BRAKET_BACKEND=qpu \
BRAKET_QPU_ARN='arn:aws:braket:<region>::device/qpu/<provider>/<device>' \
python run_braket_job.py --iterations 5 --shots 100 --wait
```

## Hybrid workload

`chimera_quantum.braket_hybrid_job.variational_hybrid_job` runs a small iterative
parameter-shift optimization over an `RY(theta) -> CNOT` circuit. It logs `cost`,
`theta`, `gradient`, and `final_cost` through the Braket metrics API.

The decorator is configured from environment variables at import time:

- `BRAKET_BACKEND`
- `BRAKET_QPU_ARN`
- `BRAKET_S3_OUTPUT`
- `BRAKET_ROLE_ARN`
- `BRAKET_INSTANCE_TYPE` (default `ml.m5.large`)
- `BRAKET_MAX_RUNTIME_SECONDS` (default `3600`)

## Trust boundary

CI validates alias resolution, fail-closed QPU selection, TN1 retirement behavior,
and the dry-run launcher without AWS credentials. CI does not claim that a managed
job or QPU ran. Actual managed execution requires the caller's AWS role, S3 policy,
region/device access, and billable Braket resources.
