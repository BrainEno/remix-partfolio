/*
 * Rebuilds the editable Contact telephone model from the 38 MB, base64-inlined
 * `public/gltfs/telephone.gltf` source into a compact binary `.glb`:
 *
 *   - nine 2048² textures resized to 1024² and re-encoded as JPEG
 *   - one binary buffer instead of a base64 data URI
 *
 * The result keeps the same geometry, materials and UVs; only texture
 * resolution changes. That keeps the lazy Contact scene inside a sane transfer
 * budget, which is what previously made the WebGL scene look like a crash on
 * slow connections.
 *
 * Run with: npm run assets:model
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "public/gltfs/telephone.gltf");
const output = resolve(root, "public/generated/telephone.glb");
const TEXTURE_SIZE = 1024;
const JPEG_QUALITY = 82;

async function fileStat(path) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}

const sourceStat = await fileStat(source);
if (!sourceStat) {
  console.log("No source telephone model, skipping model optimise.");
  process.exit(0);
}

const outputStat = await fileStat(output);
if (outputStat && outputStat.mtimeMs >= sourceStat.mtimeMs) {
  console.log("Optimized telephone model is up to date.");
  process.exit(0);
}

const gltf = JSON.parse(await readFile(source, "utf8"));
const sourceBuffer = Buffer.from(
  gltf.buffers?.[0]?.uri?.split(",")[1] ?? "",
  "base64",
);

if (sourceBuffer.byteLength === 0) {
  throw new Error("telephone.gltf has no embedded buffer to rebuild.");
}

const padded = (length) => Math.ceil(length / 4) * 4;
const chunks = [];
let offset = 0;

const append = (buffer) => {
  const start = offset;
  chunks.push(buffer);
  offset += buffer.byteLength;
  const padding = padded(offset) - offset;
  if (padding > 0) {
    chunks.push(Buffer.alloc(padding));
    offset += padding;
  }
  const end = start + buffer.byteLength;
  return { start, end };
};

// Copy every existing bufferView except the ones that hold images; those are
// replaced with the re-encoded textures below.
const imageViews = new Set(
  (gltf.images ?? []).map((image) => image.bufferView),
);
const oldViews = gltf.bufferViews;
const newViews = [];

for (let index = 0; index < oldViews.length; index += 1) {
  const view = oldViews[index];
  if (imageViews.has(index)) {
    newViews.push(null);
    continue;
  }
  const start = view.byteOffset ?? 0;
  const slice = sourceBuffer.subarray(start, start + view.byteLength);
  const { start: newStart, end } = append(slice);
  newViews.push({
    ...view,
    byteOffset: newStart,
    byteLength: end - newStart,
  });
}

for (let index = 0; index < (gltf.images ?? []).length; index += 1) {
  const image = gltf.images[index];
  const view = oldViews[image.bufferView];
  const start = view.byteOffset ?? 0;
  const sourceSlice = sourceBuffer.subarray(start, start + view.byteLength);
  const resized = await sharp(sourceSlice)
    .resize(TEXTURE_SIZE, TEXTURE_SIZE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  const { start: newStart, end } = append(resized);
  newViews[image.bufferView] = {
    buffer: 0,
    byteOffset: newStart,
    byteLength: end - newStart,
  };
  image.mimeType = "image/jpeg";
}

gltf.bufferViews = newViews;
gltf.buffers = [{ byteLength: offset }];

const binaryBuffer = Buffer.concat(chunks, offset);
const jsonChunk = Buffer.from(
  JSON.stringify({ ...gltf, buffers: [{ byteLength: binaryBuffer.byteLength }] }),
  "utf8",
);
const jsonPadding = Buffer.alloc(padded(jsonChunk.byteLength) - jsonChunk.byteLength, 0x20);
const binaryPadding = Buffer.alloc(
  padded(binaryBuffer.byteLength) - binaryBuffer.byteLength,
  0,
);
const jsonPadded = Buffer.concat([jsonChunk, jsonPadding]);
const binaryPadded = Buffer.concat([binaryBuffer, binaryPadding]);

const header = Buffer.alloc(12);
const totalLength = 12 + 8 + jsonPadded.byteLength + 8 + binaryPadded.byteLength;
header.writeUInt32LE(0x46546c67, 0); // glTF
header.writeUInt32LE(2, 4);
header.writeUInt32LE(totalLength, 8);

const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonPadded.byteLength, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4); // JSON

const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(binaryPadded.byteLength, 0);
binaryHeader.writeUInt32LE(0x004e4942, 4); // BIN

await mkdir(dirname(output), { recursive: true });
await writeFile(
  output,
  Buffer.concat([header, jsonHeader, jsonPadded, binaryHeader, binaryPadded]),
);

const optimizedStat = await stat(output);
console.log(
  `Optimized telephone model: ${(sourceStat.size / 1024 / 1024).toFixed(2)} MB -> ${(
    optimizedStat.size /
    1024 /
    1024
  ).toFixed(2)} MB (${Math.round(
    (optimizedStat.size / sourceStat.size) * 100,
  )}% of source).`,
);
