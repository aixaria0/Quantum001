import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Shell } from "./shell-Cn-Ua-TU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lab._id-Carjo8KP.js
var import_jsx_runtime = require_jsx_runtime();
function LabMissing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "This bench is empty."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-md text-muted",
			children: "That lab id is not on the atlas. Return to the observatory and pick a numbered chapter."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-6 inline-flex min-h-11 items-center text-sm text-fg",
			children: "Back to Aether"
		})
	] });
}
//#endregion
export { LabMissing as notFoundComponent };
