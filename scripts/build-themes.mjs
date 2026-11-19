import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { themeCss } from "../src/lib/themeTokens.js";

const file = new URL("../src/app/themes.generated.css", import.meta.url);
const css = themeCss();
const same = existsSync(file) && readFileSync(file, "utf8") === css;
if (!same) writeFileSync(file, css);
console.log(`build-themes: ${same ? "up to date" : "written"} (${css.length} bytes)`);
