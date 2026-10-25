/* ==========================================================================
   餐边柜 SKU Studio · local workspace server
   Zero dependencies. Binds to loopback only.
   Serves the static site, the visual editor, and a small file/content API.
   ========================================================================== */

"use strict";

const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const { spawn } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const HOST = "127.0.0.1";
const DEFAULT_PORT = Number(process.env.PORT) || 5173;
const MAX_PORT_ATTEMPTS = 20;
const MAX_BODY = 3 * 1024 * 1024;
const MAX_BACKUPS = 40;
const BACKUP_DIR = path.join(ROOT, ".backups");
const OPEN_BROWSER = process.argv.includes("--open");
const NO_OPEN = process.argv.includes("--no-open");

const EDITABLE_FILES = new Map([
  ["index.html", { label: "index.html", language: "html" }],
  ["css/tokens.css", { label: "tokens.css", language: "css" }],
  ["css/app.css", { label: "app.css", language: "css" }],
  ["js/app.js", { label: "app.js", language: "javascript" }],
  ["js/site-config.js", { label: "site-config.js", language: "javascript" }],
  ["js/catalog.js", { label: "catalog.js", language: "javascript" }],
]);

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const STATIC_EXTENSIONS = new Set(Object.keys(CONTENT_TYPES));
const SSE_CLIENTS = new Set();
let listeningPort = 0;
let server = null;
let reloadTimer = null;
const watchers = [];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function securityHeaders(contentType = "application/json; charset=utf-8") {
  return {
    "Content-Type": contentType,
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-src 'self'; " +
      "base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
  };
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    ...securityHeaders(),
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sendText(response, status, text) {
  response.writeHead(status, securityHeaders("text/plain; charset=utf-8"));
  response.end(text);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isAllowedHost(hostHeader) {
  if (!hostHeader) return false;
  const hostname = String(hostHeader).replace(/:\d+$/, "").replace(/^\[|\]$/g, "").toLowerCase();
  return hostname === "127.0.0.1" || hostname === "localhost";
}

function isAllowedOrigin(originHeader) {
  if (!originHeader) return true;
  try {
    const origin = new URL(originHeader);
    return (
      origin.protocol === "http:" &&
      (origin.hostname === "127.0.0.1" || origin.hostname === "localhost") &&
      Number(origin.port || 80) === listeningPort
    );
  } catch {
    return false;
  }
}

function assertLocalRequest(request) {
  if (!isAllowedHost(request.headers.host)) {
    throw new HttpError(403, "仅允许从本机访问本地编辑器。");
  }
  if (!isAllowedOrigin(request.headers.origin)) {
    throw new HttpError(403, "请求来源不受信任。");
  }
}

async function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, "内容超过 3 MB 限制。"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

async function readJsonBody(request) {
  if (!String(request.headers["content-type"] || "").includes("application/json")) {
    throw new HttpError(415, "请求必须使用 application/json。");
  }
  const raw = await readBody(request);
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "JSON 格式无效。");
  }
}

function validateSiteConfig(config) {
  if (!isPlainObject(config)) throw new HttpError(422, "站点配置必须是对象。");
  if (!isPlainObject(config.meta) || typeof config.meta.title !== "string") {
    throw new HttpError(422, "站点配置缺少有效的 meta.title。");
  }
  if (!isPlainObject(config.theme)) {
    throw new HttpError(422, "站点配置缺少 theme。");
  }
  if (!isPlainObject(config.steps) || !Array.isArray(config.steps.single) || !Array.isArray(config.steps.combo)) {
    throw new HttpError(422, "站点配置的步骤数据不完整。");
  }
  if (!Array.isArray(config.announcements)) {
    throw new HttpError(422, "站点配置的 announcements 必须是数组。");
  }
  for (const announcement of config.announcements) {
    if (!isPlainObject(announcement) || typeof announcement.title !== "string") {
      throw new HttpError(422, "公告数据格式无效。");
    }
  }
  return true;
}

function validateCatalog(catalog) {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new HttpError(422, "类目数据不能为空。");
  }

  catalog.forEach((row, index) => {
    const line = index + 1;
    if (!Array.isArray(row) || row.length < 7) {
      throw new HttpError(422, `第 ${line} 行数据格式无效。`);
    }
    const [series, model, heightGroup, width, depth, colors, flag] = row;
    if (!String(series).trim() || !String(model).trim()) {
      throw new HttpError(422, `第 ${line} 行缺少系列或门型。`);
    }
    if (/[|]/.test(String(series)) || /[|]/.test(String(model))) {
      throw new HttpError(422, `第 ${line} 行系列或门型不能包含竖线 |。`);
    }
    if (!/^\d+(\/\d+)?$/.test(String(heightGroup).trim())) {
      throw new HttpError(422, `第 ${line} 行高度组应形如 1020/870。`);
    }
    if (!Number.isFinite(Number(width)) || Number(width) <= 0) {
      throw new HttpError(422, `第 ${line} 行宽度必须是正数。`);
    }
    if (!Number.isFinite(Number(depth)) || Number(depth) <= 0) {
      throw new HttpError(422, `第 ${line} 行深度必须是正数。`);
    }
    if (!String(colors).trim()) {
      throw new HttpError(422, `第 ${line} 行至少需要一种颜色。`);
    }
    if (typeof flag !== "string") {
      throw new HttpError(422, `第 ${line} 行备注必须是文本。`);
    }
  });

  return true;
}

function renderCatalogSource(catalog) {
  const lines = catalog.map((row) => "  " + JSON.stringify(row) + ",");
  return [
    "/* 餐边柜 SKU 类目数据",
    " * 由可视化编辑器写入；也可直接修改此文件。",
    " * 字段：[系列, 门型, 高度组, 宽度mm, 深度mm, 颜色, 备注]",
    " */",
    "window.SKU_CATALOG = [",
    lines.join("\n"),
    "];",
    "",
  ].join("\n");
}

function renderSiteConfigSource(config) {
  return [
    "/* 餐边柜 SKU Studio · 站点配置",
    " * 这里的内容由可视化编辑器维护，也可以直接编辑。",
    " * 所有前台可见的静态文案、主题与公告都集中在本文件中。",
    " */",
    `window.SITE_CONFIG = ${JSON.stringify(config, null, 2)};`,
    "",
  ].join("\n");
}

async function loadGlobal(filePath, globalName) {
  const source = await fsp.readFile(filePath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  new vm.Script(source, { filename: filePath }).runInContext(sandbox, { timeout: 1500 });
  const value = sandbox.window[globalName];
  if (value === undefined) {
    throw new HttpError(422, `${path.basename(filePath)} 没有导出 ${globalName}。`);
  }
  return JSON.parse(JSON.stringify(value));
}

async function loadWorkspaceData() {
  const [siteConfig, catalog] = await Promise.all([
    loadGlobal(path.join(ROOT, "js/site-config.js"), "SITE_CONFIG"),
    loadGlobal(path.join(ROOT, "js/catalog.js"), "SKU_CATALOG"),
  ]);
  validateSiteConfig(siteConfig);
  validateCatalog(catalog);
  return { siteConfig, catalog };
}

function compileJavaScript(source, filename) {
  try {
    new vm.Script(source, { filename });
  } catch (error) {
    throw new HttpError(422, `JavaScript 语法错误：${error.message}`);
  }
}

function validateRawFile(relativePath, content) {
  if (typeof content !== "string") throw new HttpError(422, "文件内容必须是文本。");
  if (Buffer.byteLength(content, "utf8") > MAX_BODY) {
    throw new HttpError(413, "文件内容超过 3 MB 限制。");
  }

  if (relativePath.endsWith(".js")) {
    compileJavaScript(content, relativePath);

    if (relativePath === "js/site-config.js") {
      const sandbox = { window: {} };
      vm.createContext(sandbox);
      new vm.Script(content, { filename: "site-config.js" }).runInContext(sandbox, { timeout: 1500 });
      validateSiteConfig(sandbox.window.SITE_CONFIG);
    }
    if (relativePath === "js/catalog.js") {
      const sandbox = { window: {} };
      vm.createContext(sandbox);
      new vm.Script(content, { filename: "catalog.js" }).runInContext(sandbox, { timeout: 1500 });
      validateCatalog(sandbox.window.SKU_CATALOG);
    }
  }
}

function editablePath(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (!EDITABLE_FILES.has(normalized)) {
    throw new HttpError(403, "该文件不允许通过编辑器修改。");
  }
  return normalized;
}

function absoluteProjectPath(relativePath) {
  const absolute = path.resolve(ROOT, relativePath);
  if (!absolute.startsWith(ROOT + path.sep)) {
    throw new HttpError(403, "路径超出了项目目录。");
  }
  return absolute;
}

async function fileMetadata(relativePath) {
  const info = EDITABLE_FILES.get(relativePath);
  const stat = await fsp.stat(absoluteProjectPath(relativePath));
  return {
    path: relativePath,
    label: info.label,
    language: info.language,
    size: stat.size,
    modifiedAt: stat.mtime.toISOString(),
  };
}

async function allFileMetadata() {
  const rows = [];
  for (const relativePath of EDITABLE_FILES.keys()) {
    try {
      rows.push(await fileMetadata(relativePath));
    } catch {
      rows.push({
        path: relativePath,
        label: EDITABLE_FILES.get(relativePath).label,
        language: EDITABLE_FILES.get(relativePath).language,
        size: 0,
        missing: true,
      });
    }
  }
  return rows;
}

async function timestampFolder() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
    String(now.getMilliseconds()).padStart(3, "0"),
  ].join("");
  const folder = path.join(BACKUP_DIR, `${date}-${time}-${Math.random().toString(36).slice(2, 6)}`);
  await fsp.mkdir(folder, { recursive: true });
  return folder;
}

async function createBackups(relativePaths) {
  let folder;
  try {
    folder = await timestampFolder();
    for (const relativePath of relativePaths) {
      const source = absoluteProjectPath(relativePath);
      const target = path.join(folder, relativePath);
      await fsp.mkdir(path.dirname(target), { recursive: true });
      try {
        await fsp.copyFile(source, target);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    await pruneBackups();
    return path.relative(ROOT, folder);
  } catch (error) {
    console.warn("[backup] 备份失败：", error.message);
    return "";
  }
}

async function pruneBackups() {
  try {
    const entries = (await fsp.readdir(BACKUP_DIR, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .reverse();
    await Promise.all(
      entries.slice(MAX_BACKUPS).map((name) =>
        fsp.rm(path.join(BACKUP_DIR, name), { recursive: true, force: true })
      )
    );
  } catch {
    /* pruning is best effort */
  }
}

async function atomicWrite(relativePath, content) {
  const target = absoluteProjectPath(relativePath);
  await fsp.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fsp.writeFile(temporary, content, "utf8");
  await fsp.rename(temporary, target);
}

function broadcast(reason = "saved", relativePath = "") {
  const payload = JSON.stringify({
    type: "reload",
    reason,
    path: relativePath,
    at: new Date().toISOString(),
  });
  for (const response of SSE_CLIENTS) {
    response.write(`event: reload\ndata: ${payload}\n\n`);
  }
}

function queueBroadcast(reason, relativePath = "") {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => broadcast(reason, relativePath), 140);
}

function watchProject() {
  const directories = [ROOT, path.join(ROOT, "css"), path.join(ROOT, "js"), path.join(ROOT, "assets")];
  for (const directory of directories) {
    try {
      const watcher = fs.watch(directory, { persistent: false }, (_event, filename) => {
        if (!filename) return;
        const name = String(filename);
        if (name.startsWith(".") || name.endsWith(".tmp") || name.includes("~")) return;
        if (!STATIC_EXTENSIONS.has(path.extname(name))) return;
        queueBroadcast("external-change", path.relative(ROOT, path.join(directory, name)));
      });
      watchers.push(watcher);
    } catch {
      /* a missing directory simply isn't watched */
    }
  }
}

async function handleApi(request, response, pathname, searchParams) {
  assertLocalRequest(request);

  if (request.method === "GET" && pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      service: "sku-studio-local",
      version: "1.0.0",
      port: listeningPort,
      root: ROOT,
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/bootstrap") {
    const data = await loadWorkspaceData();
    const files = await allFileMetadata();
    sendJson(response, 200, {
      ok: true,
      ...data,
      files,
      editableFiles: Array.from(EDITABLE_FILES.entries()).map(([relativePath, info]) => ({
        path: relativePath,
        ...info,
      })),
      serverTime: new Date().toISOString(),
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/file") {
    const relativePath = editablePath(searchParams.get("path"));
    const content = await fsp.readFile(absoluteProjectPath(relativePath), "utf8");
    const metadata = await fileMetadata(relativePath);
    sendJson(response, 200, { ok: true, content, ...metadata });
    return;
  }

  if (request.method === "PUT" && pathname === "/api/file") {
    const body = await readJsonBody(request);
    const relativePath = editablePath(body.path);
    validateRawFile(relativePath, body.content);
    const backup = await createBackups([relativePath]);
    await atomicWrite(relativePath, body.content);
    queueBroadcast("file-saved", relativePath);
    const metadata = await fileMetadata(relativePath);
    sendJson(response, 200, { ok: true, backup, ...metadata });
    return;
  }

  if (request.method === "PUT" && pathname === "/api/content") {
    const body = await readJsonBody(request);
    validateSiteConfig(body.siteConfig);
    validateCatalog(body.catalog);
    const backup = await createBackups(["js/site-config.js", "js/catalog.js"]);
    await atomicWrite("js/site-config.js", renderSiteConfigSource(body.siteConfig));
    await atomicWrite("js/catalog.js", renderCatalogSource(body.catalog));
    queueBroadcast("content-saved", "content");
    sendJson(response, 200, {
      ok: true,
      backup,
      siteConfig: body.siteConfig,
      catalog: body.catalog,
      savedAt: new Date().toISOString(),
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/events") {
    response.writeHead(200, {
      ...securityHeaders("text/event-stream; charset=utf-8"),
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    response.write(`event: ready\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`);
    SSE_CLIENTS.add(response);
    const heartbeat = setInterval(() => {
      response.write(": keep-alive\n\n");
    }, 20000);
    const cleanup = () => {
      clearInterval(heartbeat);
      SSE_CLIENTS.delete(response);
    };
    request.on("close", cleanup);
    response.on("error", cleanup);
    return;
  }

  throw new HttpError(404, "接口不存在。");
}

function safeStaticPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    throw new HttpError(400, "路径编码无效。");
  }
  if (decoded === "/" || decoded === "/index.html") return "index.html";
  if (decoded === "/editor" || decoded === "/editor.html") return "editor.html";
  if (decoded.includes("\0")) throw new HttpError(400, "路径无效。");

  const extension = path.extname(decoded).toLowerCase();
  if (!STATIC_EXTENSIONS.has(extension)) throw new HttpError(404, "文件不存在。");
  const rawRelative = decoded.replace(/^\/+/, "");
  const segments = rawRelative.split("/");
  if (
    !segments.length ||
    !["css", "js", "assets"].includes(segments[0]) ||
    segments.some((segment) => !segment || segment === "." || segment === ".." || segment.startsWith(".")) ||
    rawRelative.includes("\\")
  ) {
    throw new HttpError(404, "文件不存在。");
  }
  const relative = segments.join("/");
  const absolute = path.resolve(ROOT, relative);
  if (!absolute.startsWith(ROOT + path.sep)) throw new HttpError(403, "路径无效。");
  return relative;
}

async function serveStatic(request, response, pathname) {
  const relative = safeStaticPath(pathname);
  const absolute = path.join(ROOT, relative);
  let stat;
  try {
    stat = await fsp.stat(absolute);
  } catch {
    throw new HttpError(404, "文件不存在。");
  }
  if (!stat.isFile()) throw new HttpError(404, "文件不存在。");
  const type = CONTENT_TYPES[path.extname(absolute).toLowerCase()] || "application/octet-stream";
  const headers = {
    ...securityHeaders(type),
    "Content-Length": stat.size,
  };
  response.writeHead(200, headers);
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  fs.createReadStream(absolute)
    .on("error", () => {
      if (!response.headersSent) {
        sendText(response, 500, "读取文件失败。");
      } else {
        response.destroy();
      }
    })
    .pipe(response);
}

async function requestHandler(request, response) {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || HOST}`);
    const pathname = url.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname, url.searchParams);
      return;
    }

    if (!["GET", "HEAD"].includes(request.method || "GET")) {
      throw new HttpError(405, "请求方法不支持。");
    }

    assertLocalRequest(request);
    await serveStatic(request, response, pathname);
  } catch (error) {
    if (error instanceof HttpError) {
      if (!response.headersSent) sendJson(response, error.status, { ok: false, error: error.message });
      else response.end();
      return;
    }
    console.error(error);
    if (!response.headersSent) {
      sendJson(response, 500, { ok: false, error: "服务器内部错误。" });
    } else {
      response.end();
    }
  }
}

function browserCommand(url) {
  if (process.platform === "win32") {
    return { command: "cmd", args: ["/c", "start", "", url] };
  }
  if (process.platform === "darwin") {
    return { command: "open", args: [url] };
  }
  return { command: "xdg-open", args: [url] };
}

function openBrowser(url) {
  try {
    const { command, args } = browserCommand(url);
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.on("error", () => {
      console.log(`无法自动打开浏览器，请手动访问：${url}`);
    });
    child.unref();
  } catch {
    console.log(`无法自动打开浏览器，请手动访问：${url}`);
  }
}

function printBanner(url) {
  const line = "─".repeat(52);
  console.log("");
  console.log(`  ${line}`);
  console.log("  餐边柜 SKU Studio · 本地工作台");
  console.log(`  站点    ${url}/`);
  console.log(`  编辑器  ${url}/editor.html`);
  console.log("  关闭此窗口或按 Ctrl + C 停止服务");
  console.log(`  ${line}`);
  console.log("");
}

function listen(port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, HOST, () => {
      server.removeListener("error", reject);
      resolve(port);
    });
  });
}

async function start() {
  server = http.createServer(requestHandler);
  let lastError = null;

  for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt += 1) {
    const port = DEFAULT_PORT + attempt;
    try {
      await listen(port);
      listeningPort = port;
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      if (error.code !== "EADDRINUSE") break;
      console.log(`端口 ${port} 已被占用，尝试下一个端口…`);
    }
  }

  if (!listeningPort) {
    console.error("无法启动本地服务器：", lastError?.message || "未知错误");
    process.exitCode = 1;
    return;
  }

  watchProject();
  const url = `http://${HOST}:${listeningPort}`;
  printBanner(url);

  if (OPEN_BROWSER && !NO_OPEN) {
    setTimeout(() => openBrowser(`${url}/editor.html`), 350);
  }

  const shutdown = () => {
    console.log("\n正在关闭本地服务…");
    for (const watcher of watchers) watcher.close();
    for (const client of SSE_CLIENTS) client.end();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500).unref();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
