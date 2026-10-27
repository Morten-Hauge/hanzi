/* eslint-env node */
// One-off: turns the terraces photo into a navy ink-wash print with a
// transparent background, for the "inkwash" splash (SplashInkwash.vue).
//
//   node scripts/make-inkwash.mjs
//
// No dependencies: macOS's built-in `sips` decodes the JPEG (to PNG) and
// encodes the WebP; everything else is plain Node (zlib for PNG).
//
// Steps (per the design brief):
//   1. greyscale, slight Gaussian blur (sigma 0.8px)
//   2. stretch the 3rd–97th percentile brightness range to 0–1
//   3. alpha = (1 − normalized)^1.6 × 0.78  (dark → ink, bright → clear)
//   4. every pixel navy, with that alpha (rounded to 64 levels for size)
// Output: src/assets/terraces-inkwash.png (+ .webp), at the photo's width.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  ".."
);
const SOURCE = path.join(ROOT, "src/assets/bg_v2.jpg");
const OUT_PNG = path.join(ROOT, "src/assets/terraces-inkwash.png");
const OUT_WEBP = path.join(ROOT, "src/assets/terraces-inkwash.webp");

const NAVY = [12, 30, 48]; // --text-hanzi (#0C1E30), the right column's navy
const BLUR_SIGMA = 0.8;
const LOW_PERCENTILE = 0.03;
const HIGH_PERCENTILE = 0.97;
const GAMMA = 1.6;
const MAX_ALPHA = 0.78;
// Alpha is rounded to this many levels (invisible at 1.2% steps, shown at
// 85% opacity) so the files compress far better: ~410 KB PNG / ~330 KB WebP
// instead of ~660 / ~560 KB.
const ALPHA_LEVELS = 64;

// ---- PNG decode (8-bit RGB/RGBA, non-interlaced) ----

function readPng(file) {
  const buf = fs.readFileSync(file);
  let pos = 8;
  let width, height, bitDepth, colorType;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    }
    if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(
      `Unsupported PNG (bit depth ${bitDepth}, colour type ${colorType})`
    );
  }
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(height * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? out[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let pred = 0;
      if (filter === 1) pred = a;
      else if (filter === 2) pred = b;
      else if (filter === 3) pred = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[i] = (line[i] + pred) & 255;
    }
    prev = out;
  }
  return { width, height, bpp, pixels };
}

// ---- PNG encode (8-bit RGBA, best filter per row) ----

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function writePng(file, width, height, rgba) {
  const stride = width * 4;
  const rows = [];
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const line = rgba.subarray(y * stride, (y + 1) * stride);
    let best = null;
    let bestScore = Infinity;
    for (let filter = 0; filter <= 4; filter++) {
      const out = Buffer.alloc(stride + 1);
      out[0] = filter;
      let score = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= 4 ? line[i - 4] : 0;
        const b = prev[i];
        const c = i >= 4 ? prev[i - 4] : 0;
        let pred = 0;
        if (filter === 1) pred = a;
        else if (filter === 2) pred = b;
        else if (filter === 3) pred = (a + b) >> 1;
        else if (filter === 4) {
          const p = a + b - c;
          const pa = Math.abs(p - a),
            pb = Math.abs(p - b),
            pc = Math.abs(p - c);
          pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        const v = (line[i] - pred) & 255;
        out[i + 1] = v;
        score += v < 128 ? v : 256 - v;
      }
      if (score < bestScore) {
        bestScore = score;
        best = out;
      }
    }
    rows.push(best);
    prev = line;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
}

// ---- Image processing ----

function gaussianBlur(src, width, height, sigma) {
  const radius = Math.ceil(sigma * 3);
  const kernel = [];
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const w = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(w);
    sum += w;
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  const tmp = new Float32Array(width * height);
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const xx = Math.min(width - 1, Math.max(0, x + k));
        acc += src[y * width + xx] * kernel[k + radius];
      }
      tmp[y * width + x] = acc;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const yy = Math.min(height - 1, Math.max(0, y + k));
        acc += tmp[yy * width + x] * kernel[k + radius];
      }
      out[y * width + x] = acc;
    }
  }
  return out;
}

function percentile(values, p) {
  const bins = 4096;
  const hist = new Uint32Array(bins);
  for (const v of values)
    hist[Math.min(bins - 1, Math.floor((v / 256) * bins))]++;
  const target = p * values.length;
  let count = 0;
  for (let i = 0; i < bins; i++) {
    count += hist[i];
    if (count >= target) return ((i + 0.5) / bins) * 256;
  }
  return 255;
}

// ---- Run ----

const tmpPng = path.join(os.tmpdir(), `inkwash-source-${process.pid}.png`);
execFileSync("sips", ["-s", "format", "png", SOURCE, "--out", tmpPng], {
  stdio: "ignore",
});
const { width, height, bpp, pixels } = readPng(tmpPng);
fs.unlinkSync(tmpPng);

const grey = new Float32Array(width * height);
for (let i = 0; i < width * height; i++) {
  const r = pixels[i * bpp],
    g = pixels[i * bpp + 1],
    b = pixels[i * bpp + 2];
  grey[i] = 0.299 * r + 0.587 * g + 0.114 * b;
}
const blurred = gaussianBlur(grey, width, height, BLUR_SIGMA);
const low = percentile(blurred, LOW_PERCENTILE);
const high = percentile(blurred, HIGH_PERCENTILE);

const rgba = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  const normalized = Math.min(
    1,
    Math.max(0, (blurred[i] - low) / (high - low))
  );
  const alpha = Math.pow(1 - normalized, GAMMA) * MAX_ALPHA;
  rgba[i * 4] = NAVY[0];
  rgba[i * 4 + 1] = NAVY[1];
  rgba[i * 4 + 2] = NAVY[2];
  const level = Math.round(alpha * (ALPHA_LEVELS - 1));
  rgba[i * 4 + 3] = Math.round((level * 255) / (ALPHA_LEVELS - 1));
}
writePng(OUT_PNG, width, height, rgba);
console.log(
  `${path.relative(ROOT, OUT_PNG)}: ${width}x${height}, ${(
    fs.statSync(OUT_PNG).size / 1024
  ).toFixed(0)} KB (percentiles ${low.toFixed(1)}–${high.toFixed(1)})`
);

// WebP: sips can't write it, so the PNG is drawn onto a canvas in headless
// Google Chrome (if installed) and exported with transparency.
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (fs.existsSync(CHROME)) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "inkwash-webp-"));
  fs.copyFileSync(OUT_PNG, path.join(dir, "in.png"));
  fs.writeFileSync(
    path.join(dir, "convert.html"),
    `<img id="i" src="in.png"><pre id="out"></pre><script>
      const img = document.getElementById("i");
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        document.getElementById("out").textContent = c.toDataURL("image/webp", 0.85);
      };
    </script>`
  );
  const html = execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--allow-file-access-from-files",
      "--virtual-time-budget=5000",
      "--dump-dom",
      `file://${dir}/convert.html`,
    ],
    { stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 }
  ).toString();
  fs.rmSync(dir, { recursive: true });
  const match = html.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  if (match) {
    fs.writeFileSync(OUT_WEBP, Buffer.from(match[1], "base64"));
    console.log(
      `${path.relative(ROOT, OUT_WEBP)}: ${(
        fs.statSync(OUT_WEBP).size / 1024
      ).toFixed(0)} KB`
    );
  } else {
    console.log("WebP: Chrome couldn't export it; using the PNG only.");
  }
} else {
  console.log("WebP: no Google Chrome found; using the PNG only.");
}
