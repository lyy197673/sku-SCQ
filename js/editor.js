/* ==========================================================================
   SKU Studio · local visual editor
   Works only when served by server/server.js.
   ========================================================================== */

(() => {
  "use strict";

  const SECTIONS = {
    content: {
      label: "页面文案",
      meta: "全部可见文字",
      kicker: "CONTENT",
      title: "页面文案",
      description: "前台所有可见文字都从这里维护：品牌、步骤提示、按钮、结果页与网站使用说明。",
      icon: "type",
    },
    catalog: {
      label: "类目数据",
      meta: "系列 · 门型 · 尺寸",
      kicker: "CATALOG",
      title: "类目数据",
      description: "维护系列、门型、高度组、宽度、深度、颜色与待补价备注。保存后即时同步到前台预览。",
      icon: "grid",
    },
    theme: {
      label: "外观主题",
      meta: "玻璃与色彩",
      kicker: "APPEARANCE",
      title: "外观主题",
      description: "调整强调色、背景氛围、玻璃材质、圆角与动效，并控制前台模块的显示。",
      icon: "palette",
    },
    announcements: {
      label: "公告中心",
      meta: "发布与上下线",
      kicker: "ANNOUNCEMENTS",
      title: "公告中心",
      description: "创建公告、设定展示时间与置顶状态。发布后会写入站点配置并立即刷新预览。",
      icon: "bell",
    },
    code: {
      label: "源码编辑",
      meta: "HTML / CSS / JS",
      kicker: "SOURCE",
      title: "源码编辑",
      description: "直接编辑前台源文件，保存时自动语法校验并创建备份。",
      icon: "code",
    },
  };

  const SECTION_KEYS = Object.keys(SECTIONS);
  const CONTENT_ROOTS = [
    "meta",
    "brand",
    "nav",
    "hero",
    "modes",
    "steps",
    "common",
    "catalog",
    "summary",
    "options",
    "combo",
    "result",
    "colors",
    "styleNames",
    "dialogs",
    "announcement",
    "help",
    "footer",
  ];

  const GROUP_INFO = {
    meta: { title: "页面信息", desc: "浏览器标签页标题、页面描述与语言。" },
    brand: { title: "品牌标识", desc: "顶部品牌标记、名称与英文小标。" },
    nav: { title: "导航与按钮", desc: "公告、说明、主题切换等导航文案。" },
    hero: { title: "首页主视觉", desc: "首页标题、说明和指标卡。" },
    modes: { title: "模式切换", desc: "单柜与组合柜两个模式的名称和说明。" },
    steps: { title: "流程步骤", desc: "两种模式的步骤名、标题和每一步的提示语。" },
    common: { title: "通用按钮", desc: "上一步、下一步、复制、重新开始等通用文案。" },
    catalog: { title: "产品画册", desc: "顶部产品画册的标题、筛选标签、搜索提示与空状态。" },
    summary: { title: "步骤已选内容", desc: "左侧步骤条目中已选内容的显示格式。" },
    options: { title: "选项文案", desc: "宽度、层数、款式、组合状态等选项说明。" },
    combo: { title: "组合柜文案", desc: "组合卡片的标签、按钮与提示。" },
    result: { title: "结果页", desc: "统计卡、清单标题、列表格式与导出文案。" },
    colors: { title: "颜色名称", desc: "类目数据中的颜色代码在这里映射为显示名称。" },
    styleNames: { title: "款式名称", desc: "按高度映射站脚款和落地款的显示名称。" },
    dialogs: { title: "弹窗文案", desc: "复制成功、公告中心和使用说明弹窗。" },
    announcement: { title: "公告栏文案", desc: "公告徽标、日期模板与操作文字。" },
    help: { title: "网站使用说明", desc: "面向业务用户的网站使用指南，不包含编辑器操作。" },
    footer: { title: "页脚", desc: "页脚的小标、说明与版权文字。" },
  };

  const KEY_LABELS = {
    title: "标题",
    description: "描述",
    lang: "语言",
    mark: "标识字符",
    name: "名称",
    tagline: "英文小标",
    announcements: "公告按钮",
    catalog: "产品画册按钮",
    help: "说明按钮",
    themeLight: "浅色模式提示",
    themeDark: "深色模式提示",
    skip: "跳转提示",
    progress: "进度栏标签",
    eyebrow: "顶部眉题",
    subtitle: "副标题",
    metrics: "指标项",
    value: "显示值",
    label: "名称",
    caption: "补充说明",
    nav: "步骤短名",
    hint: "提示语",
    actionType: "动作类型",
    key: "内部键",
    all: "全选",
    none: "清空",
    allGlobal: "全选所有",
    noneGlobal: "清空所有",
    prev: "上一步",
    next: "下一步",
    restart: "重新开始",
    copy: "复制按钮",
    copyAgain: "再次复制",
    copied: "已复制",
    copiedToast: "复制成功提示",
    copyFailedToast: "复制失败提示",
    resetToast: "重新开始提示",
    stepOf: "步骤进度格式",
    resultKicker: "结果页英文标签",
    close: "关闭",
    confirm: "确认",
    cancel: "取消",
    selectionType: "款数后缀",
    lockedStep: "步骤锁定提示",
    emptyGroup: "空分组提示",
    more: "更多",
    empty: "空状态文案",
    labels: "字段名称",
    formats: "显示格式",
    joiner: "连接分隔符",
    overflow: "溢出提示",
    seriesRows: "系列规格数格式",
    mixSeries: "混搭系列名称",
    mixSeriesDesc: "混搭系列说明",
    tagPending: "待补价标签",
    width: "宽度格式",
    layer: "层数格式",
    standing: "站脚款名称",
    floor: "落地款名称",
    standingDesc: "站脚款说明",
    floorDesc: "落地款说明",
    styleMeta: "款式显示格式",
    heightGroup: "高度组标题格式",
    comboNeed: "无效组合提示",
    comboReady: "有效组合提示",
    comboDuplicate: "重复组合提示",
    comboOk: "组合完成提示",
    noModel: "缺少门型提示",
    noWidth: "缺少宽度提示",
    noPrereq: "缺少前置条件提示",
    selectAllHint: "全选按钮说明",
    groupLabel: "组合名称格式",
    selectPlaceholder: "柜体占位文案",
    addCabinet: "添加柜体",
    copyGroup: "复制组合",
    deleteGroup: "删除组合",
    addGroup: "新建组合",
    batchCopy: "批量复制按钮",
    batchCopyDone: "批量复制提示",
    batchSelectHint: "批量复制说明",
    selectedCount: "勾选数量提示",
    duplicate: "重复标记",
    groupHint: "组合提示",
    pickerTitle: "选择器标题",
    pickerHint: "选择器说明",
    pickerSeriesMeta: "系列数量格式",
    pickerModelMeta: "门型宽度数量格式",
    pickerWidth: "宽度选项格式",
    pickerClear: "清除选择按钮",
    pickerClose: "关闭选择器按钮",
    pickerEmpty: "选择器空状态",
    item: "组合柜选项格式",
    itemMixed: "混搭柜选项格式",
    separator: "加号文字",
    kicker: "英文小标",
    totalLabel: "SKU 总数标签",
    specsLabel: "柜体规格标签",
    modelsLabel: "款式数标签",
    listTitle: "清单标题",
    copyHint: "复制提示",
    emptyTitle: "空结果标题",
    seriesHeading: "单柜系列标题格式",
    comboHeading: "组合柜标题格式",
    itemName: "单柜条目格式",
    comboItem: "组合条目格式",
    comboItemMixed: "混搭条目格式",
    metaWrap: "条件行包裹格式",
    metaLayers: "层板说明格式",
    metaColors: "颜色说明格式",
    metaJoiner: "条件分隔符",
    standingPrefix: "站脚前缀",
    floorPrefix: "落地前缀",
    comboSeparator: "组合连接符",
    pending: "待补价标记",
    layerValue: "层数单位格式",
    colorJoiner: "颜色连接符",
    specCount: "条目统计格式",
    comboColorLabel: "组合柜颜色标签",
    metaSummary: "条件摘要格式",
    noLayers: "无层数提示",
    noColors: "无颜色提示",
    badge: "公告徽标",
    pinned: "置顶标记",
    published: "发布时间格式",
    expires: "有效期格式",
    readMore: "查看详情",
    dismiss: "关闭公告",
    viewAll: "查看全部",
    previous: "历史公告标题",
    active: "展示中状态",
    inactive: "已下线状态",
    intro: "简介",
    steps: "条目列表",
    tipsTitle: "提示标题",
    tips: "提示列表",
    footer: "结尾文字",
    note: "页脚小标",
    text: "页脚说明",
    copyright: "版权文字",
    copyTitle: "复制成功标题",
    copyBody: "复制成功说明",
    continue: "继续生成按钮",
    submit: "提交任务按钮",
    submitUrl: "提交任务链接",
    announcementTitle: "公告中心标题",
    announcementEmpty: "无公告提示",
    announcementClose: "公告关闭按钮",
    helpTitle: "网站使用说明标题",
    helpClose: "说明关闭按钮",
    series: "系列",
    model: "门型",
    styles: "款式",
    colors: "颜色",
    layers: "层数",
    combos: "组合",
    searchPlaceholder: "画册搜索提示",
    allSeries: "全部系列",
    styleLabel: "画册款式筛选",
    stand: "站脚款",
    floor: "落地款",
    widthLabel: "画册宽度筛选",
    allWidths: "全部宽度",
    colorLabel: "画册颜色筛选",
    allColors: "全部颜色",
    viewLarge: "查看大图按钮",
    preview: "组合预览按钮",
    livePreview: "右侧实时预览标题",
    zoomHint: "效果图缩放提示",
    previewHint: "组合预览提示",
    previewTitle: "组合预览标题",
    previewEmpty: "组合预览空状态",
    previewNote: "组合预览说明",
    single: "单柜模式",
    combo: "组合柜模式",
  };

  const FIELD_OVERRIDES = {
    "meta.title": "浏览器标题",
    "meta.description": "页面描述",
    "meta.lang": "页面语言",
    "brand.mark": "品牌字符",
    "brand.name": "品牌名称",
    "brand.tagline": "品牌英文小标",
    "nav.progress": "进度栏英文标签",
    "hero.metrics": "首页指标项",
    "modes.single": "单柜模式文案",
    "modes.combo": "组合柜模式文案",
    "steps.single": "单柜步骤文案",
    "steps.combo": "组合柜步骤文案",
    "summary.formats": "步骤已选内容格式",
    "colors": "颜色代码与显示名称",
    "styleNames": "高度与款式名称",
    "dialogs.submitUrl": "提交任务链接",
    "help.steps": "网站使用步骤",
    "help.tips": "网站使用提示",
    "footer.copyright": "版权文字",
  };

  const LONG_TEXT_KEYS = new Set([
    "description",
    "subtitle",
    "hint",
    "body",
    "intro",
    "copyBody",
    "footer",
    "text",
    "note",
    "caption",
    "comboNeed",
    "comboReady",
    "comboDuplicate",
    "comboOk",
    "groupHint",
  ]);

  const LOCKED_ARRAYS = new Set(["steps.single", "steps.combo"]);
  const LONG_VALUE_LENGTH = 105;

  const ICONS = {
    type: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6V4h16v2M12 4v16M8.5 20h7"></path></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1.4"></rect><rect x="14" y="4" width="6" height="6" rx="1.4"></rect><rect x="4" y="14" width="6" height="6" rx="1.4"></rect><rect x="14" y="14" width="6" height="6" rx="1.4"></rect></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18h1.3a1.7 1.7 0 0 0 1.2-2.9l-.3-.3a1.8 1.8 0 0 1 1.3-3.1H17a4 4 0 0 0 4-4c0-4.4-4-7.7-9-7.7Z"></path><path d="M7.3 10h.01M9.7 6.7h.01M14.4 6.4h.01M17.6 9.6h.01"></path></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"></path></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m7 10 5 5 5-5"></path></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 6-6 6 6"></path></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m6 10 6 6 6-6"></path></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9"></path><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"></path></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11a8.5 8.5 0 1 0 2.2-6.3L3 7.4"></path><path d="M3 3v4.4h4.4"></path></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l3 3v13H5Z"></path><path d="M8 4v6h8V4M8 20v-6h8v6"></path></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 3.6 19h16.8L12 4Z"></path><path d="M12 9v4M12 16h.01"></path></svg>',
  };

  const state = {
    loaded: false,
    online: false,
    activeSection: "content",
    switching: false,
    saving: false,
    syncingCode: false,
    lastError: "",
    dirty: false,
    codeDirty: false,
    site: null,
    originalSite: null,
    catalog: [],
    originalCatalog: [],
    catalogErrors: new Set(),
    files: [],
    activeFile: "index.html",
    codeLoaded: false,
    codeLoading: false,
    codeRequestId: 0,
    fileContent: "",
    originalFileContent: "",
    fileLanguage: "html",
    fileMeta: null,
    openGroups: new Set(["meta", "brand", "nav", "hero"]),
    contentSearch: "",
    catalogSearch: "",
    openSeries: new Set(),
    openModels: new Set(),
    seriesInitialized: false,
    announcementEditingId: null,
    announcementDraft: null,
    announcementTone: "info",
    announcementFormDirty: false,
    viewport: "desktop",
    previewMounted: false,
    suspendOpenTracking: false,
    events: null,
  };

  let ui = {};
  let uidCounter = 0;
  let toastTimer = 0;
  let previewTimer = 0;
  let dialogActive = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });
  }

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    uidCounter += 1;
    return `uid-${Date.now().toString(36)}-${uidCounter}`;
  }

  function getAtPath(object, path) {
    return String(path)
      .split(".")
      .reduce((value, segment) => (value == null ? undefined : value[segment]), object);
  }

  function setAtPath(object, path, value) {
    const segments = String(path).split(".");
    let cursor = object;
    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        cursor[segment] = value;
      } else {
        if (cursor[segment] == null || typeof cursor[segment] !== "object") {
          cursor[segment] = /^\d+$/.test(segments[index + 1]) ? [] : {};
        }
        cursor = cursor[segment];
      }
    });
  }

  function normalizeHex(value, fallback) {
    if (typeof value !== "string") return fallback;
    const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return fallback;
    if (match[1].length === 3) {
      return `#${match[1].split("").map((part) => part + part).join("")}`;
    }
    return `#${match[1]}`;
  }

  function isHex(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
  }

  function safeHref(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const parsed = new URL(value, window.location.href);
      return ["http:", "https:", "mailto:"].includes(parsed.protocol) ? parsed.href : "";
    } catch {
      return "";
    }
  }

  function toLocalDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function toIsoDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function formatEditorDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function toast(message, type = "success") {
    if (!message) return;
    const icon = ui.editorToast.querySelector(".editor-toast__icon");
    if (icon) icon.textContent = type === "error" ? "!" : type === "warning" ? "·" : "✓";
    ui.editorToast.classList.toggle("is-error", type === "error");
    ui.editorToast.classList.toggle("is-warning", type === "warning");
    ui.editorToastText.textContent = message;
    ui.editorToast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => ui.editorToast.classList.remove("is-visible"), 2800);
  }

  function setServerState(kind, message) {
    ui.serverChip.classList.toggle("is-online", kind === "online");
    ui.serverChip.classList.toggle("is-error", kind === "error");
    ui.serverStatus.textContent = message;
  }

  async function fetchJson(path, options = {}) {
    const headers = { Accept: "application/json", ...(options.headers || {}) };
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(path, {
      cache: "no-store",
      ...options,
      headers,
    });
    const raw = await response.text();
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }
    if (!response.ok) {
      throw new Error(payload?.error || `请求失败（HTTP ${response.status}）`);
    }
    return payload;
  }

  /* ------------------------------------------------------------------------
     Boot and workspace hydration
     ------------------------------------------------------------------------ */

  async function loadWorkspace() {
    setServerState("loading", "正在连接本地服务…");
    ui.syncState.className = "sync-state is-saving";
    ui.syncText.textContent = "正在读取项目…";
    try {
      const payload = await fetchJson("/api/bootstrap");
      hydrateWorkspace(payload);
      ui.connectionScreen.hidden = true;
      ui.loadingPanel.hidden = true;
      state.online = true;
      setServerState("online", "本地服务已连接");
      updateNavMeta();
      renderSection();
      updateChrome();
      mountPreview();
      connectEvents();
    } catch (error) {
      state.online = false;
      ui.connectionScreen.hidden = false;
      ui.loadingPanel.hidden = true;
      setServerState("error", "本地服务未连接");
      ui.syncState.className = "sync-state is-error";
      ui.syncText.textContent = "未连接";
      console.error(error);
    }
  }

  function hydrateWorkspace(payload) {
    state.site = payload.siteConfig;
    state.originalSite = clone(payload.siteConfig);
    state.catalog = toCatalogObjects(payload.catalog);
    state.originalCatalog = clone(state.catalog);
    state.files = Array.isArray(payload.files) ? payload.files : [];
    state.loaded = true;
    state.saving = false;
    state.dirty = false;
    state.codeDirty = false;
    state.lastError = "";
    state.seriesInitialized = false;
    state.announcementFormDirty = false;
    state.announcementEditingId = null;
    state.announcementDraft = null;
    ensureSeriesOpenState();
    ensureAnnouncementDraft();
    if (!state.files.some((file) => file.path === state.activeFile) && state.files[0]) {
      state.activeFile = state.files[0].path;
    }
  }

  function toCatalogObjects(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      uid: uid(),
      series: String(row?.[0] ?? ""),
      model: String(row?.[1] ?? ""),
      heightGroup: String(row?.[2] ?? ""),
      width: String(row?.[3] ?? ""),
      depth: String(row?.[4] ?? ""),
      colors: Array.from(String(row?.[5] ?? "")).filter(Boolean),
      flag: String(row?.[6] ?? ""),
    }));
  }

  function toCatalogRows(items) {
    return items.map((item) => [
      String(item.series || "").trim(),
      String(item.model || "").trim(),
      String(item.heightGroup || "").trim(),
      Number(item.width),
      Number(item.depth),
      [...new Set(item.colors || [])].join(""),
      String(item.flag || "").trim(),
    ]);
  }

  function ensureSeriesOpenState() {
    if (state.seriesInitialized) return;
    state.openSeries.clear();
    state.openModels.clear();
    const first = state.catalog[0]?.series;
    if (first) state.openSeries.add(first);
    state.seriesInitialized = true;
  }

  function activeAnnouncementCount() {
    const now = Date.now();
    return (state.site?.announcements || []).filter((announcement) => {
      if (!announcement || announcement.active === false) return false;
      if (announcement.publishedAt && !Number.isNaN(new Date(announcement.publishedAt).getTime())) {
        if (new Date(announcement.publishedAt).getTime() > now) return false;
      }
      if (announcement.expiresAt && !Number.isNaN(new Date(announcement.expiresAt).getTime())) {
        return new Date(announcement.expiresAt).getTime() >= now;
      }
      return true;
    }).length;
  }

  function updateNavMeta() {
    const metaMap = {
      content: state.loaded ? "全部可见文字" : "全部可见文字",
      catalog: state.loaded ? `${state.catalog.length} 条规格` : "系列 · 门型 · 尺寸",
      theme: "玻璃与色彩",
      announcements: state.loaded ? `${activeAnnouncementCount()} 条在线` : "发布与上下线",
      code: "HTML / CSS / JS",
    };
    for (const key of SECTION_KEYS) {
      const element = ui.studioNav.querySelector(`[data-nav-meta="${key}"]`);
      if (element) element.textContent = metaMap[key] || SECTIONS[key].meta;
    }
  }

  function buildNav() {
    ui.studioNav.innerHTML = SECTION_KEYS.map(
      (key) => `<button class="studio-nav__button" type="button" data-section="${key}">
        <span class="studio-nav__icon">${ICONS[SECTIONS[key].icon]}</span>
        <span class="studio-nav__copy">
          <span class="studio-nav__label">${esc(SECTIONS[key].label)}</span>
          <span class="studio-nav__meta" data-nav-meta="${key}">${esc(SECTIONS[key].meta)}</span>
        </span>
        <span class="studio-nav__dot" hidden></span>
      </button>`
    ).join("");
    setActiveNav(state.activeSection);
  }

  function setActiveNav(section) {
    $$(".studio-nav__button", ui.studioNav).forEach((button) => {
      button.classList.toggle("is-active", button.dataset.section === section);
    });
  }

  function syncPaneSwitch() {
    $$("[data-pane]", ui.paneSwitch).forEach((button) => {
      button.classList.toggle("is-active", button.dataset.pane === document.body.dataset.pane);
    });
  }

  function setPane(pane) {
    document.body.dataset.pane = pane === "preview" ? "preview" : "edit";
    syncPaneSwitch();
  }

  /* ------------------------------------------------------------------------
     Chrome, dirty state, preview
     ------------------------------------------------------------------------ */

  function effectiveDirty() {
    if (state.activeSection === "code") return state.codeDirty;
    return state.dirty || (state.activeSection === "announcements" && state.announcementFormDirty);
  }

  function updateChrome() {
    const isCode = state.activeSection === "code";
    const dirty = effectiveDirty();
    const canSave =
      state.loaded &&
      !state.saving &&
      !(isCode && (!state.codeLoaded || state.codeLoading));

    ui.saveButton.disabled = !canSave;
    ui.revertButton.disabled = !dirty || state.saving;
    ui.saveButton.classList.toggle("is-busy", state.saving);
    ui.saveButtonText.textContent = state.saving
      ? "正在保存…"
      : isCode
        ? "保存源码"
        : state.activeSection === "announcements" && state.announcementFormDirty
          ? "保存公告"
          : "保存并应用";

    ui.syncState.className = "sync-state";
    if (state.saving) {
      ui.syncState.classList.add("is-saving");
      ui.syncText.textContent = "正在保存…";
    } else if (state.lastError) {
      ui.syncState.classList.add("is-error");
      ui.syncText.textContent = "保存失败";
    } else if (dirty) {
      ui.syncState.classList.add("is-dirty");
      ui.syncText.textContent = "未保存更改";
    } else {
      ui.syncText.textContent = "已同步";
    }

    const label = SECTIONS[state.activeSection]?.title || "编辑器";
    document.title = `${dirty ? "• " : ""}SKU Studio · ${label}`;
    updateNavMeta();
  }

  function markVisualDirty() {
    state.dirty = true;
    state.lastError = "";
    updateChrome();
  }

  function markCodeDirty() {
    state.codeDirty = true;
    state.lastError = "";
    updateChrome();
  }

  function markAnnouncementFormDirty() {
    state.announcementFormDirty = true;
    state.lastError = "";
    updateChrome();
  }

  function previewUrl() {
    return `/index.html?preview=1&t=${Date.now()}`;
  }

  function mountPreview() {
    if (state.previewMounted) return;
    state.previewMounted = true;
    ui.previewIframe.src = previewUrl();
    applyViewport(state.viewport);
  }

  function reloadPreviewSoon() {
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      if (ui.previewIframe) ui.previewIframe.src = previewUrl();
    }, 140);
  }

  function applyViewport(viewport) {
    if (!["desktop", "tablet", "mobile"].includes(viewport)) viewport = "desktop";
    state.viewport = viewport;
    ui.previewBrowser.dataset.viewport = viewport;
    $$("[data-viewport]", ui.viewportSwitch).forEach((button) => {
      button.classList.toggle("is-active", button.dataset.viewport === viewport);
    });
    const labels = {
      desktop: "桌面 · 实时同步",
      tablet: "平板 · 实时同步",
      mobile: "手机 · 实时同步",
    };
    ui.previewLabel.textContent = labels[viewport];
    try {
      window.localStorage.setItem("sku-studio-editor-viewport-v1", viewport);
    } catch {
      /* optional */
    }
  }

  function restoreViewport() {
    let viewport = "desktop";
    try {
      const stored = window.localStorage.getItem("sku-studio-editor-viewport-v1");
      if (["desktop", "tablet", "mobile"].includes(stored)) viewport = stored;
    } catch {
      viewport = "desktop";
    }
    applyViewport(viewport);
  }

  function connectEvents() {
    if (state.events) state.events.close();
    try {
      state.events = new EventSource("/api/events");
    } catch {
      return;
    }
    state.events.addEventListener("ready", () => {
      state.online = true;
      setServerState("online", "本地服务已连接");
    });
    state.events.addEventListener("reload", (event) => {
      state.online = true;
      setServerState("online", "本地服务已连接");
      reloadPreviewSoon();
      let payload = null;
      try {
        payload = JSON.parse(event.data);
      } catch {
        payload = null;
      }
      if (payload?.reason === "external-change") {
        toast("检测到项目文件更新，预览已刷新", "success");
      }
    });
    state.events.onerror = () => {
      state.online = false;
      setServerState("error", "连接中断，正在重连…");
    };
  }

  /* ------------------------------------------------------------------------
     Section shell
     ------------------------------------------------------------------------ */

  async function activateSection(key, options = {}) {
    if (!SECTIONS[key] || !state.loaded || state.switching) return;
    if (key === state.activeSection) {
      setPane("edit");
      return;
    }
    state.switching = true;
    try {
      if (state.activeSection === "code" && state.codeDirty && !options.force) {
        const leave = await confirmDialog({
          title: "源码尚未保存",
          message: "离开源码编辑会丢失当前文件未保存的修改。",
          confirmText: "放弃并离开",
          cancelText: "继续编辑",
          danger: true,
        });
        if (!leave) return;
        state.codeDirty = false;
        state.codeLoaded = false;
        state.codeLoading = false;
        state.fileContent = "";
        state.originalFileContent = "";
      }

      if (
        state.activeSection === "announcements" &&
        state.announcementFormDirty &&
        !options.force
      ) {
        const leave = await confirmDialog({
          title: "公告表单尚未保存",
          message: "离开公告中心会丢弃正在编辑的公告内容。",
          confirmText: "放弃并离开",
          cancelText: "取消",
          danger: true,
        });
        if (!leave) return;
        state.announcementFormDirty = false;
        resetAnnouncementDraftFromSource();
      }

      if (key === "code" && (state.dirty || state.announcementFormDirty)) {
        toast("请先保存当前修改，再进入源码编辑", "warning");
        return;
      }

      state.activeSection = key;
      setActiveNav(key);
      setPane("edit");
      ui.sectionKicker.textContent = SECTIONS[key].kicker;
      ui.sectionTitle.textContent = SECTIONS[key].title;
      ui.editorPane.classList.toggle("is-code", key === "code");
      ui.editorPane.scrollTop = 0;
      renderSection();
      updateChrome();
    } finally {
      state.switching = false;
    }
  }

  function renderSection() {
    const key = state.activeSection;
    ui.sectionKicker.textContent = SECTIONS[key]?.kicker || "";
    ui.sectionTitle.textContent = SECTIONS[key]?.title || "";
    setActiveNav(key);
    ui.loadingPanel.hidden = true;
    if (key === "content") renderContentSection();
    if (key === "catalog") renderCatalogSection();
    if (key === "theme") renderThemeSection();
    if (key === "announcements") renderAnnouncementSection();
    if (key === "code") {
      renderCodeSection();
      if (!state.codeLoaded && !state.codeLoading) loadCodeFile(state.activeFile);
    }
    updateChrome();
  }

  function sectionIntro({ eyebrow, title, description, chips = [] }) {
    return `<div class="section-intro">
      <div class="section-intro__copy">
        <p class="section-intro__eyebrow">${esc(eyebrow)}</p>
        <h2>${esc(title)}</h2>
        <p>${esc(description)}</p>
      </div>
      <div class="section-chips">${chips.filter(Boolean).join("")}</div>
    </div>`;
  }

  function updateEditorPaneScroll(callback) {
    const top = ui.editorPane.scrollTop;
    callback();
    window.requestAnimationFrame(() => {
      ui.editorPane.scrollTop = top;
    });
  }

  /* ------------------------------------------------------------------------
     Content renderer
     ------------------------------------------------------------------------ */

  function isHiddenField(path, keyName) {
    return path.startsWith("steps.") && (keyName === "key" || keyName === "actionType");
  }

  function getFieldLabel(path, keyName) {
    if (FIELD_OVERRIDES[path]) return FIELD_OVERRIDES[path];
    if (path.startsWith("colors.") && !path.slice(7).includes(".")) {
      return `「${path.split(".").pop()}」的显示名称`;
    }
    if (path.startsWith("styleNames.") && !path.slice(11).includes(".")) {
      return `高度 ${path.split(".").pop()} 的款式名`;
    }
    return KEY_LABELS[keyName] || keyName.replace(/([A-Z])/g, " $1");
  }

  function isLongField(path, keyName, value) {
    return (
      LONG_TEXT_KEYS.has(keyName) ||
      String(value ?? "").length > LONG_VALUE_LENGTH ||
      String(value ?? "").includes("\n")
    );
  }

  function fieldHint(path, keyName, value) {
    if (path === "dialogs.submitUrl") return "使用 https:// 链接；留空时隐藏提交任务按钮。";
    if (path === "steps.single" || path === "steps.combo") {
      return "步骤结构固定，只能编辑步骤名称和提示语。";
    }
    const tokens = [...new Set(String(value ?? "").match(/\{[a-zA-Z0-9_-]+\}/g) || [])];
    if (tokens.length) {
      return `可用变量：${tokens.map((token) => `<code>${esc(token)}</code>`).join(" ")}`;
    }
    return "";
  }

  function renderPrimitiveField(path, keyName, value) {
    const label = getFieldLabel(path, keyName);
    const long = isLongField(path, keyName, value);
    const hint = fieldHint(path, keyName, value);
    const type = typeof value === "number" ? "number" : "text";
    const stringValue = value == null ? "" : String(value);
    const search = `${path} ${label} ${stringValue}`.toLowerCase();
    return `<label class="field${long ? " field--wide" : ""}" data-search="${esc(search)}">
      <span class="field__label"><span>${esc(label)}</span><span class="field__path">${esc(path)}</span></span>
      ${
        long
          ? `<textarea data-field-path="${esc(path)}" data-field-type="string" spellcheck="false">${esc(stringValue)}</textarea>`
          : `<input type="${type}" data-field-path="${esc(path)}" data-field-type="${type}" value="${esc(stringValue)}" spellcheck="false" ${path.toLowerCase().includes("url") || path.toLowerCase().includes("href") ? 'inputmode="url"' : ""}>`
      }
      <span class="field__footer">
        <span class="field__hint">${hint}</span>
        ${long ? `<span class="char-count" data-count-for="${esc(path)}">${stringValue.length}</span>` : ""}
      </span>
    </label>`;
  }

  function renderBooleanField(path, keyName, value) {
    const label = getFieldLabel(path, keyName);
    return `<label class="switch switch--field" data-search="${esc(`${path} ${label}`)}">
      <span class="switch__copy"><strong>${esc(label)}</strong><small>${esc(path)}</small></span>
      <input type="checkbox" data-field-path="${esc(path)}" data-field-type="boolean" ${value ? "checked" : ""}>
      <span class="switch__track" aria-hidden="true"></span>
    </label>`;
  }

  function renderObjectFieldset(path, keyName, value) {
    const label = getFieldLabel(path, keyName);
    const children = renderObjectChildren(value, path);
    if (!children) return "";
    return `<fieldset class="fieldset" data-search="${esc(`${path} ${label}`)}">
      <legend class="fieldset__legend">${esc(label)}</legend>
      <div class="field-grid">${children}</div>
    </fieldset>`;
  }

  function renderObjectChildren(object, path) {
    return Object.entries(object)
      .filter(([key]) => !isHiddenField(path ? `${path}.${key}` : key, key))
      .map(([key, value]) => renderValue(path ? `${path}.${key}` : key, key, value))
      .join("");
  }

  function renderValue(path, keyName, value) {
    if (isHiddenField(path, keyName)) return "";
    if (Array.isArray(value)) return renderArrayField(path, keyName, value);
    if (isObject(value)) return renderObjectFieldset(path, keyName, value);
    if (typeof value === "boolean") return renderBooleanField(path, keyName, value);
    if (typeof value === "number") return renderPrimitiveField(path, keyName, value);
    if (typeof value === "string") return renderPrimitiveField(path, keyName, value);
    return "";
  }

  function blankLike(value) {
    if (Array.isArray(value)) return [];
    if (isObject(value)) {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, blankLike(child)]));
    }
    if (typeof value === "boolean") return false;
    if (typeof value === "number") return 0;
    return "";
  }

  function arrayItemTitle(item, index) {
    if (!isObject(item)) return `第 ${index + 1} 项`;
    const candidates = [item.nav, item.title, item.label, item.name, item.value];
    const found = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
    return found ? `第 ${index + 1} 项 · ${found}` : `第 ${index + 1} 项`;
  }

  function arrayItemActions(path, index, length, locked) {
    if (locked) return "";
    return `<div class="array-item__actions">
      <button class="icon-btn" type="button" data-array-action="up" data-array-path="${esc(path)}" data-array-index="${index}" title="上移" aria-label="上移" ${index === 0 ? "disabled" : ""}>${ICONS.up}</button>
      <button class="icon-btn" type="button" data-array-action="down" data-array-path="${esc(path)}" data-array-index="${index}" title="下移" aria-label="下移" ${index === length - 1 ? "disabled" : ""}>${ICONS.down}</button>
      <button class="icon-btn is-danger" type="button" data-array-action="remove" data-array-path="${esc(path)}" data-array-index="${index}" title="删除" aria-label="删除">${ICONS.trash}</button>
    </div>`;
  }

  function renderArrayField(path, keyName, array) {
    const label = getFieldLabel(path, keyName);
    const locked = LOCKED_ARRAYS.has(path);
    const items = array
      .map((item, index) => {
        if (isObject(item)) {
          const fields = renderObjectChildren(item, `${path}.${index}`);
          return `<div class="array-item" data-search="${esc(`${label} ${index} ${JSON.stringify(item)}`)}">
            <div class="array-item__head">
              <span class="array-item__title">${esc(arrayItemTitle(item, index))}</span>
              ${arrayItemActions(path, index, array.length, locked)}
            </div>
            <div class="field-grid">${fields}</div>
          </div>`;
        }
        const labelText = getFieldLabel(`${path}.${index}`, keyName);
        return `<div class="array-item array-item--primitive" data-search="${esc(`${label} ${index} ${item}`)}">
          <label class="field">
            <span class="field__label"><span>${esc(labelText)}</span><span class="field__path">${esc(`${path}.${index}`)}</span></span>
            <input type="text" data-field-path="${esc(`${path}.${index}`)}" data-field-type="string" value="${esc(item)}">
          </label>
          ${arrayItemActions(path, index, array.length, locked)}
        </div>`;
      })
      .join("");

    return `<div class="field field--wide array-field" data-search="${esc(`${path} ${label}`)}">
      <div class="array-head">
        <span class="field__label"><span>${esc(label)}</span><span class="field__path">${esc(path)}</span></span>
        ${
          locked
            ? `<span class="field__hint">结构锁定</span>`
            : `<button class="array-add" type="button" data-array-action="add" data-array-path="${esc(path)}">${ICONS.plus}<span>添加</span></button>`
        }
      </div>
      <div class="array-list">
        ${items || `<div class="array-empty">暂无内容</div>`}
      </div>
    </div>`;
  }

  function countLeaves(value, path = "") {
    if (Array.isArray(value)) {
      return value.reduce((total, item, index) => total + countLeaves(item, `${path}.${index}`), 0);
    }
    if (isObject(value)) {
      return Object.entries(value).reduce(
        (total, [key, child]) =>
          isHiddenField(path ? `${path}.${key}` : key, key)
            ? total
            : total + countLeaves(child, path ? `${path}.${key}` : key),
        0
      );
    }
    return 1;
  }

  function collectSearchText(value) {
    if (Array.isArray(value)) return value.map(collectSearchText).join(" ");
    if (isObject(value)) {
      return Object.entries(value)
        .map(([key, child]) => `${key} ${collectSearchText(child)}`)
        .join(" ");
    }
    return String(value ?? "");
  }

  function contentFieldTotal() {
    if (!state.site) return 0;
    return CONTENT_ROOTS.reduce(
      (total, root) => total + (state.site[root] === undefined ? 0 : countLeaves(state.site[root], root)),
      0
    );
  }

  function renderContentSection() {
    if (!state.site) return;
    const cards = CONTENT_ROOTS.map((root) => {
      const value = state.site[root];
      if (value === undefined) return "";
      const info = GROUP_INFO[root] || { title: root, desc: "" };
      const count = countLeaves(value, root);
      const open = state.openGroups.has(root);
      const searchText = `${root} ${info.title} ${info.desc} ${collectSearchText(value)}`.toLowerCase();
      return `<details class="edit-card" data-group="${root}" data-search="${esc(searchText)}" ${open ? "open" : ""}>
        <summary class="edit-card__summary">
          <span class="edit-card__summary-copy"><strong>${esc(info.title)}</strong><span>${esc(info.desc)}</span></span>
          <span class="edit-card__count">${count} 项</span>
          <span class="edit-card__chevron">${ICONS.chevron}</span>
        </summary>
        <div class="edit-card__body">
          <div class="field-grid">${renderObjectChildren(value, root)}</div>
        </div>
      </details>`;
    }).join("");

    const totalFields = contentFieldTotal();
    ui.sectionContent.innerHTML = `${sectionIntro({
      eyebrow: "VISIBLE COPY",
      title: "所有前台可见文字",
      description: "这里维护用户能看到的全部静态文案。带变量的格式会由页面自动替换，保存后即同步预览。",
      chips: [
        `<span class="section-chip"><b>${CONTENT_ROOTS.length}</b> 组文案</span>`,
        `<span class="section-chip"><b>${totalFields}</b> 个可编辑项</span>`,
      ],
    })}
    <div class="content-toolbar">
      <label class="search-field">
        ${ICONS.search}
        <input id="contentSearch" type="search" placeholder="搜索文案分组或内容…" value="${esc(state.contentSearch)}" autocomplete="off">
      </label>
      <div class="toolbar-meta">
        <button class="chip-button" type="button" data-content-action="expand">展开全部</button>
        <button class="chip-button" type="button" data-content-action="collapse">收起全部</button>
      </div>
    </div>
    <div class="edit-stack" id="copyForm">${cards}</div>
    <div class="no-results" id="contentNoResults">没有找到匹配的文案分组。</div>`;

    bindContentDetails();
    if (state.contentSearch.trim()) applyContentSearch(state.contentSearch);
  }

  function bindContentDetails() {
    $$(".edit-card[data-group]", ui.sectionContent).forEach((card) => {
      card.addEventListener("toggle", () => {
        if (state.suspendOpenTracking) return;
        if (state.contentSearch.trim()) return;
        if (card.open) state.openGroups.add(card.dataset.group);
        else state.openGroups.delete(card.dataset.group);
      });
    });
  }

  function applyContentSearch(query) {
    state.contentSearch = query;
    const normalized = query.trim().toLowerCase();
    const cards = $$(".edit-card[data-group]", ui.sectionContent);
    let visible = 0;
    state.suspendOpenTracking = true;
    cards.forEach((card) => {
      const match = !normalized || (card.dataset.search || "").includes(normalized);
      card.hidden = !match;
      if (match) visible += 1;
      if (normalized && match) card.open = true;
      if (!normalized) card.open = state.openGroups.has(card.dataset.group);
    });
    state.suspendOpenTracking = false;
    const noResults = $("#contentNoResults", ui.sectionContent);
    if (noResults) noResults.style.display = visible ? "none" : "block";
  }

  function refreshContentPreservingScroll() {
    updateEditorPaneScroll(() => {
      renderContentSection();
      if (state.contentSearch.trim()) applyContentSearch(state.contentSearch);
    });
  }

  function handleContentAction(action) {
    if (action === "expand") {
      state.openGroups = new Set(
        $$(".edit-card[data-group]", ui.sectionContent).map((card) => card.dataset.group)
      );
      refreshContentPreservingScroll();
    } else if (action === "collapse") {
      state.openGroups.clear();
      refreshContentPreservingScroll();
    }
  }

  function handleArrayAction(button) {
    const action = button.dataset.arrayAction;
    const path = button.dataset.arrayPath;
    const index = Number(button.dataset.arrayIndex);
    if (!path || LOCKED_ARRAYS.has(path)) return;
    const array = getAtPath(state.site, path);
    if (!Array.isArray(array)) return;

    if (action === "add") {
      const sample = array.length ? array[array.length - 1] : "";
      array.push(blankLike(sample));
    } else if (action === "remove") {
      array.splice(index, 1);
    } else if (action === "up" && index > 0) {
      [array[index - 1], array[index]] = [array[index], array[index - 1]];
    } else if (action === "down" && index < array.length - 1) {
      [array[index + 1], array[index]] = [array[index], array[index + 1]];
    } else {
      return;
    }

    state.contentSearch = $("#contentSearch", ui.sectionContent)?.value || state.contentSearch;
    markVisualDirty();
    refreshContentPreservingScroll();
  }

  function updateContentField(target) {
    const path = target.dataset.fieldPath;
    if (!path) return;
    const type = target.dataset.fieldType;
    let value;
    if (type === "boolean") value = target.checked;
    else if (type === "number") value = target.value === "" ? 0 : Number(target.value);
    else value = target.value;
    setAtPath(state.site, path, value);
    const count = target.closest(".field")?.querySelector(".char-count");
    if (count && typeof value === "string") count.textContent = String(value.length);
    markVisualDirty();
  }

  /* ------------------------------------------------------------------------
     Catalog renderer
     ------------------------------------------------------------------------ */

  function catalogGroups() {
    const map = new Map();
    for (const item of state.catalog) {
      if (!map.has(item.series)) map.set(item.series, new Map());
      const models = map.get(item.series);
      if (!models.has(item.model)) models.set(item.model, []);
      models.get(item.model).push(item);
    }
    return Array.from(map.entries()).map(([series, modelMap]) => ({
      series,
      models: Array.from(modelMap.entries()).map(([model, items]) => ({ model, items })),
      rows: Array.from(modelMap.values()).reduce((total, items) => total + items.length, 0),
    }));
  }

  function catalogModelKey(series, model) {
    return `${series}|${model}`;
  }

  function catalogColorCodes() {
    const codes = Object.keys(state.site?.colors || {});
    for (const item of state.catalog) {
      for (const color of item.colors) {
        if (!codes.includes(color)) codes.push(color);
      }
    }
    return codes;
  }

  function catalogColorLabel(code) {
    return state.site?.colors?.[code] || code;
  }

  function defaultCatalogItem(series, model) {
    const codes = catalogColorCodes();
    return {
      uid: uid(),
      series,
      model,
      heightGroup: "1020/870",
      width: "800",
      depth: "350",
      colors: codes.slice(0, 2),
      flag: "",
    };
  }

  function uniqueCatalogName(base, exists) {
    if (!exists(base)) return base;
    let index = 2;
    while (exists(`${base} ${index}`)) index += 1;
    return `${base} ${index}`;
  }

  function computeCatalogErrors() {
    const errors = [];
    const keys = new Set();
    state.catalog.forEach((item, index) => {
      const summary = `${item.series || "未命名系列"} / ${item.model || "未命名门型"} / 第 ${index + 1} 行`;
      const addError = (field, message) => {
        keys.add(`${item.uid}:${field}`);
        errors.push({ uid: item.uid, field, message: `${summary}：${message}` });
      };
      if (!String(item.series || "").trim()) addError("series", "系列名称不能为空");
      if (String(item.series || "").includes("|")) addError("series", "系列名称不能包含竖线 |");
      if (!String(item.model || "").trim()) addError("model", "门型名称不能为空");
      if (String(item.model || "").includes("|")) addError("model", "门型名称不能包含竖线 |");
      if (!/^\d+(\/\d+)?$/.test(String(item.heightGroup || "").trim())) {
        addError("heightGroup", "站脚高度和落地高度应填写数字，例如 1020 / 870");
      }
      if (!Number.isFinite(Number(item.width)) || Number(item.width) <= 0) {
        addError("width", "宽度必须是正数");
      }
      if (!Number.isFinite(Number(item.depth)) || Number(item.depth) <= 0) {
        addError("depth", "深度必须是正数");
      }
      if (!Array.isArray(item.colors) || !item.colors.length) {
        addError("colors", "至少选择一种颜色");
      }
    });
    return { errors, keys };
  }

  function validateCatalogState() {
    const result = computeCatalogErrors();
    state.catalogErrors = result.keys;
    return result.errors;
  }

  function catalogFieldError(item, field) {
    return state.catalogErrors.has(`${item.uid}:${field}`);
  }

  function catalogHeightParts(item) {
    const parts = String(item.heightGroup || "")
      .split("/")
      .map((part) => part.trim());
    if (parts.length >= 2) return { stand: parts[0], floor: parts[1] };
    const only = parts[0] || "";
    if (!only) return { stand: "", floor: "" };
    return Number(only) <= 870 ? { stand: "", floor: only } : { stand: only, floor: "" };
  }

  function catalogRowMarkup(item) {
    const colors = catalogColorCodes();
    const colorButtons = colors
      .map(
        (code) =>
          `<button class="color-chip${item.colors.includes(code) ? " is-on" : ""}${catalogFieldError(item, "colors") ? " is-invalid" : ""}" type="button" data-catalog-color="${esc(code)}" data-uid="${esc(item.uid)}" aria-pressed="${item.colors.includes(code)}" title="${esc(catalogColorLabel(code))}">${esc(catalogColorLabel(code))}</button>`
      )
      .join("");
    const input = (field, label, type = "text") =>
      `<label class="spec-row__field field-shell">
        <span class="spec-label">${esc(label)}</span>
        <input class="spec-input${catalogFieldError(item, field) ? " is-invalid" : ""}" type="${type}" data-catalog-field="${field}" data-uid="${esc(item.uid)}" value="${esc(item[field])}" aria-label="${esc(label)}" ${type === "number" ? 'inputmode="decimal"' : ""}>
      </label>`;
    const heights = catalogHeightParts(item);
    const heightInput = (kind, label, value) =>
      `<label class="spec-row__field field-shell">
        <span class="spec-label">${esc(label)}</span>
        <input class="spec-input${catalogFieldError(item, "heightGroup") ? " is-invalid" : ""}" type="text" inputmode="numeric" data-catalog-height="${kind}" data-uid="${esc(item.uid)}" value="${esc(value)}" aria-label="${esc(label)}" autocomplete="off">
      </label>`;

    return `<div class="spec-row" data-uid="${esc(item.uid)}">
      ${heightInput("stand", "站脚高度", heights.stand)}
      ${heightInput("floor", "落地高度", heights.floor)}
      ${input("width", "宽度", "number")}
      ${input("depth", "深度", "number")}
      <div class="spec-row__field spec-row__field--colors">
        <span class="spec-label">颜色</span>
        <div class="color-chips" aria-label="颜色">${colorButtons}</div>
      </div>
      <div class="spec-row__field spec-row__field--flag">${input("flag", "备注")}</div>
      <div class="spec-row__actions">
        <button class="icon-btn" type="button" data-catalog-action="duplicate-row" data-uid="${esc(item.uid)}" title="复制这一行" aria-label="复制这一行">${ICONS.copy}</button>
        <button class="icon-btn is-danger" type="button" data-catalog-action="delete-row" data-uid="${esc(item.uid)}" title="删除这一行" aria-label="删除这一行">${ICONS.trash}</button>
      </div>
    </div>`;
  }

  function renderCatalogSection() {
    if (!state.site) return;
    ensureSeriesOpenState();
    const groups = catalogGroups();
    const colorCodes = catalogColorCodes();
    const errorsCount = state.catalogErrors.size;

    if (!groups.length) {
      ui.sectionContent.innerHTML = `${sectionIntro({
        eyebrow: "CATALOG",
        title: "还没有类目数据",
        description: "先添加系列与门型，保存后前台就可以开始选择。",
        chips: [`<span class="section-chip"><b>0</b> 条规格</span>`],
      })}
      <div class="catalog-toolbar">
        <button class="btn btn--primary btn--compact" type="button" data-catalog-action="add-series">添加系列</button>
      </div>
      <div class="catalog-empty">项目中还没有可用的系列数据。</div>`;
      updateChrome();
      return;
    }

    const cards = groups
      .map((group) => {
        const modelCards = group.models
          .map((model, modelIndex) => {
            const rowSearch = `${group.series} ${model.model} ${model.items
              .map((item) => `${item.heightGroup} ${item.width} ${item.depth} ${item.flag} ${item.colors.join(" ")}`)
              .join(" ")}`.toLowerCase();
            const modelKey = catalogModelKey(group.series, model.model);
            const isOpen = state.openModels.has(modelKey);
            const modelColors = new Set(model.items.flatMap((item) => item.colors)).size;
            return `<article class="model-block${isOpen ? "" : " is-collapsed"}" data-search="${esc(rowSearch)}" data-model-key="${esc(modelKey)}">
              <div class="model-head">
                <button class="catalog-model__toggle" type="button" data-catalog-action="toggle-model" aria-expanded="${isOpen}" title="${isOpen ? "收起尺寸" : "展开尺寸"}" aria-label="${isOpen ? "收起尺寸" : "展开尺寸"}">${ICONS.chevronRight}</button>
                <span class="model-index">${String(modelIndex + 1).padStart(2, "0")}</span>
                <label class="name-field name-field--model">
                  <span class="name-field__tag">门型</span>
                  <input class="inline-name inline-name--model" type="text" data-catalog-rename="model" data-old-model="${esc(model.model)}" value="${esc(model.model)}" aria-label="门型名称" autocomplete="off">
                </label>
                <span class="model-count">${model.items.length} 条尺寸 · ${modelColors} 种颜色</span>
                <span class="model-spacer"></span>
              </div>
              <div class="catalog-model__body" ${isOpen ? "" : "hidden"}>
                <div class="spec-table">
                  <div class="spec-table__head" aria-hidden="true">
                    <span>站脚高度</span><span>落地高度</span><span>宽度</span><span>深度</span><span>颜色</span><span>备注</span><span></span>
                  </div>
                  ${model.items.map(catalogRowMarkup).join("")}
                </div>
                <div class="model-footer">
                  <button class="add-size-cta" type="button" data-catalog-action="add-size">${ICONS.plus}添加一行尺寸</button>
                  <div class="model-footer__actions">
                    <button class="chip-button" type="button" data-catalog-action="duplicate-model">复制门型</button>
                    <button class="chip-button is-danger" type="button" data-catalog-action="delete-model">删除门型</button>
                  </div>
                </div>
              </div>
            </article>`;
          })
          .join("");

        const searchText = `${group.series} ${group.models
          .map(
            (model) =>
              `${model.model} ${model.items
                .map((item) => `${item.heightGroup} ${item.width} ${item.depth} ${item.flag}`)
                .join(" ")}`
          )
          .join(" ")}`.toLowerCase();
        const open = state.openSeries.has(group.series);

        return `<section class="catalog-series${open ? "" : " is-collapsed"}" data-series-card="${esc(group.series)}" data-search="${esc(searchText)}">
          <header class="catalog-series__head">
            <button class="catalog-series__toggle" type="button" data-catalog-action="toggle-series" title="展开或收起系列" aria-label="展开或收起系列">${ICONS.chevronRight}</button>
            <label class="name-field name-field--series">
              <span class="name-field__tag">系列</span>
              <input class="inline-name" type="text" data-catalog-rename="series" data-old-series="${esc(group.series)}" value="${esc(group.series)}" aria-label="系列名称" autocomplete="off">
            </label>
            <span class="catalog-series__stats">${group.models.length} 个门型 · ${group.rows} 条规格</span>
            <span class="catalog-series__spacer"></span>
            <div class="catalog-actions">
              <button class="chip-button" type="button" data-catalog-action="add-model">${ICONS.plus}门型</button>
              <button class="chip-button" type="button" data-catalog-action="duplicate-series">复制系列</button>
              <button class="chip-button is-danger" type="button" data-catalog-action="delete-series">删除系列</button>
            </div>
          </header>
          <div class="catalog-series__body" ${open ? "" : "hidden"}>${modelCards}</div>
        </section>`;
      })
      .join("");

    ui.sectionContent.innerHTML = `${sectionIntro({
      eyebrow: "CATALOG",
      title: "系列、门型与尺寸",
      description: "修改会先保存在编辑器中，点击顶部「保存并应用」后写入项目文件。系列与门型名称可直接在标题上编辑。",
      chips: [
        `<span class="section-chip"><b>${groups.length}</b> 个系列</span>`,
        `<span class="section-chip"><b>${state.catalog.length}</b> 条规格</span>`,
        `<span class="section-chip"><b>${colorCodes.length}</b> 种颜色</span>`,
        errorsCount ? `<span class="section-chip" style="color:var(--danger)"><b>${errorsCount}</b> 处待修复</span>` : "",
      ],
    })}
    <div class="catalog-toolbar">
      <label class="search-field">
        ${ICONS.search}
        <input id="catalogSearch" type="search" placeholder="搜索系列、门型、尺寸或备注…" value="${esc(state.catalogSearch)}" autocomplete="off">
      </label>
      <div class="toolbar-meta">
        <button class="chip-button" type="button" data-catalog-action="expand-all">展开全部</button>
        <button class="chip-button" type="button" data-catalog-action="collapse-all">收起全部</button>
        <button class="btn btn--primary btn--compact" type="button" data-catalog-action="add-series">${ICONS.plus}添加系列</button>
      </div>
    </div>
    <div class="catalog-summary">
      <span class="section-chip">系列 / 门型名称可直接改</span>
      <span class="section-chip">点门型左侧箭头展开尺寸</span>
      <span class="section-chip">颜色标签可多选</span>
      <span class="section-chip">保存时自动备份</span>
    </div>
    <div id="catalogGroups">${cards}</div>
    <div class="no-results" id="catalogNoResults">没有找到匹配的系列或门型。</div>`;
    applyCatalogSearch(state.catalogSearch);
    updateChrome();
  }

  function applyCatalogSearch(query) {
    state.catalogSearch = query;
    const normalized = query.trim().toLowerCase();
    let visible = 0;
    $$(".catalog-series", ui.sectionContent).forEach((card) => {
      const match = !normalized || (card.dataset.search || "").includes(normalized);
      card.hidden = !match;
      if (!match) return;
      visible += 1;
      const body = card.querySelector(".catalog-series__body");
      const seriesInput = card.querySelector('[data-catalog-rename="series"]');
      const seriesName = seriesInput?.value || card.dataset.seriesCard || "";
      if (normalized) {
        body.hidden = false;
        card.classList.remove("is-collapsed");
      } else {
        const open = state.openSeries.has(seriesName);
        body.hidden = !open;
        card.classList.toggle("is-collapsed", !open);
      }
      $$(".model-block", card).forEach((block) => {
        const modelBody = block.querySelector(".catalog-model__body");
        const toggle = block.querySelector(".catalog-model__toggle");
        const open = normalized ? true : state.openModels.has(block.dataset.modelKey);
        block.classList.toggle("is-collapsed", !open);
        toggle?.setAttribute("aria-expanded", String(open));
        if (modelBody) modelBody.hidden = !open;
      });
    });
    const noResults = $("#catalogNoResults", ui.sectionContent);
    if (noResults) noResults.style.display = visible ? "none" : "block";
  }

  function updateCatalogRename(target) {
    const kind = target.dataset.catalogRename;
    const next = target.value;
    if (kind === "series") {
      const previous = target.dataset.oldSeries;
      if (previous === next) return;
      state.catalog.forEach((item) => {
        if (item.series === previous) item.series = next;
      });
      if (state.openSeries.has(previous)) {
        state.openSeries.delete(previous);
        state.openSeries.add(next);
      }
      const modelKeys = [...state.openModels].filter((entry) => entry.startsWith(`${previous}|`));
      modelKeys.forEach((entry) => {
        state.openModels.delete(entry);
        state.openModels.add(`${next}|${entry.slice(previous.length + 1)}`);
      });
      target.dataset.oldSeries = next;
      const card = target.closest(".catalog-series");
      if (card) {
        card.dataset.seriesCard = next;
        $$(".model-block", card).forEach((block) => {
          if (block.dataset.modelKey?.startsWith(`${previous}|`)) {
            block.dataset.modelKey = `${next}|${block.dataset.modelKey.slice(previous.length + 1)}`;
          }
        });
      }
      markVisualDirty();
      return;
    }

    if (kind === "model") {
      const card = target.closest(".catalog-series");
      const series = card?.querySelector('[data-catalog-rename="series"]')?.value || "";
      const previous = target.dataset.oldModel;
      if (previous === next) return;
      state.catalog.forEach((item) => {
        if (item.series === series && item.model === previous) item.model = next;
      });
      const block = target.closest(".model-block");
      const previousKey = catalogModelKey(series, previous);
      const nextKey = catalogModelKey(series, next);
      if (state.openModels.delete(previousKey)) state.openModels.add(nextKey);
      if (block) block.dataset.modelKey = nextKey;
      target.dataset.oldModel = next;
      markVisualDirty();
    }
  }

  function updateCatalogField(target) {
    const item = state.catalog.find((entry) => entry.uid === target.dataset.uid);
    if (!item) return;
    const field = target.dataset.catalogField;
    item[field] = target.value;
    state.catalogErrors.delete(`${item.uid}:${field}`);
    target.classList.remove("is-invalid");
    markVisualDirty();
  }

  function updateCatalogHeight(target) {
    const row = target.closest(".spec-row");
    const item = state.catalog.find((entry) => entry.uid === target.dataset.uid);
    if (!row || !item) return;
    const stand = row.querySelector('[data-catalog-height="stand"]')?.value.trim() || "";
    const floor = row.querySelector('[data-catalog-height="floor"]')?.value.trim() || "";
    item.heightGroup = stand && floor ? `${stand}/${floor}` : stand || floor;
    state.catalogErrors.delete(`${item.uid}:heightGroup`);
    $$("[data-catalog-height]", row).forEach((input) => input.classList.remove("is-invalid"));
    markVisualDirty();
  }

  function toggleCatalogColor(button) {
    const item = state.catalog.find((entry) => entry.uid === button.dataset.uid);
    const color = button.dataset.catalogColor;
    if (!item || !color) return;
    if (item.colors.includes(color)) item.colors = item.colors.filter((entry) => entry !== color);
    else item.colors.push(color);
    const isOn = item.colors.includes(color);
    button.classList.toggle("is-on", isOn);
    button.setAttribute("aria-pressed", String(isOn));
    state.catalogErrors.delete(`${item.uid}:colors`);
    markVisualDirty();
  }

  function currentSeriesName(card) {
    return card?.querySelector('[data-catalog-rename="series"]')?.value || "";
  }

  function currentModelName(block) {
    return block?.querySelector('[data-catalog-rename="model"]')?.value || "";
  }

  async function handleCatalogAction(action, target) {
    if (action === "toggle-series") {
      if (state.catalogSearch.trim()) return;
      const card = target.closest(".catalog-series");
      if (!card) return;
      const name = currentSeriesName(card);
      const open = state.openSeries.has(name);
      if (open) state.openSeries.delete(name);
      else state.openSeries.add(name);
      card.classList.toggle("is-collapsed", open);
      const body = card.querySelector(".catalog-series__body");
      if (body) body.hidden = open;
      return;
    }

    if (action === "toggle-model") {
      const block = target.closest(".model-block");
      const key = block?.dataset.modelKey;
      if (!block || !key) return;
      const open = state.openModels.has(key);
      if (open) state.openModels.delete(key);
      else state.openModels.add(key);
      block.classList.toggle("is-collapsed", open);
      block.querySelector(".catalog-model__body").hidden = open;
      target.setAttribute("aria-expanded", String(!open));
      target.setAttribute("aria-label", open ? "展开尺寸" : "收起尺寸");
      return;
    }

    if (action === "expand-all" || action === "collapse-all") {
      state.openSeries.clear();
      state.openModels.clear();
      if (action === "expand-all") {
        catalogGroups().forEach((group) => {
          state.openSeries.add(group.series);
          group.models.forEach((model) => {
            state.openModels.add(catalogModelKey(group.series, model.model));
          });
        });
      }
      state.catalogErrors.clear();
      renderCatalogSection();
      updateChrome();
      return;
    }

    if (action === "add-series") {
      const name = await promptDialog({
        title: "添加系列",
        message: "系列添加后，会同时创建一条默认门型和尺寸，可继续编辑。",
        label: "系列名称",
        placeholder: "例如：常规系列",
        confirmText: "添加系列",
      });
      if (name == null) return;
      const series = name.trim();
      if (!series) {
        toast("系列名称不能为空", "error");
        return;
      }
      if (state.catalog.some((item) => item.series === series)) {
        toast("这个系列已经存在", "warning");
        return;
      }
      state.catalog.push(defaultCatalogItem(series, "新门型"));
      state.openSeries.add(series);
      state.openModels.add(catalogModelKey(series, "新门型"));
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
      return;
    }

    const seriesCard = target.closest(".catalog-series");
    const modelBlock = target.closest(".model-block");

    if (action === "add-model") {
      const series = currentSeriesName(seriesCard);
      if (!series.trim()) {
        toast("请先填写系列名称", "warning");
        return;
      }
      const name = await promptDialog({
        title: "添加门型",
        message: `系列：${series}`,
        label: "门型名称",
        placeholder: "例如：对开圆门",
        confirmText: "添加门型",
      });
      if (name == null) return;
      const model = name.trim();
      if (!model) {
        toast("门型名称不能为空", "error");
        return;
      }
      if (state.catalog.some((item) => item.series === series && item.model === model)) {
        toast("这个系列下已经有同名门型", "warning");
        return;
      }
      state.catalog.push(defaultCatalogItem(series, model));
      state.openSeries.add(series);
      state.openModels.add(catalogModelKey(series, model));
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
      return;
    }

    if (action === "add-size") {
      const series = currentSeriesName(seriesCard);
      const model = currentModelName(modelBlock);
      if (!series.trim() || !model.trim()) {
        toast("请先填写系列和门型名称", "warning");
        return;
      }
      state.catalog.push(defaultCatalogItem(series, model));
      state.openSeries.add(series);
      state.openModels.add(catalogModelKey(series, model));
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
      return;
    }

    if (action === "duplicate-row") {
      const id = target.dataset.uid;
      const index = state.catalog.findIndex((item) => item.uid === id);
      if (index === -1) return;
      const copy = { ...state.catalog[index], uid: uid(), colors: [...state.catalog[index].colors] };
      state.catalog.splice(index + 1, 0, copy);
      state.openSeries.add(copy.series);
      state.openModels.add(catalogModelKey(copy.series, copy.model));
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
      return;
    }

    if (action === "delete-row") {
      const id = target.dataset.uid;
      const item = state.catalog.find((entry) => entry.uid === id);
      if (!item) return;
      const siblings = state.catalog.filter(
        (entry) => entry.series === item.series && entry.model === item.model
      );
      if (siblings.length === 1) {
        const confirmed = await confirmDialog({
          title: "删除最后一个尺寸",
          message: `「${item.model}」只有这一条尺寸，删除后这个门型也会消失。`,
          confirmText: "删除",
          danger: true,
        });
        if (!confirmed) return;
      }
      state.catalog = state.catalog.filter((entry) => entry.uid !== id);
      const remaining = state.catalog.some(
        (entry) => entry.series === item.series && entry.model === item.model
      );
      if (!remaining) state.openModels.delete(catalogModelKey(item.series, item.model));
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
      return;
    }

    if (action === "delete-series") {
      const series = currentSeriesName(seriesCard);
      const confirmed = await confirmDialog({
        title: "删除系列",
        message: `确定删除「${series || "未命名系列"}」以及它下面的所有门型和尺寸吗？`,
        confirmText: "删除系列",
        danger: true,
      });
      if (!confirmed) return;
      state.catalog = state.catalog.filter((item) => item.series !== series);
      state.openSeries.delete(series);
      [...state.openModels].forEach((entry) => {
        if (entry.startsWith(`${series}|`)) state.openModels.delete(entry);
      });
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
      if (!state.catalog.length) toast("类目已清空，可继续添加新系列", "warning");
      return;
    }

    if (action === "duplicate-series") {
      const series = currentSeriesName(seriesCard);
      const existing = new Set(state.catalog.map((item) => item.series));
      const copyName = uniqueCatalogName(`${series} 副本`, (name) => existing.has(name));
      const source = state.catalog.filter((item) => item.series === series);
      const copies = source.map((item) => ({
        ...item,
        uid: uid(),
        series: copyName,
        colors: [...item.colors],
      }));
      state.catalog.push(...copies);
      state.openSeries.add(copyName);
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
      return;
    }

    if (action === "delete-model") {
      const series = currentSeriesName(seriesCard);
      const model = currentModelName(modelBlock);
      const confirmed = await confirmDialog({
        title: "删除门型",
        message: `确定删除「${series} / ${model}」及它的全部尺寸吗？`,
        confirmText: "删除门型",
        danger: true,
      });
      if (!confirmed) return;
      state.catalog = state.catalog.filter(
        (item) => !(item.series === series && item.model === model)
      );
      state.openModels.delete(catalogModelKey(series, model));
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
      return;
    }

    if (action === "duplicate-model") {
      const series = currentSeriesName(seriesCard);
      const model = currentModelName(modelBlock);
      const existing = new Set(
        state.catalog.filter((item) => item.series === series).map((item) => item.model)
      );
      const copyName = uniqueCatalogName(`${model} 副本`, (name) => existing.has(name));
      const source = state.catalog.filter(
        (item) => item.series === series && item.model === model
      );
      const copies = source.map((item) => ({
        ...item,
        uid: uid(),
        model: copyName,
        colors: [...item.colors],
      }));
      state.catalog.push(...copies);
      state.openSeries.add(series);
      state.openModels.add(catalogModelKey(series, copyName));
      state.catalogErrors.clear();
      markVisualDirty();
      renderCatalogSection();
    }
  }

  /* ------------------------------------------------------------------------
     Theme renderer
     ------------------------------------------------------------------------ */

  const ACCENT_SWATCHES = ["#0B6BFF", "#007AFF", "#5856D6", "#2DB37B", "#F07A3A", "#D94C86"];
  const BACKGROUND_OPTIONS = [
    { value: "aurora", label: "极光" },
    { value: "sand", label: "沙丘" },
    { value: "bloom", label: "花雾" },
    { value: "mono", label: "石墨" },
  ];
  const APPEARANCE_OPTIONS = [
    { value: "auto", label: "跟随系统" },
    { value: "light", label: "浅色" },
    { value: "dark", label: "深色" },
  ];

  function themeState() {
    return state.site?.theme || {};
  }

  function themeColorInput(label, fieldKey, value) {
    const normalized = normalizeHex(value, "#0b6bff");
    return `<div class="color-editor">
      <div class="color-input-shell">
        <input type="color" data-theme-field="theme.${fieldKey}" value="${esc(normalized)}" aria-label="${esc(label)}选色器">
        <input type="text" data-theme-hex="theme.${fieldKey}" value="${esc(String(value || normalized).toUpperCase())}" spellcheck="false" aria-label="${esc(label)}色值">
      </div>
      <span class="field__hint">支持直接粘贴 HEX 色值</span>
    </div>`;
  }

  function renderThemeSection() {
    const theme = themeState();
    const accent = normalizeHex(theme.accent, "#0b6bff");
    const accentAlt = normalizeHex(theme.accentAlt, "#7559ff");
    const blur = Number.isFinite(Number(theme.glass)) ? Number(theme.glass) : 28;
    const radius = Number.isFinite(Number(theme.radius)) ? Number(theme.radius) : 28;
    const background = theme.background || "aurora";
    const appearance = theme.appearance || "auto";
    const settings = state.site.settings || {};
    const swatches = ACCENT_SWATCHES.map(
      (color) =>
        `<button class="swatch${accent.toLowerCase() === color.toLowerCase() ? " is-active" : ""}" type="button" data-theme-action="accent" data-value="${color}" style="--swatch:${color}" title="${color}" aria-label="使用强调色 ${color}"></button>`
    ).join("");
    const backgrounds = BACKGROUND_OPTIONS.map(
      (option) =>
        `<button class="background-choice${background === option.value ? " is-active" : ""}" type="button" data-theme-action="background" data-value="${option.value}" data-background="${option.value}">
          <span class="background-choice__swatch" aria-hidden="true"></span>
          <span>${option.label}</span>
        </button>`
    ).join("");
    const appearances = APPEARANCE_OPTIONS.map(
      (option) =>
        `<button type="button" data-theme-action="appearance" data-value="${option.value}" class="${appearance === option.value ? "is-active" : ""}">${option.label}</button>`
    ).join("");

    ui.sectionContent.innerHTML = `${sectionIntro({
      eyebrow: "APPEARANCE",
      title: "材质、色彩与氛围",
      description: "强调色会用在按钮、进度和选中状态。玻璃材质与背景会影响整个前台，保存后自动刷新预览。",
      chips: [
        `<span class="section-chip">强调色 <b>${esc(accent.toUpperCase())}</b></span>`,
        `<span class="section-chip">圆角 <b>${radius}px</b></span>`,
      ],
    })}
    <div class="theme-layout">
      <div class="theme-main">
        <section class="edit-card theme-block">
          <div class="theme-block__head">
            <div><h3>强调色彩</h3><p>系统组件、选中状态与主要操作按钮的色彩基调。</p></div>
          </div>
          ${themeColorInput("强调色", "accent", theme.accent)}
          <div class="swatch-row" style="margin-top:11px">${swatches}</div>
          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--hairline)">
            <div class="field__label" style="margin-bottom:8px"><span>渐变辅助色</span></div>
            ${themeColorInput("辅助色", "accentAlt", theme.accentAlt)}
          </div>
        </section>

        <section class="edit-card theme-block">
          <div class="theme-block__head">
            <div><h3>背景氛围</h3><p>选用一种柔和的环境光，让玻璃层更有层次。</p></div>
          </div>
          <div class="background-choices">${backgrounds}</div>
          <div class="theme-block__head" style="margin-top:17px;margin-bottom:9px">
            <div><h3>默认外观</h3><p>访客仍可通过右上角按钮切换。</p></div>
          </div>
          <div class="appearance-control">${appearances}</div>
        </section>

        <section class="edit-card theme-block">
          <div class="theme-block__head">
            <div><h3>玻璃材质</h3><p>更低的模糊更清晰，更高的模糊更柔和。</p></div>
          </div>
          <div class="range-row">
            <label for="glassRange">玻璃模糊</label>
            <input id="glassRange" type="range" min="0" max="44" step="1" value="${blur}" data-theme-field="theme.glass">
            <output data-range-output="theme.glass">${blur}px</output>
          </div>
          <div class="range-row">
            <label for="radiusRange">圆角大小</label>
            <input id="radiusRange" type="range" min="10" max="42" step="1" value="${radius}" data-theme-field="theme.radius">
            <output data-range-output="theme.radius">${radius}px</output>
          </div>
          <label class="switch switch--field" style="margin-top:9px">
            <span class="switch__copy"><strong>过渡与动效</strong><small>页面切换、按钮与浮层动画</small></span>
            <input type="checkbox" data-theme-field="theme.motion" ${theme.motion === false ? "" : "checked"}>
            <span class="switch__track" aria-hidden="true"></span>
          </label>
        </section>

        <section class="edit-card theme-block">
          <div class="theme-block__head">
            <div><h3>前台模块</h3><p>控制公共界面中可见的组件与操作。</p></div>
          </div>
          <div class="settings-list">
            <label class="switch switch--field">
              <span class="switch__copy"><strong>公告横幅</strong><small>在首页顶部展示最新公告</small></span>
              <input type="checkbox" data-theme-field="settings.announcementBanner" ${settings.announcementBanner === false ? "" : "checked"}>
              <span class="switch__track" aria-hidden="true"></span>
            </label>
            <label class="switch switch--field">
              <span class="switch__copy"><strong>首页数据指标</strong><small>展示规格行、系列与已选维度</small></span>
              <input type="checkbox" data-theme-field="settings.showHeroMetrics" ${settings.showHeroMetrics === false ? "" : "checked"}>
              <span class="switch__track" aria-hidden="true"></span>
            </label>
            <label class="switch switch--field">
              <span class="switch__copy"><strong>页脚</strong><small>展示页脚说明与版权</small></span>
              <input type="checkbox" data-theme-field="settings.showFooter" ${settings.showFooter === false ? "" : "checked"}>
              <span class="switch__track" aria-hidden="true"></span>
            </label>
            <label class="switch switch--field">
              <span class="switch__copy"><strong>访客切换主题</strong><small>允许访客在浅色与深色之间切换</small></span>
              <input type="checkbox" data-theme-field="settings.allowThemeToggle" ${settings.allowThemeToggle === false ? "" : "checked"}>
              <span class="switch__track" aria-hidden="true"></span>
            </label>
          </div>
        </section>
      </div>

      <aside class="theme-aside">
        <div class="material-preview" id="materialPreview" style="--preview-accent:${esc(accent)};--preview-blur:${blur}px;--preview-radius:${Math.max(8, Math.round(radius / 2.6))}px">
          <div class="material-preview__bar">
            <span class="material-preview__mark" aria-hidden="true"></span>
            <span>Live material</span>
            <span>预览</span>
          </div>
          <div class="material-preview__card">
            <div class="material-preview__eyebrow">MATERIAL / ${esc(appearance.toUpperCase())}</div>
            <div class="material-preview__title">让界面安静地呈现内容。</div>
            <div class="material-preview__lines"><span></span><span></span><span></span></div>
            <div class="material-preview__button">继续选择</div>
            <div class="material-preview__caption">${blur}px blur · ${radius}px radius · ${esc(accent.toUpperCase())}</div>
          </div>
        </div>
        <div class="edit-card theme-block">
          <div class="theme-block__head" style="margin-bottom:0">
            <div><h3>设计提示</h3><p>前景玻璃与背景之间保留足够对比，强调色不宜过亮。深色模式会自动继承同一套色彩关系。</p></div>
          </div>
        </div>
      </aside>
    </div>`;
    updateChrome();
  }

  function updateMaterialPreview() {
    const preview = $("#materialPreview", ui.sectionContent);
    if (!preview) return;
    const theme = themeState();
    preview.style.setProperty("--preview-accent", normalizeHex(theme.accent, "#0b6bff"));
    preview.style.setProperty(
      "--preview-blur",
      `${Number.isFinite(Number(theme.glass)) ? Number(theme.glass) : 28}px`
    );
    preview.style.setProperty(
      "--preview-radius",
      `${Math.max(8, Math.round((Number(theme.radius) || 28) / 2.6))}px`
    );
    const caption = $(".material-preview__caption", preview);
    if (caption) {
      caption.textContent = `${theme.glass ?? 28}px blur · ${theme.radius ?? 28}px radius · ${normalizeHex(theme.accent, "#0b6bff").toUpperCase()}`;
    }
  }

  function syncThemeColorControls() {
    const theme = themeState();
    for (const field of ["accent", "accentAlt"]) {
      const normalized = normalizeHex(theme[field], field === "accent" ? "#0b6bff" : "#7559ff");
      const colorInput = $(`[data-theme-field="theme.${field}"]`, ui.sectionContent);
      const textInput = $(`[data-theme-hex="theme.${field}"]`, ui.sectionContent);
      if (colorInput) colorInput.value = normalized;
      if (textInput && document.activeElement !== textInput) textInput.value = normalized.toUpperCase();
    }
    const accent = normalizeHex(theme.accent, "#0b6bff");
    $$(".swatch", ui.sectionContent).forEach((swatch) => {
      swatch.classList.toggle("is-active", swatch.dataset.value.toLowerCase() === accent.toLowerCase());
    });
  }

  function handleThemeAction(action, target) {
    const value = target.dataset.value;
    if (action === "accent") {
      state.site.theme.accent = value;
      const picker = $('[data-theme-field="theme.accent"]', ui.sectionContent);
      const text = $('[data-theme-hex="theme.accent"]', ui.sectionContent);
      if (picker) picker.value = value;
      if (text) text.value = value.toUpperCase();
      syncThemeColorControls();
      markVisualDirty();
      updateMaterialPreview();
      return;
    }
    if (action === "background") {
      state.site.theme.background = value;
      $$("[data-theme-action=\"background\"]", ui.sectionContent).forEach((button) => {
        button.classList.toggle("is-active", button.dataset.value === value);
      });
      markVisualDirty();
      return;
    }
    if (action === "appearance") {
      state.site.theme.appearance = value;
      $$("[data-theme-action=\"appearance\"]", ui.sectionContent).forEach((button) => {
        button.classList.toggle("is-active", button.dataset.value === value);
      });
      markVisualDirty();
    }
  }

  function updateThemeField(target) {
    const path = target.dataset.themeField;
    if (!path) return;
    let value;
    if (target.type === "checkbox") value = target.checked;
    else if (target.type === "range") value = Number(target.value);
    else if (target.type === "color") value = normalizeHex(target.value, "#0b6bff");
    else value = target.value;
    setAtPath(state.site, path, value);
    markVisualDirty();
    if (target.type === "range") {
      const output = $(`[data-range-output="${path}"]`, ui.sectionContent);
      if (output) output.textContent = `${value}px`;
    }
    if (target.type === "color") {
      const field = path.split(".").pop();
      const textInput = $(`[data-theme-hex="theme.${field}"]`, ui.sectionContent);
      if (textInput) textInput.value = value.toUpperCase();
      syncThemeColorControls();
    }
    updateMaterialPreview();
  }

  function updateThemeHex(target) {
    const path = target.dataset.themeHex;
    if (!path) return;
    const raw = target.value.trim();
    if (!isHex(raw)) {
      target.classList.add("is-invalid");
      return;
    }
    target.classList.remove("is-invalid");
    const normalized = normalizeHex(raw, "#0b6bff").toUpperCase();
    setAtPath(state.site, path, normalized);
    const field = path.split(".").pop();
    const colorInput = $(`[data-theme-field="theme.${field}"]`, ui.sectionContent);
    if (colorInput) colorInput.value = normalized;
    const accent = normalizeHex(themeState().accent, "#0b6bff");
    $$(".swatch", ui.sectionContent).forEach((swatch) => {
      swatch.classList.toggle("is-active", swatch.dataset.value.toLowerCase() === accent.toLowerCase());
    });
    markVisualDirty();
    updateMaterialPreview();
  }

  function normalizeThemeHexOnBlur(target) {
    const path = target.dataset.themeHex;
    if (!path) return;
    if (isHex(target.value)) {
      target.value = normalizeHex(target.value, "#0b6bff").toUpperCase();
      return;
    }
    const current = getAtPath(state.site, path);
    target.value = normalizeHex(current, "#0b6bff").toUpperCase();
    target.classList.remove("is-invalid");
    toast("HEX 色值格式不正确，已恢复为有效值", "warning");
  }

  /* ------------------------------------------------------------------------
     Announcement editor
     ------------------------------------------------------------------------ */

  function defaultAnnouncementDraft() {
    return {
      title: "",
      body: "",
      badge: state.site?.announcement?.badge || "公告",
      tone: "info",
      active: true,
      pinned: false,
      dismissible: true,
      publishedAt: toLocalDateTime(new Date().toISOString()).slice(0, 16),
      expiresAt: "",
      linkText: "",
      linkHref: "",
    };
  }

  function announcementToDraft(announcement) {
    return {
      title: announcement.title || "",
      body: announcement.body || "",
      badge: announcement.badge || state.site?.announcement?.badge || "公告",
      tone: announcement.tone || "info",
      active: announcement.active !== false,
      pinned: Boolean(announcement.pinned),
      dismissible: announcement.dismissible !== false,
      publishedAt: toLocalDateTime(announcement.publishedAt) || "",
      expiresAt: toLocalDateTime(announcement.expiresAt) || "",
      linkText: announcement.linkText || "",
      linkHref: announcement.linkHref || "",
    };
  }

  function ensureAnnouncementDraft() {
    if (!state.announcementDraft) state.announcementDraft = defaultAnnouncementDraft();
    if (state.announcementEditingId) {
      const source = (state.site?.announcements || []).find(
        (announcement) => announcement.id === state.announcementEditingId
      );
      if (!source) {
        state.announcementEditingId = null;
        state.announcementDraft = defaultAnnouncementDraft();
      }
    }
    state.announcementTone = state.announcementDraft.tone || "info";
  }

  function resetAnnouncementDraftFromSource() {
    if (state.announcementEditingId) {
      const source = (state.site?.announcements || []).find(
        (announcement) => announcement.id === state.announcementEditingId
      );
      state.announcementDraft = source ? announcementToDraft(source) : defaultAnnouncementDraft();
      if (!source) state.announcementEditingId = null;
    } else {
      state.announcementDraft = defaultAnnouncementDraft();
    }
    state.announcementTone = state.announcementDraft.tone || "info";
    state.announcementFormDirty = false;
    updateChrome();
  }

  function announcementStatus(announcement) {
    if (announcement.active === false) return { label: "已下线", className: "is-inactive" };
    const now = Date.now();
    const published = announcement.publishedAt ? new Date(announcement.publishedAt).getTime() : NaN;
    if (Number.isFinite(published) && published > now) {
      return { label: "待发布", className: "is-scheduled" };
    }
    const expires = announcement.expiresAt ? new Date(announcement.expiresAt).getTime() : NaN;
    if (Number.isFinite(expires) && expires < now) {
      return { label: "已过期", className: "is-expired" };
    }
    return { label: "展示中", className: "" };
  }

  function toneLabel(tone) {
    return { info: "提示", success: "更新", warning: "注意", important: "重要" }[tone] || "提示";
  }

  function renderAnnouncementSection() {
    ensureAnnouncementDraft();
    const draft = state.announcementDraft;
    const editing = state.announcementEditingId;
    const announcements = [...(state.site?.announcements || [])].sort((a, b) => {
      const pinned = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
      if (pinned) return pinned;
      return (
        (new Date(b.publishedAt || 0).getTime() || 0) -
        (new Date(a.publishedAt || 0).getTime() || 0)
      );
    });
    const tones = ["info", "success", "warning", "important"];
    const toneButtons = tones
      .map(
        (tone) =>
          `<button class="tone-option${state.announcementTone === tone ? " is-active" : ""}" type="button" data-ann-tone="${tone}">${toneLabel(tone)}</button>`
      )
      .join("");
    const list = announcements.length
      ? announcements
          .map((announcement) => {
            const status = announcementStatus(announcement);
            return `<article class="announcement-editor-item${editing === announcement.id ? " is-editing" : ""}">
              <div class="announcement-editor-item__meta">
                <span class="status-pill ${status.className}">${status.label}</span>
                <span class="status-pill status-pill--tone-${esc(announcement.tone || "info")}">${esc(announcement.badge || state.site.announcement?.badge || "")}</span>
                ${announcement.pinned ? `<span>置顶</span>` : ""}
                ${announcement.publishedAt ? `<span>${esc(formatEditorDate(announcement.publishedAt))}</span>` : ""}
              </div>
              <h4>${esc(announcement.title || "未命名公告")}</h4>
              ${announcement.body ? `<p>${esc(announcement.body)}</p>` : ""}
              <div class="announcement-editor-item__actions">
                <button class="chip-button" type="button" data-ann-action="edit" data-id="${esc(announcement.id)}">编辑</button>
                <button class="chip-button" type="button" data-ann-action="toggle" data-id="${esc(announcement.id)}">${announcement.active === false ? "上线" : "下线"}</button>
                <button class="chip-button is-danger" type="button" data-ann-action="delete" data-id="${esc(announcement.id)}">删除</button>
              </div>
            </article>`;
          })
          .join("")
      : `<div class="announcement-empty">还没有公告，右侧表单会在保存后生成第一条公告。</div>`;

    const saveLabel = draft.active
      ? editing
        ? "保存并更新"
        : "发布公告"
      : "保存为草稿";

    ui.sectionContent.innerHTML = `${sectionIntro({
      eyebrow: "ANNOUNCEMENTS",
      title: "发布一条清晰的公告",
      description: "公告会出现在前台顶部和公告中心。保存后会写入 js/site-config.js；线上站点在重新部署后更新。",
      chips: [
        `<span class="section-chip"><b>${activeAnnouncementCount()}</b> 条在线</span>`,
        `<span class="section-chip">${editing ? "正在编辑" : "新建公告"}</span>`,
      ],
    })}
    <div class="announcement-layout">
      <section class="edit-card announcement-form">
        <form id="announcementForm" novalidate>
          <div class="form-head">
            <div>
              <h3>${editing ? "编辑公告" : "新建公告"}</h3>
              <p>${editing ? "修改后将同步更新前台。" : "填写内容后点击发布，公告立即生效。"}</p>
            </div>
            <button class="chip-button" type="button" data-ann-action="new">新建</button>
          </div>
          <div class="field-grid">
            <label class="field field--wide">
              <span class="field__label"><span>公告标题</span><span class="field__path">title</span></span>
              <input type="text" name="title" value="${esc(draft.title)}" placeholder="例如：全新工作台上线" maxlength="120">
            </label>
            <label class="field">
              <span class="field__label"><span>徽标文字</span><span class="field__path">badge</span></span>
              <input type="text" name="badge" value="${esc(draft.badge)}" placeholder="更新">
            </label>
            <div class="field">
              <span class="field__label"><span>公告类型</span><span class="field__path">tone</span></span>
              <div class="tone-field" id="toneField">${toneButtons}</div>
            </div>
            <label class="field field--wide">
              <span class="field__label"><span>公告正文</span><span class="field__path">body</span></span>
              <textarea name="body" placeholder="可以换行，前台会保留段落。" rows="5">${esc(draft.body)}</textarea>
            </label>
            <label class="field">
              <span class="field__label"><span>发布时间</span><span class="field__path">publishedAt</span></span>
              <input type="datetime-local" name="publishedAt" value="${esc(draft.publishedAt)}">
            </label>
            <label class="field">
              <span class="field__label"><span>失效时间</span><span class="field__path">expiresAt</span></span>
              <input type="datetime-local" name="expiresAt" value="${esc(draft.expiresAt)}">
            </label>
            <label class="field">
              <span class="field__label"><span>链接文字</span><span class="field__path">linkText</span></span>
              <input type="text" name="linkText" value="${esc(draft.linkText)}" placeholder="选填，例如：查看详情">
            </label>
            <label class="field">
              <span class="field__label"><span>链接地址</span><span class="field__path">linkHref</span></span>
              <input type="text" name="linkHref" value="${esc(draft.linkHref)}" placeholder="https://…" inputmode="url">
            </label>
          </div>
          <div class="toggle-grid">
            <label class="switch switch--field">
              <span class="switch__copy"><strong>上线展示</strong><small>取消后仅保存，不在前台展示</small></span>
              <input type="checkbox" name="active" ${draft.active ? "checked" : ""}>
              <span class="switch__track" aria-hidden="true"></span>
            </label>
            <label class="switch switch--field">
              <span class="switch__copy"><strong>置顶</strong><small>优先展示在公告中心顶部</small></span>
              <input type="checkbox" name="pinned" ${draft.pinned ? "checked" : ""}>
              <span class="switch__track" aria-hidden="true"></span>
            </label>
            <label class="switch switch--field">
              <span class="switch__copy"><strong>允许关闭</strong><small>访客可以收起顶部公告横幅</small></span>
              <input type="checkbox" name="dismissible" ${draft.dismissible ? "checked" : ""}>
              <span class="switch__track" aria-hidden="true"></span>
            </label>
          </div>
          <div class="form-actions">
            <span class="publish-note">${ICONS.info}<span>发布后写入项目文件；线上站点需要提交代码并重新部署。</span></span>
            <span class="form-actions__spacer"></span>
            <button class="btn btn--primary btn--compact" type="button" data-ann-action="save">${saveLabel}</button>
          </div>
        </form>
      </section>

      <section class="edit-card announcement-list-panel">
        <div class="announcement-list-panel__head">
          <strong>全部公告</strong>
          <span>${announcements.length} 条</span>
        </div>
        <div class="announcement-editor-list">${list}</div>
        <div class="publish-note" style="margin-top:10px">${ICONS.info}<span>公告保存在站点配置中，和页面一起部署。上线 / 下线操作会立即保存当前所有未保存的可视化修改。</span></div>
      </section>
    </div>`;
    updateChrome();
  }

  function captureAnnouncementForm() {
    const form = $("#announcementForm", ui.sectionContent);
    if (!form) return null;
    const get = (name) => form.elements.namedItem(name);
    const draft = {
      title: get("title")?.value || "",
      body: get("body")?.value || "",
      badge: get("badge")?.value || "",
      tone: state.announcementTone || "info",
      active: Boolean(get("active")?.checked),
      pinned: Boolean(get("pinned")?.checked),
      dismissible: Boolean(get("dismissible")?.checked),
      publishedAt: get("publishedAt")?.value || "",
      expiresAt: get("expiresAt")?.value || "",
      linkText: get("linkText")?.value || "",
      linkHref: get("linkHref")?.value || "",
    };
    state.announcementDraft = draft;
    const saveButton = form.querySelector('[data-ann-action="save"]');
    if (saveButton) {
      saveButton.textContent = draft.active
        ? state.announcementEditingId
          ? "保存并更新"
          : "发布公告"
        : "保存为草稿";
    }
    return draft;
  }

  async function startNewAnnouncement() {
    if (state.announcementFormDirty) {
      const discard = await confirmDialog({
        title: "放弃当前公告编辑",
        message: "当前公告表单还有未保存的内容，新建公告会丢弃这些内容。",
        confirmText: "放弃并新建",
        danger: true,
      });
      if (!discard) return;
    }
    state.announcementEditingId = null;
    state.announcementDraft = defaultAnnouncementDraft();
    state.announcementTone = "info";
    state.announcementFormDirty = false;
    renderAnnouncementSection();
    updateChrome();
    window.requestAnimationFrame(() => {
      $("#announcementForm input[name='title']", ui.sectionContent)?.focus();
    });
  }

  function startEditingAnnouncement(id) {
    if (state.announcementFormDirty) {
      toast("请先发布或放弃当前公告编辑", "warning");
      return;
    }
    const announcement = (state.site.announcements || []).find((item) => item.id === id);
    if (!announcement) return;
    state.announcementEditingId = id;
    state.announcementDraft = announcementToDraft(announcement);
    state.announcementTone = state.announcementDraft.tone;
    state.announcementFormDirty = false;
    renderAnnouncementSection();
    updateChrome();
  }

  async function publishAnnouncementFromForm() {
    const draft = captureAnnouncementForm();
    if (!draft) return false;
    if (!draft.title.trim()) {
      toast("请填写公告标题", "error");
      $("#announcementForm input[name='title']", ui.sectionContent)?.focus();
      return false;
    }
    if (draft.linkHref.trim() && !safeHref(draft.linkHref)) {
      toast("公告链接必须是有效的 http(s) 地址", "error");
      return false;
    }
    const publishedAt = draft.publishedAt ? toIsoDateTime(draft.publishedAt) : new Date().toISOString();
    const expiresAt = draft.expiresAt ? toIsoDateTime(draft.expiresAt) : "";
    if (!publishedAt) {
      toast("发布时间格式无效", "error");
      return false;
    }
    if (expiresAt && new Date(expiresAt).getTime() <= new Date(publishedAt).getTime()) {
      toast("失效时间必须晚于发布时间", "error");
      return false;
    }

    const existing = state.announcementEditingId
      ? state.site.announcements.find((item) => item.id === state.announcementEditingId)
      : null;
    const announcement = {
      ...(existing || {}),
      id: existing?.id || uid(),
      title: draft.title.trim(),
      body: draft.body.trim(),
      badge: draft.badge.trim() || state.site?.announcement?.badge || "公告",
      tone: draft.tone,
      pinned: draft.pinned,
      active: draft.active,
      dismissible: draft.dismissible,
      publishedAt,
      expiresAt,
      linkText: draft.linkText.trim(),
      linkHref: draft.linkHref.trim(),
    };

    if (existing) Object.assign(existing, announcement);
    else state.site.announcements.unshift(announcement);

    state.announcementEditingId = announcement.id;
    state.announcementDraft = announcementToDraft(announcement);
    state.announcementTone = announcement.tone;
    markVisualDirty();
    const saved = await saveVisual({ reason: "announcement", silent: true });
    if (!saved) {
      toast(publishedAt && expiresAt ? "公告内容已保留，但保存失败" : "公告保存失败，请检查其他字段", "error");
      return false;
    }

    state.announcementFormDirty = false;
    renderAnnouncementSection();
    updateNavMeta();
    updateChrome();
    toast(
      announcement.active
        ? existing
          ? "公告已更新并同步到预览"
          : "公告已发布并同步到预览"
        : "公告已保存为草稿",
      "success"
    );
    return true;
  }

  async function handleAnnouncementAction(action, target) {
    if (action === "save") {
      await publishAnnouncementFromForm();
      return;
    }
    if (action === "new") {
      await startNewAnnouncement();
      return;
    }
    const id = target.dataset.id;
    if (!id) return;

    if (action === "edit") {
      startEditingAnnouncement(id);
      return;
    }

    if (state.announcementFormDirty) {
      toast("请先发布或放弃当前公告编辑", "warning");
      return;
    }

    const announcement = state.site.announcements.find((item) => item.id === id);
    if (!announcement) return;

    if (action === "toggle") {
      const previous = announcement.active;
      announcement.active = announcement.active === false;
      markVisualDirty();
      const saved = await saveVisual({ reason: "announcement", silent: true });
      if (saved) {
        renderAnnouncementSection();
        updateNavMeta();
        toast(announcement.active ? "公告已上线" : "公告已下线");
      } else {
        announcement.active = previous;
        updateChrome();
        toast("公告状态更新失败", "error");
      }
      return;
    }

    if (action === "delete") {
      const confirmed = await confirmDialog({
        title: "删除公告",
        message: `确定删除「${announcement.title || "未命名公告"}」吗？此操作会立即写入项目文件。`,
        confirmText: "删除公告",
        danger: true,
      });
      if (!confirmed) return;
      const index = state.site.announcements.findIndex((item) => item.id === id);
      if (index < 0) return;
      const [removed] = state.site.announcements.splice(index, 1);
      if (state.announcementEditingId === id) {
        state.announcementEditingId = null;
        state.announcementDraft = defaultAnnouncementDraft();
        state.announcementFormDirty = false;
      }
      markVisualDirty();
      const saved = await saveVisual({ reason: "announcement", silent: true });
      if (saved) {
        renderAnnouncementSection();
        updateNavMeta();
        toast("公告已删除");
      } else {
        state.site.announcements.splice(index, 0, removed);
        updateChrome();
        toast("删除失败，公告已恢复", "error");
      }
    }
  }

  /* ------------------------------------------------------------------------
     Announcement editor
     ------------------------------------------------------------------------ */

  // Continued below.

  /* ------------------------------------------------------------------------
     Source editor
     ------------------------------------------------------------------------ */

  function fileLanguageLabel(language) {
    return {
      html: "HTML",
      css: "CSS",
      javascript: "JavaScript",
      json: "JSON",
    }[language] || String(language || "text").toUpperCase();
  }

  function formatFileSize(size) {
    const bytes = Number(size) || 0;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  function fileMetadata(path) {
    return state.files.find((file) => file.path === path);
  }

  function renderCodeSection() {
    if (!state.loaded) return;
    const files = state.files.length
      ? state.files
      : [
          { path: "index.html", label: "index.html", language: "html", size: 0 },
          { path: "css/app.css", label: "app.css", language: "css", size: 0 },
          { path: "js/app.js", label: "app.js", language: "javascript", size: 0 },
        ];
    const activeMeta = fileMetadata(state.activeFile);
    const language = activeMeta?.language || state.fileLanguage || "html";
    const fileList = files
      .map((file) => {
        const extension = file.path.split(".").pop().slice(0, 3);
        const active = file.path === state.activeFile;
        return `<button class="file-button${active ? " is-active" : ""}" type="button" data-file-path="${esc(file.path)}">
          <span class="file-button__icon" aria-hidden="true">${esc(extension)}</span>
          <span class="file-button__meta">
            <span>${esc(file.label || file.path)}</span>
            <span>${esc(file.path)}</span>
          </span>
          ${active && state.codeDirty ? '<span class="file-button__dirty" aria-label="未保存"></span>' : ""}
        </button>`;
      })
      .join("");

    const loadError = state.codeLoadError
      ? `<div class="code-loading" style="color:var(--danger)">${esc(state.codeLoadError)}</div>`
      : "";

    const editorBody =
      state.codeLoading || !state.codeLoaded
        ? state.codeLoading
          ? `<div class="code-loading"><span class="loading-dot"></span>正在读取 ${esc(state.activeFile)}…</div>`
          : loadError || `<div class="code-loading">请选择一个文件开始编辑</div>`
        : `<div class="code-editor" id="codeEditor">
            <pre class="code-line-numbers" id="codeLineNumbers" aria-hidden="true"></pre>
            <div class="code-stage">
              <pre class="code-highlight" id="codeHighlight" aria-hidden="true"></pre>
              <textarea class="code-input" id="codeArea" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="源代码编辑器"></textarea>
            </div>
          </div>`;

    ui.sectionContent.innerHTML = `<div class="code-layout">
      <aside class="file-panel">
        <div class="file-panel__head">
          <strong>源文件</strong>
          <span>保存时自动备份，支持语法高亮</span>
        </div>
        <div class="file-list">${fileList}</div>
        <p class="file-panel__note">仅开放前台站点文件。类目与文案也可以通过可视化界面修改。</p>
      </aside>
      <section class="code-card">
        <div class="code-toolbar">
          <div class="code-fileinfo${state.codeDirty ? " is-dirty" : ""}">
            <span class="code-fileinfo__dot" id="codeFileInfoDot" aria-hidden="true"></span>
            <span class="code-fileinfo__name" id="codeFileName">${esc(state.activeFile)}</span>
            <span class="code-fileinfo__meta" id="codeFileMeta">${esc(fileLanguageLabel(language))}${activeMeta?.size ? ` · ${formatFileSize(activeMeta.size)}` : ""}</span>
          </div>
          <div class="code-toolbar__actions">
            <button class="code-tool" type="button" data-code-action="reload" ${state.codeLoading ? "disabled" : ""}>
              ${ICONS.refresh}<span>重新载入</span>
            </button>
            <button class="code-tool" type="button" data-code-action="save" ${state.codeLoaded && !state.codeLoading ? "" : "disabled"}>
              ${ICONS.save}<span>保存源码</span>
            </button>
          </div>
        </div>
        ${editorBody}
        <div class="code-status">
          <span id="codeCursor">1:1</span>
          <span class="code-status__right">
            <span id="codeLanguage">${esc(fileLanguageLabel(language))}</span>
            <span id="codeLength">0 字符</span>
            <span>UTF-8</span>
          </span>
        </div>
      </section>
    </div>`;

    if (state.codeLoaded && !state.codeLoading) hydrateCodeEditor();
    updateChrome();
  }

  function hydrateCodeEditor() {
    const textarea = $("#codeArea", ui.sectionContent);
    if (!textarea) return;
    textarea.value = state.fileContent;
    updateCodeHighlight({ preserveScroll: false });
    const highlight = $("#codeHighlight", ui.sectionContent);
    const numbers = $("#codeLineNumbers", ui.sectionContent);
    const sync = () => {
      if (highlight) {
        highlight.scrollTop = textarea.scrollTop;
        highlight.scrollLeft = textarea.scrollLeft;
      }
      if (numbers) numbers.scrollTop = textarea.scrollTop;
    };
    textarea.addEventListener("scroll", sync, { passive: true });
    textarea.addEventListener("click", updateCodeCursor);
    textarea.addEventListener("keyup", updateCodeCursor);
    textarea.addEventListener("select", updateCodeCursor);
    window.requestAnimationFrame(() => updateCodeCursor());
  }

  function classifyToken(token, language, source, offset) {
    if (token.startsWith("//") || token.startsWith("/*") || token.startsWith("<!--")) return "comment";
    if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
      if (language === "json" && /^\s*:/.test(source.slice(offset + token.length))) return "key";
      return "string";
    }
    if (language === "html") {
      if (token.startsWith("<")) return "tag";
      if (/^\s*=/.test(source.slice(offset + token.length))) return "attr";
    }
    if (language === "css") {
      if (token.startsWith("@")) return "keyword";
      if (/^\s*:/.test(source.slice(offset + token.length))) return "selector";
      if (token.startsWith("#")) return "number";
    }
    if (/^-?\d/.test(token)) return "number";
    if (
      [
        "const",
        "let",
        "var",
        "function",
        "return",
        "if",
        "else",
        "for",
        "while",
        "of",
        "in",
        "new",
        "class",
        "extends",
        "import",
        "export",
        "from",
        "async",
        "await",
        "try",
        "catch",
        "finally",
        "throw",
        "typeof",
        "instanceof",
        "switch",
        "case",
        "break",
        "continue",
        "default",
        "delete",
        "void",
        "yield",
        "this",
        "super",
        "null",
        "undefined",
        "true",
        "false",
      ].includes(token)
    ) {
      return "keyword";
    }
    return "";
  }

  function highlightSyntax(source, language) {
    const patterns = {
      javascript:
        /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|of|in|new|class|extends|import|export|from|async|await|try|catch|finally|throw|typeof|instanceof|switch|case|break|continue|default|delete|void|yield|this|super|null|undefined|true|false)\b|\b\d+(?:\.\d+)?\b/g,
      css:
        /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|@[a-zA-Z-]+|\b[a-z-]+(?=\s*:)|#[0-9a-fA-F]{3,8}\b|-?\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|fr)?\b/g,
      html:
        /<!--[\s\S]*?-->|<\/?[a-zA-Z][\w:-]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[a-zA-Z_:][\w:.-]*(?=\s*=)/g,
      json:
        /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?\b\d+(?:\.\d+)?\b|\b(?:true|false|null)\b/g,
    };
    const pattern = patterns[language] || patterns.javascript;
    pattern.lastIndex = 0;
    let output = "";
    let lastIndex = 0;
    let match;
    while ((match = pattern.exec(source))) {
      const token = match[0];
      output += esc(source.slice(lastIndex, match.index));
      const kind = classifyToken(token, language, source, match.index);
      output += kind ? `<span class="tok-${kind}">${esc(token)}</span>` : esc(token);
      lastIndex = match.index + token.length;
    }
    output += esc(source.slice(lastIndex));
    return output + "\n";
  }

  function updateCodeHighlight({ preserveScroll = true } = {}) {
    const textarea = $("#codeArea", ui.sectionContent);
    if (!textarea) return;
    const highlight = $("#codeHighlight", ui.sectionContent);
    const numbers = $("#codeLineNumbers", ui.sectionContent);
    const scrollTop = preserveScroll ? textarea.scrollTop : 0;
    const scrollLeft = preserveScroll ? textarea.scrollLeft : 0;
    if (highlight) {
      highlight.innerHTML = highlightSyntax(state.fileContent, state.fileLanguage);
      highlight.scrollTop = scrollTop;
      highlight.scrollLeft = scrollLeft;
    }
    if (numbers) {
      const lineCount = state.fileContent.split("\n").length;
      numbers.textContent = Array.from({ length: lineCount }, (_value, index) => index + 1).join("\n");
      numbers.scrollTop = scrollTop;
    }
    updateCodeCursor();
  }

  function updateCodeCursor() {
    const textarea = $("#codeArea", ui.sectionContent);
    if (!textarea) return;
    const before = textarea.value.slice(0, textarea.selectionStart || 0);
    const line = before.split("\n").length;
    const column = (before.split("\n").pop() || "").length + 1;
    const cursor = $("#codeCursor", ui.sectionContent);
    const length = $("#codeLength", ui.sectionContent);
    if (cursor) cursor.textContent = `${line}:${column}`;
    if (length) length.textContent = `${textarea.value.length.toLocaleString()} 字符`;
  }

  function markCodeUI() {
    const info = $(".code-fileinfo", ui.sectionContent);
    if (info) info.classList.toggle("is-dirty", state.codeDirty);
    const currentFileButton = $(`.file-button[data-file-path="${CSS.escape(state.activeFile)}"]`, ui.sectionContent);
    if (currentFileButton) {
      let dot = currentFileButton.querySelector(".file-button__dirty");
      if (state.codeDirty && !dot) {
        dot = document.createElement("span");
        dot.className = "file-button__dirty";
        dot.setAttribute("aria-label", "未保存");
        currentFileButton.appendChild(dot);
      } else if (!state.codeDirty && dot) {
        dot.remove();
      }
    }
  }

  function updateCodeInput(target) {
    state.fileContent = target.value;
    markCodeDirty();
    updateCodeHighlight();
    markCodeUI();
  }

  async function loadCodeFile(path, { keepDirty = false } = {}) {
    if (!path) return;
    const requestId = ++state.codeRequestId;
    state.activeFile = path;
    state.codeLoading = true;
    state.codeLoaded = false;
    state.codeLoadError = "";
    if (!keepDirty) state.codeDirty = false;
    updateChrome();
    if (state.activeSection === "code") renderCodeSection();
    try {
      const payload = await fetchJson(`/api/file?path=${encodeURIComponent(path)}`);
      if (requestId !== state.codeRequestId) return;
      state.activeFile = payload.path;
      state.fileContent = payload.content;
      state.originalFileContent = payload.content;
      state.fileLanguage = payload.language || "html";
      state.fileMeta = payload;
      state.codeLoaded = true;
      state.codeLoading = false;
      state.codeDirty = false;
      state.lastError = "";
      const index = state.files.findIndex((file) => file.path === payload.path);
      if (index >= 0) {
        state.files[index] = {
          ...state.files[index],
          ...payload,
        };
      } else {
        state.files.push(payload);
      }
      if (state.activeSection === "code") renderCodeSection();
      updateChrome();
    } catch (error) {
      if (requestId !== state.codeRequestId) return;
      state.codeLoading = false;
      state.codeLoaded = false;
      state.codeLoadError = error.message;
      if (state.activeSection === "code") renderCodeSection();
      updateChrome();
      toast(`无法读取 ${path}：${error.message}`, "error");
    }
  }

  async function switchCodeFile(path) {
    if (path === state.activeFile && state.codeLoaded) return;
    if (state.codeDirty) {
      const discard = await confirmDialog({
        title: "切换源文件",
        message: "当前文件有未保存修改，切换后会丢失。",
        confirmText: "放弃并切换",
        danger: true,
      });
      if (!discard) return;
      state.codeDirty = false;
    }
    await loadCodeFile(path);
  }

  async function reloadCodeFile() {
    if (state.codeDirty) {
      const discard = await confirmDialog({
        title: "重新载入文件",
        message: "重新载入会丢弃当前文件未保存的修改。",
        confirmText: "重新载入",
        danger: true,
      });
      if (!discard) return;
      state.codeDirty = false;
    }
    await loadCodeFile(state.activeFile);
  }

  async function refreshVisualDataFromSource() {
    const payload = await fetchJson("/api/bootstrap");
    state.site = payload.siteConfig;
    state.originalSite = clone(payload.siteConfig);
    state.catalog = toCatalogObjects(payload.catalog);
    state.originalCatalog = clone(state.catalog);
    state.dirty = false;
    state.catalogErrors.clear();
    if (!state.announcementEditingId) ensureAnnouncementDraft();
    else {
      const source = state.site.announcements?.find(
        (announcement) => announcement.id === state.announcementEditingId
      );
      if (!source) {
        state.announcementEditingId = null;
        state.announcementDraft = defaultAnnouncementDraft();
      }
    }
    updateNavMeta();
    updateChrome();
  }

  async function saveActiveCode() {
    if (!state.loaded || !state.codeLoaded || state.codeLoading || state.saving) return false;
    state.saving = true;
    state.lastError = "";
    updateChrome();
    try {
      const payload = await fetchJson("/api/file", {
        method: "PUT",
        body: JSON.stringify({
          path: state.activeFile,
          content: state.fileContent,
        }),
      });
      state.originalFileContent = state.fileContent;
      state.codeDirty = false;
      state.fileMeta = payload;
      const index = state.files.findIndex((file) => file.path === payload.path);
      if (index >= 0) state.files[index] = { ...state.files[index], ...payload };
      markCodeUI();
      updateChrome();
      reloadPreviewSoon();
      if (state.activeFile === "js/site-config.js" || state.activeFile === "js/catalog.js") {
        await refreshVisualDataFromSource();
        toast("源码已保存，可视化数据已同步", "success");
      } else {
        toast("源码已保存，预览正在刷新", "success");
      }
      return true;
    } catch (error) {
      state.lastError = error.message;
      toast(`保存失败：${error.message}`, "error");
      updateChrome();
      return false;
    } finally {
      state.saving = false;
      updateChrome();
    }
  }

  function handleCodeAction(action) {
    if (action === "reload") {
      reloadCodeFile();
      return;
    }
    if (action === "save") {
      saveActiveCode();
    }
  }

  /* ------------------------------------------------------------------------
     Save, revert and API
     ------------------------------------------------------------------------ */

  function validateThemeState() {
    const theme = state.site?.theme || {};
    const errors = [];
    if (!isHex(theme.accent)) errors.push("强调色必须是有效的 HEX 色值");
    if (!isHex(theme.accentAlt)) errors.push("渐变辅助色必须是有效的 HEX 色值");
    return errors;
  }

  async function saveVisual({ reason = "manual", silent = false } = {}) {
    if (!state.loaded || state.saving) return false;

    const themeErrors = validateThemeState();
    const catalogErrors = validateCatalogState();
    if (!state.catalog.length) {
      catalogErrors.push({ message: "类目数据不能为空，请至少保留一条规格" });
    }

    if (themeErrors.length || catalogErrors.length) {
      const message =
        themeErrors[0] ||
        catalogErrors[0]?.message ||
        "保存前请先修复数据问题";
      state.lastError = message;
      if (catalogErrors.length && state.activeSection === "catalog") {
        updateEditorPaneScroll(() => renderCatalogSection());
      }
      updateChrome();
      toast(`${message}${catalogErrors.length > 1 ? `（共 ${catalogErrors.length} 处）` : ""}`, "error");
      return false;
    }

    state.saving = true;
    state.lastError = "";
    state.site.updatedAt = new Date().toISOString();
    updateChrome();

    try {
      await fetchJson("/api/content", {
        method: "PUT",
        body: JSON.stringify({
          siteConfig: state.site,
          catalog: toCatalogRows(state.catalog),
        }),
      });
      state.originalSite = clone(state.site);
      state.originalCatalog = clone(state.catalog);
      state.dirty = false;
      state.lastError = "";
      state.catalogErrors.clear();
      $$(".is-invalid", ui.sectionContent).forEach((element) => element.classList.remove("is-invalid"));
      updateNavMeta();
      updateChrome();
      reloadPreviewSoon();
      if (!silent) {
        toast(
          reason === "announcement" ? "公告已同步到预览" : "修改已保存并同步到预览",
          "success"
        );
      }
      return true;
    } catch (error) {
      state.lastError = error.message;
      if (error instanceof TypeError) {
        state.online = false;
        setServerState("error", "连接中断，请检查本地服务");
      }
      updateChrome();
      if (!silent) toast(`保存失败：${error.message}`, "error");
      return false;
    } finally {
      state.saving = false;
      updateChrome();
    }
  }

  async function handlePrimarySave() {
    if (!state.loaded || state.saving) return;
    if (state.activeSection === "code") {
      await saveActiveCode();
      return;
    }
    if (state.activeSection === "announcements" && state.announcementFormDirty) {
      await publishAnnouncementFromForm();
      return;
    }
    await saveVisual();
  }

  async function handleRevert() {
    if (!state.loaded || state.saving) return;
    if (state.activeSection === "code") {
      if (!state.codeDirty) return;
      const confirmed = await confirmDialog({
        title: "撤销源码修改",
        message: "将把当前文件恢复为最近一次读取或保存的内容。",
        confirmText: "撤销修改",
        danger: true,
      });
      if (!confirmed) return;
      state.fileContent = state.originalFileContent;
      state.codeDirty = false;
      state.lastError = "";
      renderCodeSection();
      updateChrome();
      toast("已恢复当前文件", "success");
      return;
    }

    if (!state.dirty && !state.announcementFormDirty) return;
    const confirmed = await confirmDialog({
      title: "撤销未保存的修改",
      message: "页面文案、类目、外观与公告的未保存更改都会恢复为项目文件中的版本。",
      confirmText: "撤销全部修改",
      danger: true,
    });
    if (!confirmed) return;

    state.site = clone(state.originalSite);
    state.catalog = clone(state.originalCatalog);
    state.dirty = false;
    state.announcementFormDirty = false;
    state.lastError = "";
    state.catalogErrors.clear();
    if (state.announcementEditingId) {
      const source = state.site.announcements?.find(
        (announcement) => announcement.id === state.announcementEditingId
      );
      if (source) {
        state.announcementDraft = announcementToDraft(source);
      } else {
        state.announcementEditingId = null;
        state.announcementDraft = defaultAnnouncementDraft();
      }
    } else {
      state.announcementDraft = defaultAnnouncementDraft();
    }
    state.announcementTone = state.announcementDraft.tone || "info";
    renderSection();
    updateChrome();
    updateNavMeta();
    toast("已恢复到项目文件版本", "success");
  }

  /* ------------------------------------------------------------------------
     Dialogs
     ------------------------------------------------------------------------ */

  function openEditorDialog({
    kicker = "CONFIRM",
    title,
    message = "",
    fields = [],
    confirmText = "确认",
    cancelText = "取消",
    danger = false,
  }) {
    return new Promise((resolve) => {
      if (dialogActive) {
        resolve(null);
        return;
      }
      dialogActive = true;
      const previousFocus = document.activeElement;
      const dialogId = "editorDialogTitle";
      const fieldsHtml = fields
        .map(
          (field) => `<div class="editor-dialog__field">
            <label for="dialogField-${esc(field.name)}">${esc(field.label || "")}</label>
            <input id="dialogField-${esc(field.name)}" name="${esc(field.name)}" type="text" value="${esc(field.value || "")}" placeholder="${esc(field.placeholder || "")}" autocomplete="off">
          </div>`
        )
        .join("");

      ui.dialogLayer.innerHTML = `<div class="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="${dialogId}">
        <p class="editor-dialog__kicker">${esc(kicker)}</p>
        <h2 id="${dialogId}">${esc(title || "")}</h2>
        ${message ? `<p>${esc(message)}</p>` : ""}
        ${fieldsHtml}
        <div class="editor-dialog__actions">
          <button class="btn btn--ghost btn--compact" type="button" data-dialog-cancel>${esc(cancelText)}</button>
          <button class="btn btn--${danger ? "danger" : "primary"} btn--compact" type="button" data-dialog-confirm>${esc(confirmText)}</button>
        </div>
      </div>`;
      ui.dialogLayer.setAttribute("aria-hidden", "false");
      ui.dialogLayer.classList.add("is-open");
      const dialog = $(".editor-dialog", ui.dialogLayer);
      const input = $("input", dialog);
      const confirmButton = $("[data-dialog-confirm]", dialog);

      const finish = (value) => {
        document.removeEventListener("keydown", onKeydown, true);
        ui.dialogLayer.removeEventListener("click", onClick);
        ui.dialogLayer.classList.remove("is-open");
        ui.dialogLayer.setAttribute("aria-hidden", "true");
        dialogActive = false;
        window.setTimeout(() => {
          if (!dialogActive) ui.dialogLayer.innerHTML = "";
        }, 220);
        if (previousFocus && document.contains(previousFocus)) {
          window.setTimeout(() => previousFocus.focus({ preventScroll: true }), 20);
        }
        resolve(value);
      };

      const accept = () => {
        if (!fields.length) {
          finish(true);
          return;
        }
        const values = {};
        $$("input", dialog).forEach((element) => {
          values[element.name] = element.value;
        });
        finish(values);
      };

      const onKeydown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          finish(null);
          return;
        }
        if (event.key === "Enter" && event.target?.matches("input")) {
          event.preventDefault();
          accept();
          return;
        }
        if (event.key !== "Tab") return;
        const focusable = $$("button, input", dialog).filter(
          (element) => !element.disabled && element.getClientRects().length
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };

      const onClick = (event) => {
        if (event.target === ui.dialogLayer) {
          finish(null);
          return;
        }
        if (event.target.closest("[data-dialog-cancel]")) {
          finish(null);
          return;
        }
        if (event.target.closest("[data-dialog-confirm]")) {
          accept();
        }
      };

      ui.dialogLayer.addEventListener("click", onClick);
      document.addEventListener("keydown", onKeydown, true);
      window.requestAnimationFrame(() => {
        if (input) input.focus({ preventScroll: true });
        else confirmButton?.focus({ preventScroll: true });
      });
    });
  }

  async function promptDialog({ title, message = "", label = "名称", placeholder = "", value = "", confirmText = "确定" }) {
    const result = await openEditorDialog({
      kicker: "INPUT",
      title,
      message,
      fields: [{ name: "value", label, placeholder, value }],
      confirmText,
    });
    return result ? result.value : null;
  }

  async function confirmDialog({ title, message, confirmText = "确认", cancelText = "取消", danger = false }) {
    const result = await openEditorDialog({
      kicker: danger ? "PLEASE CONFIRM" : "CONFIRM",
      title,
      message,
      confirmText,
      cancelText,
      danger,
    });
    return Boolean(result);
  }

  /* ------------------------------------------------------------------------
     Event wiring
     ------------------------------------------------------------------------ */

  function onNavClick(event) {
    const button = event.target.closest("[data-section]");
    if (!button) return;
    activateSection(button.dataset.section);
  }

  function onClick(event) {
    const contentAction = event.target.closest("[data-content-action]");
    if (contentAction) {
      handleContentAction(contentAction.dataset.contentAction);
      return;
    }

    const arrayButton = event.target.closest("[data-array-action]");
    if (arrayButton) {
      handleArrayAction(arrayButton);
      return;
    }

    const colorChip = event.target.closest(".color-chip[data-catalog-color]");
    if (colorChip) {
      toggleCatalogColor(colorChip);
      return;
    }

    const catalogAction = event.target.closest("[data-catalog-action]");
    if (catalogAction) {
      void handleCatalogAction(catalogAction.dataset.catalogAction, catalogAction);
      return;
    }

    const themeAction = event.target.closest("[data-theme-action]");
    if (themeAction) {
      handleThemeAction(themeAction.dataset.themeAction, themeAction);
      return;
    }

    const toneButton = event.target.closest("[data-ann-tone]");
    if (toneButton) {
      state.announcementTone = toneButton.dataset.annTone;
      $$("[data-ann-tone]", ui.sectionContent).forEach((button) => {
        button.classList.toggle("is-active", button.dataset.annTone === state.announcementTone);
      });
      markAnnouncementFormDirty();
      captureAnnouncementForm();
      return;
    }

    const annAction = event.target.closest("[data-ann-action]");
    if (annAction) {
      void handleAnnouncementAction(annAction.dataset.annAction, annAction);
      return;
    }

    const fileButton = event.target.closest("[data-file-path]");
    if (fileButton) {
      void switchCodeFile(fileButton.dataset.filePath);
      return;
    }

    const codeAction = event.target.closest("[data-code-action]");
    if (codeAction) {
      handleCodeAction(codeAction.dataset.codeAction);
    }
  }

  function onInput(event) {
    const target = event.target;

    if (target.closest("#announcementForm")) {
      captureAnnouncementForm();
      markAnnouncementFormDirty();
      return;
    }

    if (target.id === "contentSearch") {
      applyContentSearch(target.value);
      return;
    }

    if (target.id === "catalogSearch") {
      applyCatalogSearch(target.value);
      return;
    }

    if (target.dataset.fieldPath) {
      updateContentField(target);
      return;
    }

    if (target.dataset.catalogHeight) {
      updateCatalogHeight(target);
      return;
    }

    if (target.dataset.catalogField) {
      updateCatalogField(target);
      return;
    }

    if (target.dataset.catalogRename) {
      updateCatalogRename(target);
      return;
    }

    if (target.dataset.themeHex) {
      updateThemeHex(target);
      return;
    }

    if (target.dataset.themeField) {
      updateThemeField(target);
      return;
    }

    if (target.id === "codeArea") {
      updateCodeInput(target);
    }
  }

  function onChange(event) {
    const target = event.target;
    if (target.dataset.themeHex) normalizeThemeHexOnBlur(target);
  }

  function onKeydown(event) {
    const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s";
    if (isSaveShortcut) {
      event.preventDefault();
      if (!state.loaded || dialogActive) return;
      handlePrimarySave();
      return;
    }

    if (event.key === "Tab" && event.target?.matches(".code-input")) {
      event.preventDefault();
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText("  ", start, end, "end");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
  }

  function onBeforeUnload(event) {
    if (state.dirty || state.codeDirty || state.announcementFormDirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  }

  function bindStaticEvents() {
    ui.studioNav.addEventListener("click", onNavClick);
    ui.saveButton.addEventListener("click", handlePrimarySave);
    ui.revertButton.addEventListener("click", handleRevert);
    ui.paneSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-pane]");
      if (button) setPane(button.dataset.pane);
    });
    ui.viewportSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-viewport]");
      if (button) applyViewport(button.dataset.viewport);
    });
    ui.refreshPreview.addEventListener("click", () => {
      reloadPreviewSoon();
      toast("预览已刷新", "success");
    });
    ui.retryConnection.addEventListener("click", async () => {
      ui.retryConnection.disabled = true;
      ui.retryConnection.textContent = "正在连接…";
      await loadWorkspace();
      ui.retryConnection.disabled = false;
      ui.retryConnection.textContent = "重新连接";
    });
    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput);
    document.addEventListener("change", onChange);
    document.addEventListener("keydown", onKeydown);
    ui.sectionContent.addEventListener("submit", (event) => {
      if (event.target.id !== "announcementForm") return;
      event.preventDefault();
      void publishAnnouncementFromForm();
    });
    window.addEventListener("beforeunload", onBeforeUnload);
    const shortcut = $("kbd", ui.saveButton);
    if (shortcut) {
      shortcut.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ S" : "Ctrl S";
    }
  }

  function cacheDom() {
    ui = {
      studioSidebar: $("#studioSidebar"),
      studioNav: $("#studioNav"),
      serverChip: $("#serverChip"),
      serverStatus: $("#serverStatus"),
      sectionKicker: $("#sectionKicker"),
      sectionTitle: $("#sectionTitle"),
      syncState: $("#syncState"),
      syncText: $("#syncText"),
      paneSwitch: $("#paneSwitch"),
      saveButton: $("#saveButton"),
      saveButtonText: $("#saveButtonText"),
      revertButton: $("#revertButton"),
      editorPane: $("#editorPane"),
      sectionContent: $("#sectionContent"),
      loadingPanel: $("#loadingPanel"),
      previewPane: $("#previewPane"),
      previewIframe: $("#previewIframe"),
      previewBrowser: $("#previewBrowser"),
      previewLabel: $("#previewLabel"),
      viewportSwitch: $("#viewportSwitch"),
      refreshPreview: $("#refreshPreview"),
      editorToast: $("#editorToast"),
      editorToastText: $("#editorToastText"),
      dialogLayer: $("#editorDialogLayer"),
      connectionScreen: $("#connectionScreen"),
      retryConnection: $("#retryConnection"),
    };
  }

  function init() {
    cacheDom();
    buildNav();
    setPane("edit");
    restoreViewport();
    bindStaticEvents();
    updateChrome();
    loadWorkspace();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
