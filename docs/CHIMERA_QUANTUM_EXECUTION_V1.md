# Chimera Quantum Execution V1

This slice turns the earlier conversational 12-qubit concept into an executable,
replayable state-vector runtime. The LLM is explicitly not the source of truth for
quantum state; the event log is.

## Implemented now

- 1-12 qubit state-vector engine (default demo: 12 qubits / 4096 amplitudes)
- GHZ preparation
- H, X, CNOT gates
- seeded full-register measurement using the Born distribution
- GHZ fidelity and ZZ correlation checks
- append-only semantic event history
- deterministic event replay
- checkpoint persistence (`state.npy`)
- manifest state digest
- fail-closed checkpoint-vs-replay verification
- tests for GHZ invariants, deterministic replay, checkpoint tampering and event-log tampering

## Run

```bash
python -m pip install -r requirements-chimera-quantum.txt
python -m chimera_quantum.cli --measure
python -m pytest tests/test_chimera_quantum.py -q
```

The demo persists an experiment under `artifacts/chimera-quantum/demo/` and then
reloads it through replay. `replay_verified=true` means the reconstructed state hash
matches the executed state hash; it is not a claim about external quantum hardware.

## Trust boundary

This is a classical state-vector simulator. It does not claim QPU execution. Amazon
Braket backends, signed Aether receipts, OMEGA evidence envelopes and independent
assurance are follow-on adapters and must not be reported as implemented until their
integration tests exist.

## Next slice

1. typed command schema + natural-language adapter boundary
2. Aether-style signed execution receipt
3. Braket backend interface (`numpy`, `local`, managed simulator, QPU)
4. OMEGA evidence package adapter
5. independent verifier replay
