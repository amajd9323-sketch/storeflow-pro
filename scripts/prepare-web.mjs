import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "www");
const files = ["index.html", "manifest.webmanifest", "sw.js", "icon-192.png", "icon-512.png"];

for (const name of files) {
  const source = resolve(root, name);
  if (!existsSync(source)) {
    throw new Error("Missing required web asset: " + name);
  }
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const name of files) {
  copyFileSync(resolve(root, name), resolve(output, name));
}
console.log("Prepared Hesabi Pro web assets in ./www");
