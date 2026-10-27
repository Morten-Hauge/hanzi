import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const SITE_URL = "https://www.morten-hauge.com/hanzi/";

// Pages that get their own copy of index.html in the build, with that page's
// title and canonical link (the router sets the same ones in the browser).
const PAGES = [
  { path: "quiz", title: "Pinyin quiz – Hànzì" },
  { path: "quiz/english", title: "English quiz – Hànzì" },
  { path: "quiz/character", title: "Character quiz – Hànzì" },
  { path: "browse", title: "All 30 characters – Hànzì" },
];

// The app is a single page, so the server must answer e.g. /hanzi/browse with
// index.html. Not every host allows that (.htaccess rules may be ignored), so
// the build writes a real copy at each address: dist/browse/index.html etc.
function pageCopies() {
  let outDir;
  return {
    name: "page-copies",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const html = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      for (const page of PAGES) {
        const url = `${SITE_URL}${page.path}/`;
        const copy = html
          .replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`)
          .replace(
            /<link rel="canonical" href="[^"]*" \/>/,
            `<link rel="canonical" href="${url}" />`
          )
          .replace(
            /<meta property="og:url" content="[^"]*" \/>/,
            `<meta property="og:url" content="${url}" />`
          );
        const dir = path.join(outDir, page.path);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "index.html"), copy);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), pageCopies()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/hanzi/",
});
