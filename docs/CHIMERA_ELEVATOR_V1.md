# CHIMERA Elevator V1

This slice turns the local 12-qubit runtime into a signed, replayable, two-verifier execution lane.

## Executed path

```text
Typed quantum commands
  -> NumPy 12-qubit state-vector execution
  -> Aether-derived tamper-evident journal
  -> deterministic state replay
  -> Ed25519 execution receipt
  -> OMEGA-compatible trace-equality envelope
  -> verifier process A (separate key)
  -> verifier process B (separate key)
  -> signed final certificate
```

## Source contracts reused

- `aixaria0/aether-runtime`: Ed25519 domain framing and length-prefixed SHA-256 journal event hashing.
- `aixaria0/CHIMERA-OMEGA`: restricted canonical JSON, `CHIMERA-OMEGA\0` digest framing, claim/node/envelope domains, and `omega.trace-equality/v1` package shape.
- `aixaria0/RCHAIN-COMPLIER`: the bounded quorum rule that PASS requires two distinct verifier identities reproducing support. This implementation is a local compatibility lane, not the RCHAIN-COMPLIER engine itself.

## Run

```bash
python -m pip install -r requirements-chimera-quantum.txt
python -m chimera_quantum.elevator --workspace artifacts/chimera-elevator --seed 42
```

The workspace contains:

- `evidence.json`
- `execution-receipt.json`
- `omega-envelope.json`
- `assurance-package.json`
- `verifier-a.json`
- `verifier-b.json`
- `final-certificate.json`

Each verifier is launched as a simultaneous child process with a separately persisted Ed25519 identity. The final certificate requires two valid verifier signatures, two distinct verifier fingerprints, two distinct process IDs, matching package digests, a valid execution receipt, intact journal chain, deterministic replay, and locally supported OMEGA trace equality.

## Authority boundary

A local `PASS` means the included state-vector execution package is internally coherent under the implemented cryptographic, replay, journal, and trace-equality checks, with two distinct local verifier processes/keys.

It does **not** establish:

- independent organizations or independent hosts;
- QPU execution;
- remote hardware attestation;
- production reachability/finality;
- general external truth.

Those dimensions remain explicitly `UNKNOWN` until separately evidenced.
