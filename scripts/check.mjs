/* Lightweight project sanity check, no dependencies. */

import { promises as fs } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "index.html",
  "editor.html",
  "css/tokens.css",
  "css/app.css",
  "css/editor.css",
  "js/app.js",
  "js/editor.js",
  "js/site-config.js",
  "js/catalog.js",
  "server/server.js",
  "assets/favicon.svg",
  "_headers",
];
const errors = [];

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function checkScript(source, filename) {
  try {
    new vm.Script(source, { filename });
  } catch (error) {
    errors.push(`${filename}: ${error.message}`);
  }
}

async function run() {
  for (const file of required) {
    try {
      await fs.access(path.join(root, file));
    } catch {
      errors.push(`缺少文件：${file}`);
    }
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`✗ ${error}`));
    process.exitCode = 1;
    return;
  }

  for (const file of ["js/app.js", "js/editor.js", "js/site-config.js", "js/catalog.js", "server/server.js"]) {
    const source = await read(file);
    checkScript(source, file);
  }

  for (const file of ["js/site-config.js", "js/catalog.js"]) {
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    try {
      new vm.Script(await read(file), { filename: file }).runInContext(sandbox, { timeout: 1500 });
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
    }
    if (file.endsWith("site-config.js")) {
      const config = sandbox.window.SITE_CONFIG;
      if (!config || !config.meta || !config.theme || !Array.isArray(config.announcements)) {
        errors.push("站点配置缺少 meta / theme / announcements。");
      }
      if (!Array.isArray(config?.steps?.single) || !Array.isArray(config?.steps?.combo)) {
        errors.push("站点配置缺少 steps.single 或 steps.combo。");
      }
    }
    if (file.endsWith("catalog.js")) {
      const catalog = sandbox.window.SKU_CATALOG;
      if (!Array.isArray(catalog) || !catalog.length) {
        errors.push("类目数据为空。");
      } else {
        catalog.forEach((row, index) => {
          if (!Array.isArray(row) || row.length < 7) {
            errors.push(`catalog.js 第 ${index + 1} 行格式错误。`);
          }
        });
      }
    }
  }

  const index = await read("index.html");
  for (const asset of ["css/tokens.css", "css/app.css", "js/catalog.js", "js/site-config.js", "js/app.js"]) {
    if (!index.includes(asset)) errors.push(`index.html 未引用 ${asset}`);
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`✗ ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log("✓ 项目检查通过");
  console.log("  Node.js 语法、站点配置、类目数据与静态资源引用均正常。");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
