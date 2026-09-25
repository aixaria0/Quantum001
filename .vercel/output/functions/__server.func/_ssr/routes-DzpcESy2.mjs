import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as ArrowRight } from "../_libs/lucide-react.mjs";
import { a as completionCount, l as useProgress, n as LABS, r as Shell } from "./shell-Cn-Ua-TU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DzpcESy2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const seen = useProgress((s) => s.seen);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setHydrated(true), []);
	const done = hydrated ? completionCount(seen) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.18em] text-faint",
				children: "Observatory"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl md:text-5xl",
				children: "Twelve labs. One Hilbert space."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-xl text-muted",
				children: "From the Schrödinger equation to Shor, Grover, QAOA, knitting, annealing, error correction, quantum machine learning, Born machines, and Lindblad dynamics — every chapter is a working simulator, not a slide."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 font-mono text-xs text-faint tabular-nums",
				children: [
					done,
					" of ",
					LABS.length,
					" visited"
				]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
		children: LABS.map((lab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/lab/$id",
			params: { id: lab.id },
			className: "group flex flex-col rounded-xl bg-elevated p-5 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-200 ease-[var(--ease-out)] hover:shadow-[var(--shadow-border-hover)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[11px] text-faint tabular-nums",
						children: lab.chapter
					}), hydrated && seen[lab.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-ok" }) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-2xl",
					children: lab.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: lab.kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 flex-1 text-sm text-muted",
					children: lab.summary
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-4 inline-flex items-center gap-1 text-xs text-fg",
					children: ["Open lab", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" })]
				})
			]
		}, lab.id))
	})] });
}
//#endregion
export { Home as component };
