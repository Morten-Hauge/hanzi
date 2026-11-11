/* eslint-env node */
// One-off: downloads Instrument Serif (Regular + Italic) and its licence from
// the official google/fonts repo (ofl/instrumentserif) and saves them as
// WOFF2 in public/fonts/instrument-serif/, for the splash headline.
//
//   node scripts/fetch-instrument-serif.mjs
//
// No dependencies: WOFF2 is written here with Node's built-in Brotli, using
// WOFF2's "null transform" for glyf/loca (valid per the spec, just a little
// less compact than fonttools' output). The fonts aren't subset (that needs
// fonttools); they're small anyway and keep every Latin glyph, including
// the pinyin tone marks.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  ".."
);
const OUT_DIR = path.join(ROOT, "public/fonts/instrument-serif");
const BASE =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/";
const FILES = [
  ["InstrumentSerif-Regular.ttf", "InstrumentSerif-Regular.woff2"],
  ["InstrumentSerif-Italic.ttf", "InstrumentSerif-Italic.woff2"],
];

async function get(name) {
  const res = await fetch(BASE + name);
  if (!res.ok) throw new Error(`${res.status} for ${BASE + name}`);
  return Buffer.from(await res.arrayBuffer());
}

// UIntBase128: big-endian, 7 bits per byte, high bit = more bytes follow.
function base128(value) {
  const bytes = [value & 0x7f];
  value = Math.floor(value / 128);
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value = Math.floor(value / 128);
  }
  return Buffer.from(bytes);
}

function ttfToWoff2(ttf) {
  const flavor = ttf.readUInt32BE(0);
  const numTables = ttf.readUInt16BE(4);
  let tables = [];
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    const tag = ttf.toString("latin1", rec, rec + 4);
    const offset = ttf.readUInt32BE(rec + 8);
    const length = ttf.readUInt32BE(rec + 12);
    tables.push({ tag, data: ttf.subarray(offset, offset + length) });
  }
  // Sorted by tag, with loca directly after glyf.
  tables.sort((a, b) => (a.tag < b.tag ? -1 : 1));
  const loca = tables.find((t) => t.tag === "loca");
  if (loca) {
    tables = tables.filter((t) => t !== loca);
    tables.splice(tables.findIndex((t) => t.tag === "glyf") + 1, 0, loca);
  }

  // Table directory: arbitrary tag (index 63) for every table; glyf and
  // loca use transform version 3 (null transform), the rest version 0
  // (also untransformed). No transformLength for untransformed tables.
  const dir = [];
  for (const t of tables) {
    const nullTransformed = t.tag === "glyf" || t.tag === "loca";
    dir.push(Buffer.from([63 | (nullTransformed ? 0xc0 : 0)]));
    dir.push(Buffer.from(t.tag, "latin1"));
    dir.push(base128(t.data.length));
  }
  const directory = Buffer.concat(dir);
  const compressed = zlib.brotliCompressSync(
    Buffer.concat(tables.map((t) => t.data)),
    {
      params: {
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_FONT,
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      },
    }
  );
  const totalSfntSize =
    12 +
    16 * tables.length +
    tables.reduce((sum, t) => sum + Math.ceil(t.data.length / 4) * 4, 0);
  const unpadded = 48 + directory.length + compressed.length;
  const length = Math.ceil(unpadded / 4) * 4;

  const header = Buffer.alloc(48);
  header.write("wOF2", 0, "latin1");
  header.writeUInt32BE(flavor, 4);
  header.writeUInt32BE(length, 8);
  header.writeUInt16BE(tables.length, 12);
  header.writeUInt32BE(totalSfntSize, 16);
  header.writeUInt32BE(compressed.length, 20);
  header.writeUInt16BE(1, 24); // version 1.0
  return Buffer.concat([
    header,
    directory,
    compressed,
    Buffer.alloc(length - unpadded),
  ]);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [ttfName, woff2Name] of FILES) {
  const ttf = await get(ttfName);
  const woff2 = ttfToWoff2(ttf);
  fs.writeFileSync(path.join(OUT_DIR, woff2Name), woff2);
  console.log(
    `${woff2Name}: ${(woff2.length / 1024).toFixed(1)} KB (TTF ${(
      ttf.length / 1024
    ).toFixed(1)} KB)`
  );
}
fs.writeFileSync(path.join(OUT_DIR, "OFL.txt"), await get("OFL.txt"));
console.log("OFL.txt: saved");
