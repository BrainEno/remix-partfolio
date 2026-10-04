import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = resolve(root, "app/portfolio/content.ts");
const source = await readFile(contentPath, "utf8");
const paths = [...source.matchAll(/\bsrc:\s*["']([^"']+)["']/g)].map(
  (match) => match[1]
);

const localPaths = [...new Set(paths.filter((path) => path.startsWith("/")))];
const missing = [];

for (const assetPath of localPaths) {
  const diskPath = resolve(root, "public", assetPath.slice(1));
  try {
    await access(diskPath);
  } catch {
    missing.push(assetPath);
  }
}

if (missing.length > 0) {
  console.error("Configured portfolio assets are missing or have incorrect case:");
  missing.forEach((path) => console.error(`  - ${path}`));
  process.exit(1);
}

console.log(`Validated ${localPaths.length} configured portfolio assets.`);
