# Quantum001 — The Quantum Studio

A standalone, bilingual quantum computing studio for [aixaria0/Quantum001](https://github.com/aixaria0/Quantum001), built from the original twelve-lab collection and the supplied CHIMERA workspace.

Studio: https://quantum001-lattice.ariaaix.chatgpt.site (owner-private deployment).

## Experience

- Twelve original research topics, each with working controls and explicit model boundaries.
- Circuit composer for Bell pairs, GHZ registers from 2 to 12 qubits, and product states.
- Exact statevector calculations, global depolarizing mixtures, seeded measurement sampling, and ideal-circuit OpenQASM exports where available.
- QAOA angle search and real finite-difference Born-machine training.
- Local evidence vault with canonical JSON, SHA-256 integrity verification, sampled-result replay, and downloadable records.
- English and Persian interface, RTL layout, keyboard search, responsive navigation, and reduced-motion support.
- Self-hosted variable fonts. No runtime third-party scripts, API keys, package downloads, accounts, or AI service required.

## Run and validate

The deployable website is `dist/`. Serve that directory with any static HTTP server. There is no build step and no dependency installation.

```sh
npm test
npm run check
python3 -m http.server 8080 --directory dist
```

SHA-256 records require HTTPS or a localhost secure context. The deployed Site provides HTTPS. Browser records are stored under `quantum001.studio.v1` in localStorage, with a maximum of twelve records. Export JSON for durable archival.

## Numerical provenance

`dist/modules/engine.mjs` and `dist/modules/labs.mjs` are type-stripped translations of the original TypeScript files at commit `f92d86869a441141dc6e7b25907d744b5b475177`. Their original source is kept in `reference/`. No changes are made to the original repository's existing application.

`dist/modules/experiments.mjs` adds input validation, presentation adapters, seeded measurement sampling, GHZ composition, the noise mixture, local optimization, and evidence integrity.

The supplied workspace's original CHIMERA artwork appears in `dist/assets/chimera-lattice.jpg`. It remains illustrative artwork. Its statistical certificates, consensus examples and Lean sketches have not been represented as production consensus or machine-checked proofs.

The execution-core and CXP proposals in PRs #1 and #2 are linked in Field notes, but are not part of this browser runtime. Exported records use `quantum001.browser-experiment/v1`, not `chimera-run/v2`.

## Model boundaries

| Area | Runtime model |
| --- | --- |
| Grover, QAOA, QCBM, feature maps | Small classical statevector simulations |
| GHZ / Bell noise | Global mixture `(1-p)|psi><psi| + p I / 2^n`; ideal QASM excludes the noise |
| Shor | Classically calculated order and analytic Fourier histogram |
| Annealing | Classical Metropolis simulation of a ferromagnetic ring |
| Circuit knitting | Pedagogical Pauli decomposition, without a distributed wire-cut executor |
| Open systems | First-order Bloch/Lindblad integration with 1,200 steps |
| Error correction | Ideal three-qubit repetition code for a single X error |
| Evidence | Integrity digest; not a signature, formal proof or hardware attestation |

## Validation

Sixteen numerical and evidence tests cover probability normalization, a complex QFT inverse, GHZ-12, complete depolarization, seeded sampling, Grover amplification, order finding, QAOA optimization, all supported repetition-code errors, kernel symmetry, actual training loss, open-system bounds, deterministic annealing, digest tampering, canonical serialization and invalid parameters.

A DOM integration pass also checked all twelve routes, category filtering, execution, GHZ-12, evidence saving and replay, training controls, invalid-parameter recovery, search, Persian RTL navigation, notes and unknown routes. This does not replace browser layout/rendering QA. No browser rendering pass was available in the authoring environment.

## Assets

Manrope and Vazirmatn are distributed with their SIL Open Font License files in `dist/assets/`. The social card and favicon use the studio's copper/sage visual system.
