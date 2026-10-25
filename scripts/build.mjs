/* Build the static site for Cloudflare Pages.
 * Output: dist/
 * The local editor and Node server are intentionally excluded.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");

const files = [
  "index.html",
  "css/tokens.css",
  "css/app.css",
  "js/app.js",
  "js/site-config.js",
  "js/catalog.js",
  "assets/favicon.svg",
  "_headers",
];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function build() {
  const missing = [];
  for (const file of files) {
    if (!(await exists(path.join(root, file)))) missing.push(file);
  }
  if (missing.length) {
    console.error("构建失败，缺少文件：");
    for (const file of missing) console.error(`  - ${file}`);
    process.exitCode = 1;
    return;
  }

  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });

  let bytes = 0;
  for (const file of files) {
    const source = path.join(root, file);
    const target = path.join(output, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
    const stat = await fs.stat(target);
    bytes += stat.size;
  }

  console.log("");
  console.log("  餐边柜 SKU Studio · 静态构建");
  console.log(`  输出目录  ${output}`);
  console.log(`  文件数量  ${files.length}`);
  console.log(`  总体积    ${(bytes / 1024).toFixed(1)} KB`);
  console.log("");
  console.log("  Cloudflare Pages 设置：");
  console.log("    构建命令  npm run build");
  console.log("    输出目录  dist");
  console.log("  编辑器与服务端不会进入 dist，线上只发布纯静态前台。");
  console.log("");
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
