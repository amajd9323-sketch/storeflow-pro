import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const html = readFileSync("index.html", "utf8");
const pages = [...html.matchAll(/<section\s+id="([^"]+)"\s+class="page/g)].map((m) => m[1]);
const menuPages = [...html.matchAll(/data-mobile-page="([^"]+)"/g)].map((m) => m[1]);
const missing = pages.filter((page) => !menuPages.includes(page));
if (missing.length) {
  throw new Error("Mobile menu is missing desktop sections: " + missing.join(", "));
}

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
let checked = 0;
for (let i = 0; i < scripts.length; i++) {
  const attrs = scripts[i][1] || "";
  const code = (scripts[i][2] || "").trim();
  if (!code || /\bsrc\s*=/.test(attrs)) continue;
  const type = (attrs.match(/\btype\s*=\s*["']([^"']+)/i) || [])[1] || "text/javascript";
  if (!/^(text\/javascript|application\/javascript|module)$/i.test(type)) continue;
  const file = join(tmpdir(), "hesabi-inline-" + i + ".js");
  writeFileSync(file, code, "utf8");
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  rmSync(file, { force: true });
  if (result.status !== 0) {
    process.stderr.write("Inline script " + i + " failed syntax check:\n");
    process.stderr.write(result.stderr || result.stdout || "Unknown syntax error\n");
    process.exit(1);
  }
  checked++;
}
console.log("Checked " + checked + " inline scripts; all " + pages.length + " desktop sections appear in phone menu.");
