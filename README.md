# Quantum001

An interactive quantum computing research project by AIX Aria.

**[Open the Quantum Studio](https://quantum001-lattice.ariaaix.chatgpt.site)** — owner-private hosted edition, with English/Persian navigation, twelve research labs, a twelve-qubit circuit composer, and inspectable local experiment records.

The standalone website lives in [`website/`](website/README.md). Its static files have no installation or build step. The existing TanStack application under `src/` is preserved.

```sh
npm --prefix website test
npm --prefix website run check
python3 -m http.server 8080 --directory website/dist
```

Experiments run as classical numerical simulations in the browser. Shor's analytic teaching model, classical annealing, numerical open-system integration, and evidence integrity checks each state their limitations in the interface. SHA-256 records are not formal proofs or hardware attestations.

Separate execution-core proposals:

- [Replayable twelve-qubit core — PR #1](https://github.com/aixaria0/Quantum001/pull/1)
- [CXP evidence export — PR #2](https://github.com/aixaria0/Quantum001/pull/2)

Those proposals are not bundled into the studio runtime.
