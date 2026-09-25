import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Menu, t as X } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-Cn-Ua-TU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LABS = [
	{
		id: "evolution",
		chapter: "01",
		title: "Time Evolution",
		kicker: "Schrödinger → unitaries",
		summary: "States evolve as |ψ(t)⟩ = e^{−iHt/ℏ}|ψ(0)⟩. Drive a qubit with X, Y, or Z and watch the Bloch vector precess.",
		formula: "U(t) = exp(−iHt/ℏ)"
	},
	{
		id: "shor",
		chapter: "02",
		title: "Shor’s Algorithm",
		kicker: "Period finding → factoring",
		summary: "Factoring reduces to finding the period of aˣ mod N. The QFT turns that period into sharp peaks you can read classically.",
		formula: "aʳ ≡ 1 (mod N)"
	},
	{
		id: "grover",
		chapter: "03",
		title: "Grover Search",
		kicker: "Amplitude amplification",
		summary: "Unstructured search in √N queries. Each oracle + diffuser rotates the state 2θ toward the marked item.",
		formula: "k ≈ (π/4) √(N/M)"
	},
	{
		id: "qaoa",
		chapter: "04",
		title: "QAOA & Recursion",
		kicker: "Combinatorial optimization",
		summary: "Alternate cost and mixer unitaries. Sweep γ, β for MaxCut, then fix polarized qubits the way recursive QAOA shrinks instances.",
		formula: "|γ,β⟩ = U_B(β) U_C(γ) |+⟩^n"
	},
	{
		id: "knitting",
		chapter: "05",
		title: "Circuit Knitting",
		kicker: "Cut, sample, reconstruct",
		summary: "A non-local wire becomes a signed sum of local channels. Quasi-probability reconstruction stitches subcircuits back together.",
		formula: "Λ(ρ) = Σₖ pₖ Λₖ(ρ)"
	},
	{
		id: "annealing",
		chapter: "06",
		title: "Annealing vs QAOA",
		kicker: "Analog and gate-model",
		summary: "Adiabatic evolution vs a variational alternating ansatz. Same Ising target, different hardware and failure modes.",
		formula: "H(s) = (1−s)H_B + s H_C"
	},
	{
		id: "qec",
		chapter: "07",
		title: "Error Correction",
		kicker: "Logical qubits",
		summary: "The three-qubit bit-flip code encodes one logical bit, measures a syndrome, and corrects without reading the data.",
		formula: "|0⟩_L = |000⟩,  |1⟩_L = |111⟩"
	},
	{
		id: "advantage",
		chapter: "08",
		title: "Quantum Advantage",
		kicker: "Where it actually bites",
		summary: "Chemistry, optimization, sensing, and sampling — honest about NISQ limits and where quadratic or exponential leverage appears.",
		formula: "T_classical / T_quantum"
	},
	{
		id: "qml",
		chapter: "09",
		title: "Quantum ML",
		kicker: "Kernels, QNNs, QRL",
		summary: "A two-qubit feature map turns 2D points into a Hilbert kernel. Compare with variational circuits and policy-gradient sketches.",
		formula: "K(x,x′) = |⟨φ(x)|φ(x′)⟩|²"
	},
	{
		id: "qbm",
		chapter: "10",
		title: "Born Machines",
		kicker: "QCBM & QBM priors",
		summary: "A hardware-efficient circuit as a generative model. Tune RY layers and compare the Born distribution to a target histogram.",
		formula: "P(z) = |⟨z|U(θ)|0⟩|²"
	},
	{
		id: "mesolve",
		chapter: "11",
		title: "Open Systems",
		kicker: "Lindblad / mesolve",
		summary: "QuTiP’s mesolve integrates dρ/dt = −i[H,ρ] + Σ 𝒟[Lₖ]ρ. Add amplitude damping and dephasing and watch purity collapse.",
		formula: "dρ/dt = −i[H,ρ] + 𝒟[L]ρ"
	},
	{
		id: "atlas",
		chapter: "12",
		title: "Algorithm Atlas",
		kicker: "The full map",
		summary: "A Sankey of every lab in this studio — from the Schrödinger equation through search, optimization, learning, and noise.",
		formula: "H → U(t) → {Shor, Grover, QAOA, …}"
	}
];
function labById(id) {
	return LABS.find((l) => l.id === id);
}
function nextLab(id) {
	return LABS[(LABS.findIndex((l) => l.id === id) + 1) % LABS.length];
}
function prevLab(id) {
	return LABS[(LABS.findIndex((l) => l.id === id) - 1 + LABS.length) % LABS.length];
}
var useProgress = create()(persist((set) => ({
	seen: {},
	mark: (id) => set((s) => ({ seen: {
		...s.seen,
		[id]: true
	} }))
}), { name: "aether-progress" }));
function completionCount(seen) {
	return LABS.filter((l) => seen[l.id]).length;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-subtle text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-muted hover:text-fg hover:bg-subtle",
			outline: "text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Shell({ children, activeId }) {
	const seen = useProgress((s) => s.seen);
	const done = completionCount(seen);
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur-sm md:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "flex items-baseline gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-xl tracking-tight",
					children: "Aether"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden text-xs text-muted sm:inline",
					children: "Quantum Laboratory"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-xs text-muted tabular-nums",
					children: [
						done,
						"/",
						LABS.length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "md:hidden",
					"aria-label": open ? "Close menu" : "Open menu",
					onClick: () => setOpen((v) => !v),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: cn("border-border bg-bg md:sticky md:top-14 md:flex md:h-[calc(100dvh-3.5rem)] md:w-60 md:shrink-0 md:flex-col md:overflow-y-auto md:border-r md:px-3 md:py-4", open ? "fixed inset-x-0 top-14 z-20 max-h-[70vh] overflow-y-auto border-b px-3 py-3" : "hidden md:flex"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-faint",
					children: "Chapters"
				}), LABS.map((lab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/lab/$id",
					params: { id: lab.id },
					onClick: () => setOpen(false),
					className: cn("flex min-h-11 items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors duration-150", activeId === lab.id ? "bg-subtle text-fg" : "text-muted hover:bg-subtle/70 hover:text-fg"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[11px] text-faint tabular-nums",
							children: lab.chapter
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: lab.title
						}),
						seen[lab.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-auto size-1.5 rounded-full bg-ok" }) : null
					]
				}, lab.id))]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10",
				children
			})]
		})]
	});
}
//#endregion
export { completionCount as a, prevLab as c, cn as i, useProgress as l, LABS as n, labById as o, Shell as r, nextLab as s, Button as t };
