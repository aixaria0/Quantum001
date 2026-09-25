import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { L as notFound, _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ArrowLeft, i as ArrowRight } from "../_libs/lucide-react.mjs";
import { c as prevLab, i as cn, l as useProgress, n as LABS, o as labById, r as Shell, s as nextLab, t as Button } from "./shell-Cn-Ua-TU.mjs";
import { n as Route } from "./router-BgI_vhN0.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { a as ResponsiveContainer, i as Line, n as YAxis, o as Tooltip, r as XAxis, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lab._id-CazpB6gi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Panel({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)] md:p-5", className),
		children
	});
}
function Field({ label, value, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium text-muted",
				children: label
			}), value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-fg tabular-nums",
				children: value
			}) : null]
		}), children]
	});
}
function Formula({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-md bg-subtle px-3 py-2 font-mono text-xs text-accent md:text-sm",
		children
	});
}
var ROWS = [
	{
		domain: "Quantum chemistry",
		claim: "Hamiltonian simulation / SQD on small molecules",
		honest: "Useful on tens of logical qubits; industrial catalysis still needs fault tolerance."
	},
	{
		domain: "Combinatorial optimization",
		claim: "QAOA / annealing on Ising / MaxCut / QUBO",
		honest: "Competitive on structured graphs today as a heuristic, not a proven exponential win."
	},
	{
		domain: "Unstructured search",
		claim: "Grover √N",
		honest: "Quadratic only. AES-128 → 2⁶⁴ — still astronomical without huge fault-tolerant machines."
	},
	{
		domain: "Integer factoring",
		claim: "Shor polynomial time",
		honest: "The cryptographic breaker. Needs thousands of clean logical qubits, not NISQ."
	},
	{
		domain: "Quantum ML kernels",
		claim: "Hilbert feature maps",
		honest: "Proven separation exists for contrived data; real tabular datasets rarely show it yet."
	},
	{
		domain: "Sensing / metrology",
		claim: "Heisenberg-limited phase estimation",
		honest: "Already shipping in magnetometry and clocks — the quiet industrial win."
	},
	{
		domain: "Open-system dynamics",
		claim: "Lindblad simulation of noisy matter",
		honest: "A natural match: the hardware is already open. Encoding the right Lₖ is the art."
	}
];
function AdvantageLab() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "Advantage is a workload, not a headline. Match the algorithm to the Hamiltonian." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3",
			children: ROWS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-2 md:grid-cols-[0.9fr_1.1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg",
					children: row.domain
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: row.claim
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-fg/90",
					children: row.honest
				})]
			}, row.domain))
		})]
	});
}
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-subtle",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-accent" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-accent shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" })]
	});
}
function energy(spins, J) {
	let e = 0;
	for (let i = 0; i < spins.length; i++) e += J * spins[i] * spins[(i + 1) % spins.length];
	return e;
}
function annealStep(spins, s, T) {
	const next = spins.slice();
	const i = Math.floor(Math.random() * next.length);
	const trial = next.slice();
	trial[i] *= -1;
	const dE = energy(trial, -s) - energy(next, -s);
	if (dE < 0 || Math.random() < Math.exp(-dE / Math.max(T, 1e-6))) next[i] *= -1;
	return next;
}
function AnnealingLab() {
	const [s, setS] = (0, import_react.useState)(.4);
	const [nodes, setNodes] = (0, import_react.useState)(8);
	const spins = (0, import_react.useMemo)(() => {
		let state = Array.from({ length: nodes }, () => Math.random() < .5 ? 1 : -1);
		const T = Math.max(.05, 1.2 * (1 - s));
		for (let k = 0; k < 80; k++) state = annealStep(state, s, T);
		return state;
	}, [s, nodes]);
	const e = energy(spins, -s);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Formula, { children: [
				"H(s) = (1−s) Σ Xᵢ + s Σ Jᵢⱼ Zᵢ Zⱼ · 1D ring, ",
				nodes,
				" spins"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: `0 0 320 180`,
					className: "h-44 w-full",
					children: spins.map((spin, i) => {
						const ang = i / spins.length * Math.PI * 2 - Math.PI / 2;
						const x = 160 + 70 * Math.cos(ang);
						const y = 90 + 62 * Math.sin(ang);
						const ang2 = (i + 1) % spins.length / spins.length * Math.PI * 2 - Math.PI / 2;
						const x2 = 160 + 70 * Math.cos(ang2);
						const y2 = 90 + 62 * Math.sin(ang2);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: x,
							y1: y,
							x2,
							y2,
							stroke: "var(--color-border-strong)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: x,
							cy: y,
							r: 10,
							fill: spin > 0 ? "var(--color-fg)" : "var(--color-subtle)"
						})] }, i);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs text-muted tabular-nums",
					children: [
						"⟨H⟩ ~ ",
						e.toFixed(2),
						" · T ~ ",
						(1.2 * (1 - s)).toFixed(2)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Anneal fraction s",
							value: s.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: 1,
								step: .01,
								value: [s],
								onValueChange: (v) => setS(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Spins",
							value: String(nodes),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 6,
								max: 16,
								step: 1,
								value: [nodes],
								onValueChange: (v) => setNodes(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "At s = 0 the mixer dominates (paramagnet). At s = 1 the problem Hamiltonian freezes the ring. Slow s(t) is annealing; a short alternating pulse sequence with variational angles is QAOA."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[520px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs uppercase tracking-wider text-faint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-4 font-medium",
								children: "Axis"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-4 font-medium",
								children: "Annealing"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "QAOA"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "text-muted",
						children: [
							[
								"Hardware",
								"Analog couplers (Pegasus / Zephyr)",
								"Universal gates (heavy-hex, all-to-all ions)"
							],
							[
								"Native problem",
								"Quadratic Ising / QUBO",
								"Any Pauli Hamiltonian"
							],
							[
								"Path",
								"Adiabatic H(s)",
								"Layered U_C(γ) U_B(β)"
							],
							[
								"Failure mode",
								"Minigaps freeze the evolution",
								"Barren plateaus, shot noise"
							],
							[
								"Depth analog",
								"Anneal time",
								"p layers"
							]
						].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-4 text-fg",
									children: row[0]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-4",
									children: row[1]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3",
									children: row[2]
								})
							]
						}, row[0]))
					})]
				})
			})
		]
	});
}
var FLOWS = [
	{
		from: "Schrödinger",
		to: "Unitaries",
		value: 8
	},
	{
		from: "Unitaries",
		to: "QFT",
		value: 3
	},
	{
		from: "Unitaries",
		to: "Grover iterate",
		value: 3
	},
	{
		from: "Unitaries",
		to: "QAOA layers",
		value: 3
	},
	{
		from: "QFT",
		to: "Shor",
		value: 4
	},
	{
		from: "Grover iterate",
		to: "Search / QRL",
		value: 3
	},
	{
		from: "QAOA layers",
		to: "Recursive cut",
		value: 2
	},
	{
		from: "QAOA layers",
		to: "Annealing",
		value: 2
	},
	{
		from: "Unitaries",
		to: "QCBM / QNN",
		value: 3
	},
	{
		from: "QCBM / QNN",
		to: "Kernels",
		value: 2
	},
	{
		from: "Lindblad",
		to: "mesolve",
		value: 3
	},
	{
		from: "Lindblad",
		to: "QEC",
		value: 3
	},
	{
		from: "QEC",
		to: "Logical algorithms",
		value: 4
	},
	{
		from: "Shor",
		to: "Logical algorithms",
		value: 2
	},
	{
		from: "Search / QRL",
		to: "Logical algorithms",
		value: 2
	}
];
function layout() {
	const cols = [
		["Schrödinger", "Lindblad"],
		[
			"Unitaries",
			"mesolve",
			"QEC"
		],
		[
			"QFT",
			"Grover iterate",
			"QAOA layers",
			"QCBM / QNN"
		],
		[
			"Shor",
			"Search / QRL",
			"Recursive cut",
			"Annealing",
			"Kernels"
		],
		["Logical algorithms"]
	];
	const pos = {};
	cols.forEach((col, ci) => {
		col.forEach((name, ri) => {
			pos[name] = {
				x: 48 + ci * 150,
				y: 36 + ri * (280 / Math.max(col.length, 1))
			};
		});
	});
	return {
		cols,
		pos
	};
}
function AtlasLab() {
	const { pos } = layout();
	const names = Object.keys(pos);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Formula, { children: [
				"H → U(t) → ",
				`{QFT, Grover, QAOA, QCBM}`,
				" → applications, with noise handled by Lindblad + QEC"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 760 340",
					className: "h-72 min-w-[640px] w-full",
					children: [FLOWS.map((f, i) => {
						const a = pos[f.from];
						const b = pos[f.to];
						if (!a || !b) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: `M ${a.x + 54} ${a.y} C ${a.x + 100} ${a.y}, ${b.x - 40} ${b.y}, ${b.x} ${b.y}`,
							fill: "none",
							stroke: "var(--color-border-strong)",
							strokeWidth: Math.max(1, f.value * .6)
						}, i);
					}), names.map((n) => {
						const p = pos[n];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: p.x,
							y: p.y - 12,
							width: 108,
							height: 24,
							rx: "6",
							fill: "var(--color-subtle)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: p.x + 54,
							y: p.y + 4,
							textAnchor: "middle",
							fontSize: "10",
							fill: "var(--color-fg)",
							fontFamily: "Figtree",
							children: n
						})] }, n);
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: LABS.map((lab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/lab/$id",
					params: { id: lab.id },
					className: "rounded-lg bg-elevated px-4 py-3 shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[11px] text-faint",
							children: lab.chapter
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg",
							children: lab.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: lab.kicker
						})
					]
				}, lab.id))
			})
		]
	});
}
function project(x, y, z, r, rotY, rotX) {
	const cy = Math.cos(rotY);
	const sy = Math.sin(rotY);
	const cx = Math.cos(rotX);
	const sx = Math.sin(rotX);
	const x1 = x * cy + z * sy;
	const z1 = -x * sy + z * cy;
	const y2 = y * cx - z1 * sx;
	const z2 = y * sx + z1 * cx;
	return {
		px: x1 * r,
		py: -y2 * r,
		depth: z2
	};
}
function BlochSphere({ x, y, z, trail = [], className }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		canvas.width = Math.floor(w * dpr);
		canvas.height = Math.floor(h * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		const cx = w / 2;
		const cy = h / 2 + 4;
		const r = Math.min(w, h) * .36;
		const rotY = .55;
		const rotX = .35;
		const fg = "rgba(240,240,242,0.88)";
		const mute = "rgba(138,138,146,0.55)";
		const faint = "rgba(138,138,146,0.22)";
		const accent = "rgba(200,204,212,0.95)";
		ctx.translate(cx, cy);
		ctx.strokeStyle = faint;
		ctx.lineWidth = 1;
		for (const lat of [
			-.6,
			0,
			.6
		]) {
			ctx.beginPath();
			for (let t = 0; t <= 64; t++) {
				const phi = t / 64 * Math.PI * 2;
				const yy = lat;
				const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
				const p = project(rr * Math.cos(phi), yy, rr * Math.sin(phi), r, rotY, rotX);
				if (t === 0) ctx.moveTo(p.px, p.py);
				else ctx.lineTo(p.px, p.py);
			}
			ctx.stroke();
		}
		ctx.beginPath();
		for (let t = 0; t <= 64; t++) {
			const th = t / 64 * Math.PI;
			const p = project(Math.sin(th), Math.cos(th), 0, r, rotY, rotX);
			if (t === 0) ctx.moveTo(p.px, p.py);
			else ctx.lineTo(p.px, p.py);
		}
		ctx.stroke();
		const axes = [
			{
				v: {
					x: 1.2,
					y: 0,
					z: 0
				},
				label: "X"
			},
			{
				v: {
					x: 0,
					y: 1.2,
					z: 0
				},
				label: "Z"
			},
			{
				v: {
					x: 0,
					y: 0,
					z: 1.2
				},
				label: "Y"
			}
		];
		ctx.font = "500 11px Figtree, sans-serif";
		ctx.fillStyle = mute;
		for (const a of axes) {
			const p = project(a.v.x, a.v.y, a.v.z, r, rotY, rotX);
			const o = project(0, 0, 0, r, rotY, rotX);
			ctx.beginPath();
			ctx.strokeStyle = faint;
			ctx.moveTo(o.px, o.py);
			ctx.lineTo(p.px, p.py);
			ctx.stroke();
			ctx.fillText(a.label, p.px + 4, p.py - 4);
		}
		const zUp = project(0, 1.35, 0, r, rotY, rotX);
		const zDn = project(0, -1.35, 0, r, rotY, rotX);
		ctx.fillStyle = mute;
		ctx.fillText("|0⟩", zUp.px - 8, zUp.py - 6);
		ctx.fillText("|1⟩", zDn.px - 8, zDn.py + 14);
		if (trail.length > 1) {
			ctx.beginPath();
			ctx.strokeStyle = "rgba(200,204,212,0.35)";
			ctx.lineWidth = 1.5;
			trail.forEach((pt, i) => {
				const p = project(pt.x, pt.z, pt.y, r, rotY, rotX);
				if (i === 0) ctx.moveTo(p.px, p.py);
				else ctx.lineTo(p.px, p.py);
			});
			ctx.stroke();
		}
		const tip = project(x, z, y, r, rotY, rotX);
		ctx.beginPath();
		ctx.strokeStyle = accent;
		ctx.lineWidth = 2;
		ctx.moveTo(0, 0);
		ctx.lineTo(tip.px, tip.py);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = fg;
		ctx.arc(tip.px, tip.py, 4, 0, Math.PI * 2);
		ctx.fill();
	}, [
		x,
		y,
		z,
		trail
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className,
		style: {
			width: "100%",
			height: "100%"
		},
		"aria-label": "Bloch sphere"
	});
}
function mulRe(ar, ai, br, bi) {
	return ar * br - ai * bi;
}
function mulIm(ar, ai, br, bi) {
	return ar * bi + ai * br;
}
function bitstring(index, n) {
	return index.toString(2).padStart(n, "0");
}
var QState = class QState {
	n;
	re;
	im;
	constructor(n, re, im) {
		this.n = n;
		const dim = 1 << n;
		this.re = re ?? new Float64Array(dim);
		this.im = im ?? new Float64Array(dim);
	}
	get dim() {
		return 1 << this.n;
	}
	static computational(n, index = 0) {
		const s = new QState(n);
		s.re[index] = 1;
		return s;
	}
	static plus(n) {
		const s = new QState(n);
		const a = 1 / Math.sqrt(s.dim);
		s.re.fill(a);
		return s;
	}
	clone() {
		return new QState(this.n, this.re.slice(), this.im.slice());
	}
	/** Apply a 2×2 complex matrix to one qubit (qubit 0 = LSB). */
	apply1(qubit, u00r, u00i, u01r, u01i, u10r, u10i, u11r, u11i) {
		const dim = this.dim;
		const bit = 1 << qubit;
		const nr = new Float64Array(dim);
		const ni = new Float64Array(dim);
		const re = this.re;
		const im = this.im;
		for (let i = 0; i < dim; i++) {
			if (i & bit) continue;
			const j = i | bit;
			const ar = re[i];
			const ai = im[i];
			const br = re[j];
			const bi = im[j];
			nr[i] = mulRe(u00r, u00i, ar, ai) + mulRe(u01r, u01i, br, bi);
			ni[i] = mulIm(u00r, u00i, ar, ai) + mulIm(u01r, u01i, br, bi);
			nr[j] = mulRe(u10r, u10i, ar, ai) + mulRe(u11r, u11i, br, bi);
			ni[j] = mulIm(u10r, u10i, ar, ai) + mulIm(u11r, u11i, br, bi);
		}
		this.re = nr;
		this.im = ni;
		return this;
	}
	h(q) {
		const s = Math.SQRT1_2;
		return this.apply1(q, s, 0, s, 0, s, 0, -s, 0);
	}
	x(q) {
		return this.apply1(q, 0, 0, 1, 0, 1, 0, 0, 0);
	}
	y(q) {
		return this.apply1(q, 0, 0, 0, -1, 0, 1, 0, 0);
	}
	z(q) {
		return this.apply1(q, 1, 0, 0, 0, 0, 0, -1, 0);
	}
	s(q) {
		return this.apply1(q, 1, 0, 0, 0, 0, 0, 0, 1);
	}
	t(q) {
		const c = Math.SQRT1_2;
		return this.apply1(q, 1, 0, 0, 0, 0, 0, c, c);
	}
	rx(q, th) {
		const c = Math.cos(th / 2);
		const s = Math.sin(th / 2);
		return this.apply1(q, c, 0, 0, -s, 0, -s, c, 0);
	}
	ry(q, th) {
		const c = Math.cos(th / 2);
		const s = Math.sin(th / 2);
		return this.apply1(q, c, 0, -s, 0, s, 0, c, 0);
	}
	rz(q, th) {
		const hr = Math.cos(th / 2);
		const hi = Math.sin(th / 2);
		return this.apply1(q, hr, -hi, 0, 0, 0, 0, hr, hi);
	}
	phase(q, phi) {
		const cr = Math.cos(phi);
		const ci = Math.sin(phi);
		return this.apply1(q, 1, 0, 0, 0, 0, 0, cr, ci);
	}
	hAll() {
		for (let q = 0; q < this.n; q++) this.h(q);
		return this;
	}
	xAll() {
		for (let q = 0; q < this.n; q++) this.x(q);
		return this;
	}
	cnot(control, target) {
		const dim = this.dim;
		const cbit = 1 << control;
		const tbit = 1 << target;
		const re = this.re;
		const im = this.im;
		for (let i = 0; i < dim; i++) if ((i & cbit) !== 0 && (i & tbit) === 0) {
			const j = i | tbit;
			const tr = re[i];
			const ti = im[i];
			re[i] = re[j];
			im[i] = im[j];
			re[j] = tr;
			im[j] = ti;
		}
		return this;
	}
	cz(a, b) {
		const abit = 1 << a;
		const bbit = 1 << b;
		for (let i = 0; i < this.dim; i++) if (i & abit && i & bbit) {
			this.re[i] = -this.re[i];
			this.im[i] = -this.im[i];
		}
		return this;
	}
	/** exp(-i θ/2 Z⊗Z) */
	rzz(a, b, theta) {
		const hr = Math.cos(theta / 2);
		const hi = Math.sin(theta / 2);
		const abit = 1 << a;
		const bbit = 1 << b;
		for (let i = 0; i < this.dim; i++) {
			const same = (i & abit) === 0 === ((i & bbit) === 0);
			const zr = same ? hr : hr;
			const zi = same ? -hi : hi;
			const r = this.re[i];
			const im = this.im[i];
			this.re[i] = mulRe(zr, zi, r, im);
			this.im[i] = mulIm(zr, zi, r, im);
		}
		return this;
	}
	mcx(controls, target) {
		const mask = controls.reduce((m, q) => m | 1 << q, 0);
		const tbit = 1 << target;
		const re = this.re;
		const im = this.im;
		for (let i = 0; i < this.dim; i++) if ((i & mask) === mask && (i & tbit) === 0) {
			const j = i | tbit;
			const tr = re[i];
			const ti = im[i];
			re[i] = re[j];
			im[i] = im[j];
			re[j] = tr;
			im[j] = ti;
		}
		return this;
	}
	qft(qubits) {
		const qs = qubits ?? [...Array(this.n).keys()].reverse();
		const m = qs.length;
		for (let i = 0; i < m; i++) {
			this.h(qs[i]);
			for (let j = 1; j < m - i; j++) {
				const phi = Math.PI / (1 << j);
				this.cphase(qs[i + j], qs[i], phi);
			}
		}
		for (let i = 0; i < Math.floor(m / 2); i++) this.swap(qs[i], qs[m - 1 - i]);
		return this;
	}
	iqft(qubits) {
		const qs = qubits ?? [...Array(this.n).keys()].reverse();
		const m = qs.length;
		for (let i = 0; i < Math.floor(m / 2); i++) this.swap(qs[i], qs[m - 1 - i]);
		for (let i = m - 1; i >= 0; i--) {
			for (let j = m - i - 1; j >= 1; j--) this.cphase(qs[i + j], qs[i], -Math.PI / (1 << j));
			this.h(qs[i]);
		}
		return this;
	}
	cphase(control, target, phi) {
		const cr = Math.cos(phi);
		const ci = Math.sin(phi);
		const cbit = 1 << control;
		const tbit = 1 << target;
		for (let i = 0; i < this.dim; i++) if (i & cbit && i & tbit) {
			const r = this.re[i];
			const im = this.im[i];
			this.re[i] = mulRe(cr, ci, r, im);
			this.im[i] = mulIm(cr, ci, r, im);
		}
		return this;
	}
	swap(a, b) {
		if (a === b) return this;
		this.cnot(a, b).cnot(b, a).cnot(a, b);
		return this;
	}
	probabilities() {
		const p = new Array(this.dim);
		for (let i = 0; i < this.dim; i++) p[i] = this.re[i] * this.re[i] + this.im[i] * this.im[i];
		return p;
	}
	/** Reduced Bloch vector for one qubit. */
	bloch(qubit) {
		const bit = 1 << qubit;
		let rho00 = 0;
		let rho11 = 0;
		let rho01r = 0;
		let rho01i = 0;
		for (let i = 0; i < this.dim; i++) {
			if (i & bit) continue;
			const j = i | bit;
			const a0r = this.re[i];
			const a0i = this.im[i];
			const a1r = this.re[j];
			const a1i = this.im[j];
			rho00 += a0r * a0r + a0i * a0i;
			rho11 += a1r * a1r + a1i * a1i;
			rho01r += a0r * a1r + a0i * a1i;
			rho01i += a0i * a1r - a0r * a1i;
		}
		return {
			x: 2 * rho01r,
			y: -2 * rho01i,
			z: rho00 - rho11
		};
	}
	expectZ(qubit) {
		return this.bloch(qubit).z;
	}
	mostProbable() {
		const p = this.probabilities();
		let best = 0;
		for (let i = 1; i < p.length; i++) if (p[i] > p[best]) best = i;
		return {
			index: best,
			bits: bitstring(best, this.n),
			p: p[best]
		};
	}
};
function groverOracle(s, marked) {
	const n = s.n;
	for (let q = 0; q < n; q++) if ((marked >> q & 1) === 0) s.x(q);
	s.h(n - 1);
	s.mcx([...Array(n - 1).keys()], n - 1);
	s.h(n - 1);
	for (let q = 0; q < n; q++) if ((marked >> q & 1) === 0) s.x(q);
	return s;
}
function groverDiffuser(s) {
	s.hAll().xAll();
	s.h(s.n - 1);
	s.mcx([...Array(s.n - 1).keys()], s.n - 1);
	s.h(s.n - 1);
	s.xAll().hAll();
	return s;
}
function groverOptimalIters(n, m = 1) {
	const N = 1 << n;
	return Math.max(1, Math.round(Math.PI / 4 * Math.sqrt(N / m)));
}
function runGrover(n, marked, iters) {
	const k = iters ?? groverOptimalIters(n);
	const s = QState.computational(n, 0).hAll();
	const history = [s.probabilities()];
	for (let i = 0; i < k; i++) {
		groverOracle(s, marked);
		groverDiffuser(s);
		history.push(s.probabilities());
	}
	return {
		state: s,
		history,
		iters: k
	};
}
function gcd(a, b) {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) {
		const t = b;
		b = a % b;
		a = t;
	}
	return a;
}
function modPow(base, exp, mod) {
	let result = 1 % mod;
	base %= mod;
	while (exp > 0) {
		if (exp & 1) result = result * base % mod;
		base = base * base % mod;
		exp >>= 1;
	}
	return result;
}
function continuedFraction(y, Q, maxDen) {
	const convergents = [];
	let n = y;
	let d = Q;
	let p0 = 0, p1 = 1, q0 = 1, q1 = 0;
	for (let i = 0; i < 32; i++) {
		const a = Math.floor(n / d);
		const p = a * p1 + p0;
		const q = a * q1 + q0;
		convergents.push({
			p,
			q
		});
		if (q >= maxDen) break;
		const rem = n - a * d;
		if (rem === 0) break;
		n = d;
		d = rem;
		p0 = p1;
		p1 = p;
		q0 = q1;
		q1 = q;
	}
	return convergents;
}
function factorFromPeriod(N, a, r) {
	if (r % 2 !== 0 || r <= 0) return null;
	const x = modPow(a, r / 2, N);
	const f1 = gcd(x + 1, N);
	const f2 = gcd(x - 1, N);
	if (f1 > 1 && f1 < N) return [f1, N / f1].sort((x, y) => x - y);
	if (f2 > 1 && f2 < N) return [f2, N / f2].sort((x, y) => x - y);
	return null;
}
/** Analytic QFT period-finding histogram (exact for coprime a). */
function shorHistogram(N, a, t) {
	const Q = 1 << t;
	const period = (() => {
		let x = 1;
		for (let r = 1; r <= N; r++) {
			x = x * a % N;
			if (x === 1) return r;
		}
		return N;
	})();
	const bins = new Array(Q).fill(0);
	const copies = Math.max(1, Math.floor(Q / period));
	for (let k = 0; k < period; k++) {
		const center = k * Q / period;
		for (let y = 0; y < Q; y++) {
			const wrapped = (y - center + Q / 2) % Q - Q / 2;
			const denom = period * Math.sin(Math.PI * wrapped / Q);
			const val = Math.abs(wrapped) < 1e-9 ? 1 / period : (Math.sin(Math.PI * wrapped * copies / Q) / (denom || 1)) ** 2;
			bins[y] += Math.max(0, val);
		}
	}
	const sum = bins.reduce((a, b) => a + b, 0) || 1;
	return {
		period,
		probs: bins.map((p) => p / sum),
		Q
	};
}
function maxcutValue(bits, edges) {
	let cut = 0;
	for (const [i, j] of edges) if ((bits >> i & 1) !== (bits >> j & 1)) cut++;
	return cut;
}
function qaoaP1(n, edges, gamma, beta) {
	const s = QState.plus(n);
	for (const [i, j] of edges) s.rzz(i, j, -gamma);
	for (let q = 0; q < n; q++) s.rx(q, 2 * beta);
	const p = s.probabilities();
	let exp = 0;
	for (let i = 0; i < p.length; i++) exp += p[i] * maxcutValue(i, edges);
	const polarizations = Array.from({ length: n }, (_, q) => s.expectZ(q));
	return {
		state: s,
		expectation: exp,
		probs: p,
		polarizations
	};
}
function qaoaSweep(n, edges, steps = 24) {
	let best = {
		gamma: 0,
		beta: 0,
		expectation: -Infinity
	};
	const heat = [];
	for (let gi = 0; gi < steps; gi++) {
		const row = [];
		const gamma = gi / (steps - 1) * Math.PI;
		for (let bi = 0; bi < steps; bi++) {
			const beta = bi / (steps - 1) * Math.PI;
			const { expectation } = qaoaP1(n, edges, gamma, beta);
			row.push(expectation);
			if (expectation > best.expectation) best = {
				gamma,
				beta,
				expectation
			};
		}
		heat.push(row);
	}
	return {
		best,
		heat
	};
}
/**
* 1-qubit Lindblad evolution in Bloch form.
* H = (ω/2) n̂ · σ, amplitude damping γ, dephasing Γ.
*/
function evolveBloch(x0, y0, z0, opts) {
	const steps = opts.steps ?? 160;
	const dt = opts.t / steps;
	let x = x0, y = y0, z = z0;
	const trail = [{
		t: 0,
		x,
		y,
		z
	}];
	for (let i = 1; i <= steps; i++) {
		const ox = opts.axis === "x" ? opts.omega : 0;
		const oy = opts.axis === "y" ? opts.omega : 0;
		const oz = opts.axis === "z" ? opts.omega : 0;
		const dxp = oy * z - oz * y;
		const dyp = oz * x - ox * z;
		const dzp = ox * y - oy * x;
		const g = opts.gamma;
		const G = opts.dephasing;
		const dx = dxp - (g / 2 + G) * x;
		const dy = dyp - (g / 2 + G) * y;
		const dz = dzp - g * (z - 1);
		x += dx * dt;
		y += dy * dt;
		z += dz * dt;
		const n = Math.hypot(x, y, z);
		if (n > 1) {
			x /= n;
			y /= n;
			z /= n;
		}
		trail.push({
			t: i * dt,
			x,
			y,
			z
		});
	}
	return trail;
}
function encodeBitFlip(bit) {
	const s = QState.computational(3, bit);
	s.cnot(0, 1).cnot(0, 2);
	return s;
}
function bitFlipSyndrome(s) {
	const p = s.probabilities();
	let s1 = 0;
	let s2 = 0;
	let w = 0;
	for (let i = 0; i < 8; i++) {
		const b0 = i & 1;
		const b1 = i >> 1 & 1;
		const b2 = i >> 2 & 1;
		s1 += p[i] * (b0 === b1 ? 1 : -1);
		s2 += p[i] * (b1 === b2 ? 1 : -1);
		w += p[i];
	}
	const syn = [s1 < 0 ? 1 : 0, s2 < 0 ? 1 : 0];
	return {
		syn,
		flip: syn[0] === 1 && syn[1] === 0 ? 0 : syn[0] === 1 && syn[1] === 1 ? 1 : syn[0] === 0 && syn[1] === 1 ? 2 : -1,
		p
	};
}
function quantumKernel(x, y) {
	const a = QState.computational(2, 0);
	a.ry(0, x[0]).ry(1, x[1]);
	a.cnot(0, 1);
	a.ry(0, x[0] * x[1]).ry(1, x[0] + x[1]);
	const b = QState.computational(2, 0);
	b.ry(0, y[0]).ry(1, y[1]);
	b.cnot(0, 1);
	b.ry(0, y[0] * y[1]).ry(1, y[0] + y[1]);
	let re = 0;
	let im = 0;
	for (let i = 0; i < 4; i++) {
		re += a.re[i] * b.re[i] + a.im[i] * b.im[i];
		im += a.im[i] * b.re[i] - a.re[i] * b.im[i];
	}
	return re * re + im * im;
}
function qcbmProbs(params, n) {
	const s = QState.computational(n, 0);
	for (const layer of params) {
		for (let q = 0; q < n; q++) s.ry(q, layer[q] ?? 0);
		for (let q = 0; q < n - 1; q++) s.cz(q, q + 1);
	}
	return s.probabilities();
}
function klDivergence(p, q) {
	let s = 0;
	for (let i = 0; i < p.length; i++) if (p[i] > 1e-12) s += p[i] * Math.log(p[i] / Math.max(q[i], 1e-12));
	return s;
}
var AXES = [
	"x",
	"y",
	"z"
];
function EvolutionLab() {
	const [axis, setAxis] = (0, import_react.useState)("x");
	const [omega, setOmega] = (0, import_react.useState)(1);
	const [t, setT] = (0, import_react.useState)(1.2);
	const [gamma, setGamma] = (0, import_react.useState)(0);
	const [dephasing, setDephasing] = (0, import_react.useState)(0);
	const [init, setInit] = (0, import_react.useState)("0");
	const start = init === "0" ? {
		x: 0,
		y: 0,
		z: 1
	} : init === "1" ? {
		x: 0,
		y: 0,
		z: -1
	} : {
		x: 1,
		y: 0,
		z: 0
	};
	const trail = (0, import_react.useMemo)(() => evolveBloch(start.x, start.y, start.z, {
		omega,
		axis,
		gamma,
		dephasing,
		t
	}), [
		start.x,
		start.y,
		start.z,
		omega,
		axis,
		gamma,
		dephasing,
		t
	]);
	const last = trail[trail.length - 1];
	const exact = (0, import_react.useMemo)(() => {
		const s = QState.computational(1, init === "1" ? 1 : 0);
		if (init === "+") s.h(0);
		if (axis === "x") s.rx(0, omega * t);
		if (axis === "y") s.ry(0, omega * t);
		if (axis === "z") s.rz(0, omega * t);
		return s.bloch(0);
	}, [
		axis,
		omega,
		t,
		init
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1.1fr_0.9fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			className: "h-[380px] md:h-[440px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlochSphere, {
				x: last.x,
				y: last.y,
				z: last.z,
				trail
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Formula, { children: [
					"U(t) = exp(−i ",
					axis.toUpperCase(),
					" ω t / 2) · |ψ(0)⟩ = ",
					init === "0" ? "|0⟩" : init === "1" ? "|1⟩" : "|+⟩"
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								"0",
								"+",
								"1"
							].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: init === k ? "default" : "secondary",
								onClick: () => setInit(k),
								children: k === "0" ? "|0⟩" : k === "1" ? "|1⟩" : "|+⟩"
							}, k))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: AXES.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: axis === a ? "default" : "ghost",
								onClick: () => setAxis(a),
								children: ["H ∝ ", a.toUpperCase()]
							}, a))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "ω  (drive)",
							value: omega.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: 3,
								step: .05,
								value: [omega],
								onValueChange: (v) => setOmega(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "t",
							value: t.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI * 2,
								step: .02,
								value: [t],
								onValueChange: (v) => setT(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Amplitude damping γ",
							value: gamma.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: 1.5,
								step: .02,
								value: [gamma],
								onValueChange: (v) => setGamma(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Dephasing Γ",
							value: dephasing.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: 1.5,
								step: .02,
								value: [dephasing],
								onValueChange: (v) => setDephasing(v[0])
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Closed-system Bloch (exact unitary)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-sm tabular-nums",
						children: [
							"⟨X⟩ ",
							exact.x.toFixed(3),
							" · ⟨Y⟩ ",
							exact.y.toFixed(3),
							" · ⟨Z⟩ ",
							exact.z.toFixed(3)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted",
						children: "Open-system trail (Lindblad)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-sm tabular-nums",
						children: [
							"⟨X⟩ ",
							last.x.toFixed(3),
							" · ⟨Y⟩ ",
							last.y.toFixed(3),
							" · ⟨Z⟩ ",
							last.z.toFixed(3)
						]
					})
				] })
			]
		})]
	});
}
function AmplitudeBars({ probs, n, highlight, maxBars = 16 }) {
	const shown = probs.slice(0, Math.min(probs.length, maxBars));
	const peak = Math.max(1e-9, ...shown);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-44 items-end gap-1",
		children: shown.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col items-center gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("w-full rounded-t-xs transition-[height] duration-200", i === highlight ? "bg-accent" : "bg-accent/35"),
				style: { height: `${Math.max(2, p / peak * 100)}%` },
				title: `${bitstring(i, n)}  ${(p * 100).toFixed(1)}%`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[9px] text-faint tabular-nums",
				children: n <= 3 ? bitstring(i, n) : i
			})]
		}, i))
	});
}
function GroverLab() {
	const [n, setN] = (0, import_react.useState)(3);
	const N = 1 << n;
	const [marked, setMarked] = (0, import_react.useState)(5);
	const [step, setStep] = (0, import_react.useState)(0);
	const opt = groverOptimalIters(n);
	const safeMarked = marked % N;
	const run = (0, import_react.useMemo)(() => runGrover(n, safeMarked, opt + 2), [
		n,
		safeMarked,
		opt
	]);
	const idx = Math.min(step, run.history.length - 1);
	const probs = run.history[idx];
	const success = probs[safeMarked] ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Formula, { children: [
				"N = ",
				N,
				" · marked = |",
				safeMarked.toString(2).padStart(n, "0"),
				"⟩ · k* = ",
				opt
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Qubits n",
							value: String(n),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 2,
								max: 4,
								step: 1,
								value: [n],
								onValueChange: (v) => {
									setN(v[0]);
									setStep(0);
									setMarked((m) => m % (1 << v[0]));
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Marked item",
							value: `|${safeMarked.toString(2).padStart(n, "0")}⟩`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: N - 1,
								step: 1,
								value: [safeMarked],
								onValueChange: (v) => {
									setMarked(v[0]);
									setStep(0);
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Grover iterations",
							value: `${idx} / ${opt} optimal`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: run.history.length - 1,
								step: 1,
								value: [idx],
								onValueChange: (v) => setStep(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setStep(0),
								children: "Reset"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => setStep((s) => Math.min(run.history.length - 1, s + 1)),
								children: "Iterate"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-2 text-xs text-muted",
					children: [
						"P(marked) = ",
						(success * 100).toFixed(1),
						"%"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmplitudeBars, {
					probs,
					n,
					highlight: safeMarked
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Each Grover iterate is oracle (phase flip on the marked basis state) then diffuser (inversion about the mean). Past k* the state rotates past the target and success probability falls — over-rotation is the usual trap."
			}) })
		]
	});
}
var TERMS = [
	{
		name: "I ⊗ I",
		p: .5,
		sign: 1,
		tag: "identity"
	},
	{
		name: "Z ⊗ Z",
		p: .5,
		sign: 1,
		tag: "parity"
	},
	{
		name: "X ⊗ X",
		p: .5,
		sign: -1,
		tag: "flip"
	},
	{
		name: "Y ⊗ Y",
		p: .5,
		sign: -1,
		tag: "phase-flip"
	}
];
function twoQubitBellCut() {
	const s = QState.computational(2, 0);
	s.h(0).cnot(0, 1);
	return s.probabilities();
}
function KnittingLab() {
	const [active, setActive] = (0, import_react.useState)(null);
	const bell = (0, import_react.useMemo)(() => twoQubitBellCut(), []);
	const recon = (0, import_react.useMemo)(() => {
		return bell;
	}, [bell]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "CNOT wire-cut · Λ = Σ pₖ Λₖ with ||p||₁ = 2 (two-qubit example)" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 520 160",
				className: "h-40 w-full text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "8",
						y: "28",
						fill: "currentColor",
						fontSize: "12",
						fontFamily: "Figtree",
						children: "Chip A"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "360",
						y: "28",
						fill: "currentColor",
						fontSize: "12",
						fontFamily: "Figtree",
						children: "Chip B"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "20",
						y1: "70",
						x2: "200",
						y2: "70",
						stroke: "var(--color-accent)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "320",
						y1: "70",
						x2: "500",
						y2: "70",
						stroke: "var(--color-accent)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "20",
						y1: "110",
						x2: "200",
						y2: "110",
						stroke: "var(--color-faint)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "320",
						y1: "110",
						x2: "500",
						y2: "110",
						stroke: "var(--color-faint)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "210",
						y: "52",
						width: "100",
						height: "36",
						rx: "8",
						fill: "var(--color-subtle)",
						stroke: "var(--color-border-strong)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "260",
						y: "75",
						textAnchor: "middle",
						fill: "var(--color-fg)",
						fontSize: "11",
						fontFamily: "IBM Plex Mono",
						children: "CUT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "260",
						y: "130",
						textAnchor: "middle",
						fill: "var(--color-muted)",
						fontSize: "11",
						fontFamily: "Figtree",
						children: "replace CNOT with local ops + classical mix"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: TERMS.map((term, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setActive(i),
					className: "rounded-lg bg-elevated p-4 text-left shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-sm",
						children: term.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							"weight ",
							term.sign < 0 ? "−" : "+",
							term.p,
							" · ",
							term.tag
						]
					})]
				}, term.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: active === null ? "Select a quasi-probability term. Each is a pair of single-chip circuits: prepare/measure on the cut qubit, then average with the signed weight." : `${TERMS[active].name} is sampled locally. Negative weights are why knitting costs shots — variance scales with ||p||₁².`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-mono text-xs tabular-nums text-faint",
					children: ["Bell target P(00)+P(11) = ", (recon[0] + recon[3]).toFixed(3)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setActive(null),
						children: "Clear term"
					})
				})
			] })
		]
	});
}
function MesolveLab() {
	const [omega, setOmega] = (0, import_react.useState)(2);
	const [gamma, setGamma] = (0, import_react.useState)(.4);
	const [deph, setDeph] = (0, import_react.useState)(.15);
	const [t, setT] = (0, import_react.useState)(6);
	const trail = (0, import_react.useMemo)(() => evolveBloch(1, 0, 0, {
		omega,
		axis: "z",
		gamma,
		dephasing: deph,
		t,
		steps: 180
	}), [
		omega,
		gamma,
		deph,
		t
	]);
	const last = trail[trail.length - 1];
	const data = trail.filter((_, i) => i % 3 === 0).map((p) => ({
		t: Number(p.t.toFixed(2)),
		X: p.x,
		Y: p.y,
		Z: p.z,
		r: Math.hypot(p.x, p.y, p.z)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "dρ/dt = −i[ (ω/2)Z , ρ ] + γ 𝒟[σ₋]ρ + Γ 𝒟[σ_z]ρ" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[0.9fr_1.1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					className: "h-72",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlochSphere, {
						x: last.x,
						y: last.y,
						z: last.z,
						trail
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					className: "h-72",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data,
							margin: {
								top: 8,
								right: 8,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "t",
									stroke: "#5c5c64",
									fontSize: 11
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									domain: [-1, 1],
									stroke: "#5c5c64",
									fontSize: 11
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "#121214",
									border: "1px solid rgb(240 240 242 / 0.12)",
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "X",
									stroke: "#c8ccd4",
									dot: false,
									strokeWidth: 1.5
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "Z",
									stroke: "#8a8a92",
									dot: false,
									strokeWidth: 1.5
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "r",
									stroke: "#7d9b86",
									dot: false,
									strokeWidth: 1.5
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-4 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "ω  (Z drive)",
						value: omega.toFixed(2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 4,
							step: .05,
							value: [omega],
							onValueChange: (v) => setOmega(v[0])
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Horizon t",
						value: t.toFixed(1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 1,
							max: 12,
							step: .1,
							value: [t],
							onValueChange: (v) => setT(v[0])
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Amplitude damping γ",
						value: gamma.toFixed(2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 2,
							step: .02,
							value: [gamma],
							onValueChange: (v) => setGamma(v[0])
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Dephasing Γ",
						value: deph.toFixed(2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 2,
							step: .02,
							value: [deph],
							onValueChange: (v) => setDeph(v[0])
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "This is the same ODE QuTiP integrates with zvode inside mesolve. Purity Tr(ρ²) is the squared Bloch radius. When r → 0 the state is fully mixed; γ pulls it toward |0⟩ instead."
			}) })
		]
	});
}
var N$1 = 4;
var EDGES = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 0]
];
function GraphCut({ bits }) {
	const pos = [
		{
			x: 40,
			y: 40
		},
		{
			x: 160,
			y: 40
		},
		{
			x: 160,
			y: 140
		},
		{
			x: 40,
			y: 140
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 200 180",
		className: "h-44 w-full",
		children: [EDGES.map(([i, j], k) => {
			const cut = (bits >> i & 1) !== (bits >> j & 1);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: pos[i].x,
				y1: pos[i].y,
				x2: pos[j].x,
				y2: pos[j].y,
				stroke: cut ? "var(--color-accent)" : "var(--color-faint)",
				strokeWidth: cut ? 2.5 : 1
			}, k);
		}), pos.map((p, i) => {
			const on = bits >> i & 1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: p.x,
				cy: p.y,
				r: 14,
				fill: on ? "var(--color-fg)" : "var(--color-subtle)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: p.x,
				y: p.y + 4,
				textAnchor: "middle",
				fontSize: "11",
				fill: on ? "var(--color-bg)" : "var(--color-muted)",
				fontFamily: "IBM Plex Mono",
				children: i
			})] }, i);
		})]
	});
}
function QaoaLab() {
	const [gamma, setGamma] = (0, import_react.useState)(.4);
	const [beta, setBeta] = (0, import_react.useState)(.35);
	const [threshold, setThreshold] = (0, import_react.useState)(.35);
	const result = (0, import_react.useMemo)(() => qaoaP1(N$1, EDGES, gamma, beta), [gamma, beta]);
	const sweep = (0, import_react.useMemo)(() => qaoaSweep(N$1, EDGES, 16), []);
	const bestIdx = result.probs.reduce((b, p, i) => p > result.probs[b] ? i : b, 0);
	const cut = maxcutValue(bestIdx, EDGES);
	const fixed = result.polarizations.map((z, i) => Math.abs(z) >= threshold ? {
		i,
		sign: z > 0 ? 1 : -1
	} : null).filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "|γ,β⟩ = exp(-iβ ΣX) exp(-iγ H_C) |+⟩^4 on C4 (optimal cut = 4)" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphCut, { bits: bestIdx }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-mono text-xs text-muted tabular-nums",
					children: [
						"Sampled cut ",
						cut,
						" · ⟨H_C⟩ ",
						result.expectation.toFixed(3),
						" · landscape max ",
						sweep.best.expectation.toFixed(3)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "γ  cost",
							value: gamma.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI,
								step: .02,
								value: [gamma],
								onValueChange: (v) => setGamma(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "β  mixer",
							value: beta.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI,
								step: .02,
								value: [beta],
								onValueChange: (v) => setBeta(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "text-left text-xs text-muted underline-offset-2 hover:text-fg hover:underline",
							onClick: () => {
								setGamma(sweep.best.gamma);
								setBeta(sweep.best.beta);
							},
							children: [
								"Snap to landscape optimum γ=",
								sweep.best.gamma.toFixed(2),
								" β=",
								sweep.best.beta.toFixed(2)
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs text-muted",
				children: "Bitstring probabilities after p = 1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmplitudeBars, {
				probs: result.probs,
				n: N$1,
				highlight: bestIdx
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-faint",
						children: "Recursive reduction"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Fix |⟨Zᵢ⟩| above",
						value: threshold.toFixed(2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: .1,
							max: .9,
							step: .01,
							value: [threshold],
							onValueChange: (v) => setThreshold(v[0])
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-2",
						children: result.polarizations.map((z, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-subtle px-2 py-2 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-xs text-faint",
									children: ["q", i]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm tabular-nums",
									children: z.toFixed(2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted",
									children: Math.abs(z) >= threshold ? z > 0 ? "fix +1" : "fix −1" : "keep"
								})
							]
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: fixed.length === 0 ? "No qubit is polarized enough — deepen p or retune γ, β." : `Fix ${fixed.length} qubit${fixed.length > 1 ? "s" : ""}, drop incident edges, and rerun a shallow QAOA on the remainder.`
					})
				]
			})
		]
	});
}
var N = 3;
var TARGET = (() => {
	const t = new Array(8).fill(.02);
	t[0] = .28;
	t[3] = .22;
	t[5] = .18;
	t[7] = .16;
	const s = t.reduce((a, b) => a + b, 0);
	return t.map((p) => p / s);
})();
function QbmLab() {
	const [a0, setA0] = (0, import_react.useState)(.8);
	const [a1, setA1] = (0, import_react.useState)(1.1);
	const [a2, setA2] = (0, import_react.useState)(.4);
	const [b0, setB0] = (0, import_react.useState)(.6);
	const [b1, setB1] = (0, import_react.useState)(.9);
	const [b2, setB2] = (0, import_react.useState)(1.3);
	const model = (0, import_react.useMemo)(() => qcbmProbs([[
		a0,
		a1,
		a2
	], [
		b0,
		b1,
		b2
	]], N), [
		a0,
		a1,
		a2,
		b0,
		b1,
		b2
	]);
	const kl = klDivergence(TARGET, model);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "P_θ(z) = |⟨z| RY⊗³ CZ RY⊗³ |0⟩|² · 3-qubit QCBM vs a multimodal prior" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs text-muted",
					children: "Target"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmplitudeBars, {
					probs: TARGET,
					n: N
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-2 text-xs text-muted",
					children: ["QCBM  KL = ", kl.toFixed(3)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmplitudeBars, {
					probs: model,
					n: N
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wider text-faint",
							children: "Layer 1 · RY"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "θ₀",
							value: a0.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI,
								step: .02,
								value: [a0],
								onValueChange: (v) => setA0(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "θ₁",
							value: a1.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI,
								step: .02,
								value: [a1],
								onValueChange: (v) => setA1(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "θ₂",
							value: a2.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI,
								step: .02,
								value: [a2],
								onValueChange: (v) => setA2(v[0])
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wider text-faint",
							children: "Layer 2 · RY"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "φ₀",
							value: b0.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI,
								step: .02,
								value: [b0],
								onValueChange: (v) => setB0(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "φ₁",
							value: b1.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI,
								step: .02,
								value: [b1],
								onValueChange: (v) => setB1(v[0])
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "φ₂",
							value: b2.toFixed(2),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.PI,
								step: .02,
								value: [b2],
								onValueChange: (v) => setB2(v[0])
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "A quantum Boltzmann machine replaces the Born circuit with an Ising thermal state. On annealers you sample the negative phase natively; on gate hardware you train a variational thermal ansatz. Same job as a classical RBM, with entanglement in the hidden layer."
			}) })
		]
	});
}
function QecLab() {
	const [logical, setLogical] = (0, import_react.useState)(1);
	const [errorQ, setErrorQ] = (0, import_react.useState)(null);
	const encoded = (0, import_react.useMemo)(() => encodeBitFlip(logical), [logical]);
	const noisy = (0, import_react.useMemo)(() => {
		const s = encoded.clone();
		if (errorQ !== null) s.x(errorQ);
		return s;
	}, [encoded, errorQ]);
	const syn = bitFlipSyndrome(noisy);
	const corrected = (0, import_react.useMemo)(() => {
		const s = noisy.clone();
		if (syn.flip >= 0) s.x(syn.flip);
		return s;
	}, [noisy, syn.flip]);
	const decode = (s) => {
		const p = s.probabilities();
		return p[0] + p[1] > .5 ? 0 : 1;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "|ψ⟩_L = α|000⟩ + β|111⟩ · syndrome (Z₀Z₁, Z₁Z₂)" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: logical === 0 ? "default" : "secondary",
					onClick: () => setLogical(0),
					children: "Encode |0⟩"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: logical === 1 ? "default" : "secondary",
					onClick: () => setLogical(1),
					children: "Encode |1⟩"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [[
					0,
					1,
					2
				].map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: errorQ === q ? "default" : "outline",
					onClick: () => setErrorQ(q),
					children: ["Inject X on q", q]
				}, q)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => setErrorQ(null),
					children: "No error"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-faint",
						children: "Encoded"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmplitudeBars, {
						probs: encoded.probabilities(),
						n: 3,
						highlight: logical === 0 ? 0 : 7
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-faint",
						children: "After error"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmplitudeBars, {
						probs: noisy.probabilities(),
						n: 3,
						highlight: noisy.mostProbable().index
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-faint",
						children: "Corrected"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmplitudeBars, {
						probs: corrected.probabilities(),
						n: 3,
						highlight: logical === 0 ? 0 : 7
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-sm tabular-nums",
				children: [
					"Syndrome ",
					syn.syn[0],
					syn.syn[1],
					" · flip qubit ",
					syn.flip < 0 ? "none" : syn.flip,
					" · decoded ",
					decode(corrected),
					" · peak |",
					bitstring(corrected.mostProbable().index, 3),
					"⟩"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Stabilizers commute with the logical Z_L = ZZZ, so the data is never directly measured. Two errors still defeat this code — that is why distance-3 is a teaching code, not a factory."
			})] })
		]
	});
}
function makeData(sep) {
	const pts = [];
	for (let i = 0; i < 18; i++) {
		const a = i / 18 * Math.PI;
		pts.push({
			x: .55 + .35 * Math.cos(a) + sep * .15,
			y: .45 + .28 * Math.sin(a),
			label: 1
		});
		pts.push({
			x: 2.4 - .35 * Math.cos(a) - sep * .15,
			y: 2.5 - .28 * Math.sin(a),
			label: -1
		});
	}
	return pts;
}
function kernelSVM(data, query) {
	let score = 0;
	for (const p of data) score += p.label * quantumKernel(query, [p.x, p.y]);
	return score;
}
function QmlLab() {
	const [sep, setSep] = (0, import_react.useState)(1);
	const [qx, setQx] = (0, import_react.useState)(1.5);
	const [qy, setQy] = (0, import_react.useState)(1.5);
	const data = (0, import_react.useMemo)(() => makeData(sep), [sep]);
	const score = kernelSVM(data, [qx, qy]);
	const pred = score >= 0 ? 1 : -1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: "φ(x) = RY(x₀)⊗RY(x₁) · CNOT · RY(x₀x₁) · K = |⟨φ(x)|φ(x′)⟩|²" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[1.1fr_0.9fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 320 320",
				className: "h-72 w-full",
				children: [data.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 40 + p.x * 80,
					cy: 280 - p.y * 80,
					r: 5,
					fill: p.label > 0 ? "var(--color-fg)" : "var(--color-muted)"
				}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 40 + qx * 80,
					cy: 280 - qy * 80,
					r: 8,
					fill: "none",
					stroke: "var(--color-accent)",
					strokeWidth: "2"
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Class separation",
						value: sep.toFixed(2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 2,
							step: .05,
							value: [sep],
							onValueChange: (v) => setSep(v[0])
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Query x",
						value: qx.toFixed(2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 3,
							step: .05,
							value: [qx],
							onValueChange: (v) => setQx(v[0])
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Query y",
						value: qy.toFixed(2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 3,
							step: .05,
							value: [qy],
							onValueChange: (v) => setQy(v[0])
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-sm tabular-nums",
						children: [
							"kernel score ",
							score.toFixed(3),
							" → class ",
							pred > 0 ? "+1" : "−1"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "QNNs replace the kernel with a variational circuit trained by SPSA. QRL uses the same ansatz as a policy, with Grover-like amplitude tricks only when an oracle exists."
					})
				]
			})]
		})]
	});
}
var PRESETS = [
	{
		N: 15,
		a: 7
	},
	{
		N: 15,
		a: 4
	},
	{
		N: 21,
		a: 2
	},
	{
		N: 33,
		a: 5
	}
];
function ShorLab() {
	const [preset, setPreset] = (0, import_react.useState)(0);
	const [tBits, setTBits] = (0, import_react.useState)(6);
	const { N, a } = PRESETS[preset];
	const coprime = gcd(a, N) === 1;
	const table = (0, import_react.useMemo)(() => {
		const rows = [];
		let x = 1;
		for (let k = 0; k < Math.min(N, 16); k++) {
			rows.push({
				k,
				ax: x
			});
			x = x * a % N;
		}
		return rows;
	}, [N, a]);
	const hist = (0, import_react.useMemo)(() => coprime ? shorHistogram(N, a, tBits) : null, [
		N,
		a,
		tBits,
		coprime
	]);
	const readout = (0, import_react.useMemo)(() => {
		if (!hist) return null;
		const y = hist.probs.reduce((best, p, i) => p > hist.probs[best] ? i : best, 0);
		const conv = continuedFraction(y, hist.Q, N);
		const r = conv.map((c) => c.q).filter((q) => q > 0 && q <= N && modPow(a, q, N) === 1)[0] ?? hist.period;
		return {
			y,
			r,
			factors: factorFromPeriod(N, a, r),
			conv
		};
	}, [
		hist,
		N,
		a
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Formula, { children: [
				"f(x) = ",
				a,
				"ˣ mod ",
				N,
				" · QFT on ",
				tBits,
				" counting qubits"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: PRESETS.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: preset === i ? "default" : "secondary",
					onClick: () => setPreset(i),
					children: [
						"N=",
						p.N,
						", a=",
						p.a
					]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Counting qubits t",
				value: `${tBits}  (Q = ${1 << tBits})`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					min: 4,
					max: 8,
					step: 1,
					value: [tBits],
					onValueChange: (v) => setTBits(v[0])
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs font-medium uppercase tracking-wider text-faint",
						children: "Modular powers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-2 font-mono text-xs tabular-nums",
						children: table.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-sm bg-subtle px-2 py-1.5",
							children: [
								a,
								"^",
								row.k,
								"=",
								row.ax
							]
						}, row.k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							"Period r = ",
							hist?.period ?? "—",
							" · gcd(",
							a,
							",",
							N,
							") = ",
							gcd(a, N)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-medium uppercase tracking-wider text-faint",
					children: "QFT peaks"
				}), hist ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmplitudeBars, {
					probs: hist.probs,
					n: tBits,
					maxBars: Math.min(32, hist.Q)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-warn",
					children: "a shares a factor with N — factoring is already classical."
				})] })]
			}),
			readout ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wider text-faint",
					children: "Continued fractions"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-mono text-sm tabular-nums",
					children: [
						"y = ",
						readout.y,
						" / ",
						1 << tBits,
						" → candidates ",
						readout.conv.map((c) => c.q).join(", ")
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm",
					children: [
						"Recovered period r = ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: readout.r
						}),
						readout.factors ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							" ",
							"→ ",
							N,
							" = ",
							readout.factors[0],
							" × ",
							readout.factors[1]
						] }) : " — odd period or spurious; retry another a."
					]
				})
			] }) : null
		]
	});
}
var LAB_VIEWS = {
	evolution: EvolutionLab,
	shor: ShorLab,
	grover: GroverLab,
	qaoa: QaoaLab,
	knitting: KnittingLab,
	annealing: AnnealingLab,
	qec: QecLab,
	advantage: AdvantageLab,
	qml: QmlLab,
	qbm: QbmLab,
	mesolve: MesolveLab,
	atlas: AtlasLab
};
function LabPage() {
	const { id } = Route.useParams();
	const lab = labById(id);
	const View = LAB_VIEWS[id];
	const mark = useProgress((s) => s.mark);
	(0, import_react.useEffect)(() => {
		if (lab) mark(lab.id);
	}, [lab, mark]);
	if (!lab || !View) throw notFound();
	const prev = prevLab(lab.id);
	const next = nextLab(lab.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		activeId: lab.id,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-faint tabular-nums",
						children: ["Chapter ", lab.chapter]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-4xl",
						children: lab.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-muted",
						children: lab.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { children: lab.formula })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(View, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex items-center justify-between gap-4 border-t border-border pt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/lab/$id",
					params: { id: prev.id },
					className: "inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), prev.title]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/lab/$id",
					params: { id: next.id },
					className: "inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg",
					children: [next.title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})]
			})
		]
	});
}
//#endregion
export { LabPage as component };
