import { mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "public/images/tv-bg.png");
const output = resolve(root, "public/generated/tv-bg.webp");

async function fileStat(path) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}

const sourceStat = await fileStat(source);
if (!sourceStat) {
  throw new Error(`Missing TV artwork source: ${source}`);
}

const outputStat = await fileStat(output);
if (outputStat && outputStat.mtimeMs >= sourceStat.mtimeMs) {
  console.log("Optimized TV artwork is up to date.");
  process.exit(0);
}

await mkdir(dirname(output), { recursive: true });
await sharp(source)
  .webp({
    quality: 82,
    alphaQuality: 90,
    effort: 6,
    smartSubsample: true,
  })
  .toFile(output);

const optimizedStat = await stat(output);
const percent = Math.round((optimizedStat.size / sourceStat.size) * 100);
console.log(
  `Optimized TV artwork: ${(sourceStat.size / 1024 / 1024).toFixed(2)} MB -> ${(optimizedStat.size / 1024 / 1024).toFixed(2)} MB (${percent}% of source).`
);
