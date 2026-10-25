/* ==========================================================================
   餐边柜 SKU Studio · application
   Vanilla JS. All public copy lives in js/site-config.js.
   ========================================================================== */

(() => {
  "use strict";

  const CFG = window.SITE_CONFIG || {};
  const RAW_CATALOG = Array.isArray(window.SKU_CATALOG) ? window.SKU_CATALOG : [];
  const IS_PREVIEW = new URLSearchParams(window.location.search).has("preview");
  const MIXED_SERIES = CFG.options?.mixSeries || "混搭系列";
  const THEME_KEY = "sku-studio-theme-v1";
  const DISMISS_KEY = "sku-studio-dismissed-announcements-v1";
  const MODE_ORDER = ["single", "combo"];
  const colorOrder = Object.keys(CFG.colors || {});
  const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"></path></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5"></rect><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"></path></svg>',
    restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 11a8.5 8.5 0 1 0 2.2-6.3L3 7.4"></path><path d="M3 3v4.4h4.4"></path></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"></path><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"></path></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13M10 11v5M14 11v5"></path></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"></path></svg>',
    cabinet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M4 11h16M12 3v18M8.5 7h.01M15.5 15h.01"></path></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v5"></path><path d="M12 17h.01"></path></svg>',
  };

  const state = {
    mode: "single",
    step: 0,
    pulse: "",
    lastResult: null,
  };

  const selections = {
    series: new Set(),
    models: new Set(),
    widths: new Set(),
    styles: new Set(),
    colors: new Set(),
    layers: new Set(),
  };

  const comboConfigs = {};
  const SET_BY_KIND = {
    series: "series",
    model: "models",
    width: "widths",
    style: "styles",
    color: "colors",
    layer: "layers",
  };

  let records = [];
  let seriesList = [];
  let ui = {};
  let themeQuery = null;
  let userTheme = null;
  let toastTimer = 0;
  let modalTimer = 0;
  let modalReturnFocus = null;
  let dismissStorage = null;
  let lastMetricSignature = "";
  let activeComboPicker = null;
  let pickerKeyListener = null;
  let pickerResizeListener = null;

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

  function fmt(template, values = {}) {
    return String(template ?? "").replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, key) => {
      return Object.prototype.hasOwnProperty.call(values, key) && values[key] != null
        ? String(values[key])
        : match;
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function key(a, b) {
    return `${a}|${b}`;
  }

  function uniqueBy(items, getter) {
    const seen = new Set();
    return items.filter((item) => {
      const value = getter(item);
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  function keepOnly(target, allowed) {
    for (const value of Array.from(target)) {
      if (!allowed.has(value)) target.delete(value);
    }
  }

  function safeStorage(kind) {
    try {
      return kind === "session" ? window.sessionStorage : window.localStorage;
    } catch {
      return null;
    }
  }

  function normalizeHex(value, fallback) {
    if (typeof value !== "string") return fallback;
    const raw = value.trim();
    const match = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return fallback;
    if (match[1].length === 3) {
      return `#${match[1].split("").map((part) => part + part).join("")}`;
    }
    return `#${match[1]}`;
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }

  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const channels = [r, g, b].map((channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }

  function safeHref(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const parsed = new URL(value, window.location.href);
      if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return "";
      return parsed.href;
    } catch {
      return "";
    }
  }

  function colorLabel(code) {
    return CFG.colors?.[code] || code;
  }

  function colorRank(code) {
    const index = colorOrder.indexOf(code);
    return index === -1 ? 999 : index;
  }

  function sortColors(codes) {
    return Array.from(codes).sort((a, b) => colorRank(a) - colorRank(b) || String(a).localeCompare(String(b), "zh-CN"));
  }

  function sortLayers(layers) {
    return Array.from(layers).sort((a, b) => Number(a) - Number(b));
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    let locale = CFG.meta?.lang || "zh-CN";
    try {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      locale = "zh-CN";
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    }
  }

  /* ------------------------------------------------------------------------
     Data
     ------------------------------------------------------------------------ */

  function loadData() {
    records = [];
    const seriesSeen = new Set();

    for (const row of RAW_CATALOG) {
      if (!Array.isArray(row) || row.length < 6) continue;
      const series = String(row[0] ?? "").trim();
      const model = String(row[1] ?? "").trim();
      const heightGroup = String(row[2] ?? "").trim();
      const width = Number(row[3]);
      const depth = Number(row[4]) || 350;
      const colors = String(row[5] ?? "").split("").filter((part) => part.trim());
      const flag = String(row[6] ?? "").trim();

      if (!series || !model || !heightGroup || !Number.isFinite(width) || width <= 0 || !colors.length) {
        continue;
      }

      records.push({ s: series, m: model, hg: heightGroup, w: width, d: depth, c: colors, flag });
      if (!seriesSeen.has(series)) {
        seriesSeen.add(series);
        seriesList.push(series);
      }
    }
  }

  function heightParts(heightGroup) {
    return String(heightGroup ?? "")
      .split("/")
      .map((part) => Number(String(part).trim()))
      .filter((value) => Number.isFinite(value) && value > 0);
  }

  function heightsOf(heightGroup) {
    const parts = heightParts(heightGroup);
    if (!parts.length) return [];

    const styleNames = CFG.styleNames || {};
    const makeOption = (height, kind) => ({
      height,
      kind,
      label: styleNames[String(height)] || (kind === "stand" ? CFG.options.standing : CFG.options.floor),
      desc: fmt(kind === "stand" ? CFG.options.standingDesc : CFG.options.floorDesc, { height }),
    });

    if (parts.length >= 2) {
      return [makeOption(parts[0], "stand"), makeOption(parts[1], "floor")];
    }

    return [makeOption(parts[0], parts[0] <= 870 ? "floor" : "stand")];
  }

  function layersOf(heightGroup) {
    const first = heightParts(heightGroup)[0];
    return first === 1320 ? [4, 5] : [3, 4, 5];
  }

  function styleOption(heightGroup, height) {
    return heightsOf(heightGroup).find((option) => option.height === Number(height));
  }

  function recordsForSeries(series) {
    return records.filter((record) => record.s === series);
  }

  function selectedSeriesList() {
    const list = seriesList.filter((series) => selections.series.has(series));
    if (state.mode === "combo" && selections.series.has(MIXED_SERIES)) {
      list.push(MIXED_SERIES);
    }
    return list;
  }

  function selectedComboColors() {
    return sortColors(
      Array.from(selections.colors)
        .filter((entry) => entry.startsWith("combo|"))
        .map((entry) => entry.slice("combo|".length))
    );
  }

  function selectedComboLayers() {
    return sortLayers(
      Array.from(selections.layers)
        .filter((entry) => entry.startsWith("combo|"))
        .map((entry) => Number(entry.slice("combo|".length)))
    );
  }

  /* ------------------------------------------------------------------------
     Combo helpers
     ------------------------------------------------------------------------ */

  function ensureComboConfigs() {
    if (state.mode !== "combo") return;
    for (const series of selectedSeriesList()) {
      if (!Array.isArray(comboConfigs[series]) || !comboConfigs[series].length) {
        comboConfigs[series] = [{ items: ["", ""], selected: false }];
      }
      comboConfigs[series].forEach((group) => {
        if (!Array.isArray(group.items) || group.items.length < 2) {
          group.items = Array.isArray(group.items) ? group.items : ["", ""];
          while (group.items.length < 2) group.items.push("");
        }
        group.selected = Boolean(group.selected);
      });
    }
  }

  function parseComboItem(value, defaultSeries) {
    const parts = String(value ?? "").split("|");
    if (parts.length >= 3) {
      return { series: parts[0], model: parts[1], width: Number(parts[2]) };
    }
    return { series: defaultSeries, model: parts[0] || "", width: Number(parts[1]) };
  }

  function recordsForComboItem(value, defaultSeries) {
    const parsed = parseComboItem(value, defaultSeries);
    return records.filter(
      (record) =>
        record.s === parsed.series &&
        record.m === parsed.model &&
        record.w === parsed.width
    );
  }

  function getComboStatus() {
    ensureComboConfigs();
    const validGroups = [];
    const byKey = {};

    for (const series of selectedSeriesList()) {
      const groups = comboConfigs[series] || [];
      groups.forEach((group, index) => {
        const validItems = group.items.filter(Boolean);
        if (validItems.length < 2) return;
        const signature = series + "::" + [...validItems].sort().join("+");
        const info = { s: series, group, index, validItems, key: signature };
        validGroups.push(info);
        (byKey[signature] ||= []).push(info);
      });
    }

    const duplicateKeys = new Set(
      Object.keys(byKey).filter((signature) => byKey[signature].length > 1)
    );

    return { validGroups, byKey, duplicateKeys };
  }

  function getComboContext() {
    const status = getComboStatus();
    const hgs = new Set();
    const colors = new Set();
    const layers = new Set();

    for (const info of status.validGroups) {
      const componentRecords = [];
      for (const value of info.validItems) {
        const matches = recordsForComboItem(value, info.s);
        componentRecords.push(...matches);
        matches.forEach((record) => {
          hgs.add(record.hg);
          record.c.forEach((color) => colors.add(color));
          layersOf(record.hg).forEach((layer) => layers.add(layer));
        });
      }
      info.records = componentRecords;
    }

    return {
      ...status,
      hgs: Array.from(hgs).sort((a, b) => {
        const heightA = heightParts(a)[0] || 0;
        const heightB = heightParts(b)[0] || 0;
        return heightB - heightA || collator.compare(a, b);
      }),
      colors: sortColors(colors),
      layers: sortLayers(layers),
    };
  }

  function comboDisplayValue(series, value) {
    if (!value) return CFG.combo.selectPlaceholder;
    const parsed = parseComboItem(value, series);
    return fmt(parsed.series !== series ? CFG.combo.itemMixed : CFG.combo.item, {
      series: parsed.series,
      model: parsed.model,
      width: parsed.width,
    });
  }

  /* ------------------------------------------------------------------------
     Pruning and readiness
     ------------------------------------------------------------------------ */

  function pruneSelections() {
    if (state.mode === "single") {
      selections.series.delete(MIXED_SERIES);
      for (const series of Array.from(selections.series)) {
        if (!seriesList.includes(series)) selections.series.delete(series);
      }

      const allowedModels = new Set(
        records
          .filter((record) => selections.series.has(record.s))
          .map((record) => key(record.s, record.m))
      );
      keepOnly(selections.models, allowedModels);

      const rowsForModels = records.filter(
        (record) =>
          selections.series.has(record.s) &&
          selections.models.has(key(record.s, record.m))
      );
      keepOnly(
        selections.widths,
        new Set(rowsForModels.map((record) => key(record.s, record.w)))
      );

      const rowsForWidths = rowsForModels.filter((record) =>
        selections.widths.has(key(record.s, record.w))
      );
      const allowedStyles = new Set();
      rowsForWidths.forEach((record) => {
        heightsOf(record.hg).forEach((option) =>
          allowedStyles.add(key(record.s, option.height))
        );
      });
      keepOnly(selections.styles, allowedStyles);

      const rowsForStyles = rowsForWidths.filter((record) =>
        heightsOf(record.hg).some((option) =>
          selections.styles.has(key(record.s, option.height))
        )
      );
      keepOnly(
        selections.colors,
        new Set(rowsForStyles.flatMap((record) => record.c.map((color) => key(record.s, color))))
      );

      const rowsForColors = rowsForStyles.filter((record) =>
        record.c.some((color) => selections.colors.has(key(record.s, color)))
      );
      keepOnly(
        selections.layers,
        new Set(
          rowsForColors.flatMap((record) =>
            layersOf(record.hg).map((layer) => key(record.s, layer))
          )
        )
      );
      return;
    }

    for (const series of Array.from(selections.series)) {
      if (series !== MIXED_SERIES && !seriesList.includes(series)) {
        selections.series.delete(series);
      }
    }

    ensureComboConfigs();
    const context = getComboContext();
    const allowedStyles = new Set();
    context.hgs.forEach((heightGroup) => {
      heightsOf(heightGroup).forEach((option) =>
        allowedStyles.add(key(heightGroup, option.height))
      );
    });
    keepOnly(selections.styles, allowedStyles);
    keepOnly(selections.colors, new Set(context.colors.map((color) => `combo|${color}`)));
    keepOnly(selections.layers, new Set(context.layers.map((layer) => `combo|${layer}`)));
  }

  function getSteps() {
    return Array.isArray(CFG.steps?.[state.mode]) ? CFG.steps[state.mode] : [];
  }

  function currentStep() {
    return getSteps()[state.step] || null;
  }

  function isStepReady(index) {
    const step = getSteps()[index];
    if (!step) return false;

    switch (step.key) {
      case "series":
        return selections.series.size > 0;
      case "model":
        return selections.models.size > 0;
      case "width":
        return selections.widths.size > 0;
      case "style":
        return selections.styles.size > 0;
      case "color":
        return selections.colors.size > 0;
      case "layer":
        return selections.layers.size > 0;
      case "combo": {
        const { validGroups, duplicateKeys } = getComboStatus();
        return validGroups.length > 0 && duplicateKeys.size === 0;
      }
      case "result":
        return true;
      default:
        return true;
    }
  }

  function allPriorStepsReady(index) {
    for (let i = 0; i < index; i += 1) {
      if (!isStepReady(i)) return false;
    }
    return true;
  }

  function canAccessStep(index) {
    if (index <= state.step) return true;
    return isStepReady(index) && allPriorStepsReady(index);
  }

  function activeDimensionCount() {
    let count = ["series", "models", "widths", "styles", "colors", "layers"].filter(
      (setName) => selections[setName].size > 0
    ).length;
    if (state.mode === "combo" && getComboStatus().validGroups.length > 0) {
      count += 1;
    }
    return count;
  }

  /* ------------------------------------------------------------------------
     Theme and static copy
     ------------------------------------------------------------------------ */

  function applyThemeConfig() {
    const theme = CFG.theme || {};
    const accent = normalizeHex(theme.accent, "#0b6bff");
    const accentAlt = normalizeHex(theme.accentAlt, accent);
    const rgb = hexToRgb(accent);
    const contrast = luminance(accent) > 0.54 ? "#081017" : "#ffffff";
    const blur = clamp(Number.isFinite(Number(theme.glass)) ? Number(theme.glass) : 28, 0, 44);
    const radius = clamp(Number.isFinite(Number(theme.radius)) ? Number(theme.radius) : 28, 10, 42);
    const backgrounds = ["aurora", "sand", "bloom", "mono"];
    const background = backgrounds.includes(theme.background) ? theme.background : "aurora";

    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-alt", accentAlt);
    root.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty("--accent-contrast", contrast);
    root.style.setProperty("--glass-blur", `${blur}px`);
    root.style.setProperty("--radius", `${radius}px`);
    root.dataset.bg = background;
    root.dataset.motion = theme.motion === false ? "off" : "on";
  }

  function getEffectiveTheme() {
    const appearance = CFG.theme?.appearance;
    if (CFG.settings?.allowThemeToggle !== false && userTheme) return userTheme;
    if (appearance === "light" || appearance === "dark") return appearance;
    return themeQuery?.matches ? "dark" : "light";
  }

  function syncThemeButton() {
    const effective = getEffectiveTheme();
    const label = effective === "dark" ? CFG.nav?.themeLight : CFG.nav?.themeDark;
    ui.themeToggle.hidden = CFG.settings?.allowThemeToggle === false;
    ui.themeToggle.setAttribute("aria-label", label || "");
    ui.themeToggle.title = label || "";
  }

  function applyTheme() {
    const effective = getEffectiveTheme();
    document.documentElement.dataset.theme = effective;
    document.documentElement.style.colorScheme = effective;
    syncThemeButton();
  }

  function initTheme() {
    themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const storage = safeStorage("local");
    if (CFG.settings?.allowThemeToggle !== false && !IS_PREVIEW) {
      try {
        const stored = storage?.getItem(THEME_KEY);
        if (stored === "light" || stored === "dark") userTheme = stored;
      } catch {
        userTheme = null;
      }
    }
    applyTheme();
    themeQuery.addEventListener?.("change", () => {
      if (!userTheme && CFG.theme?.appearance !== "light" && CFG.theme?.appearance !== "dark") {
        applyTheme();
      }
    });
  }

  function toggleTheme() {
    const current = getEffectiveTheme();
    userTheme = current === "dark" ? "light" : "dark";
    if (!IS_PREVIEW && CFG.settings?.allowThemeToggle !== false) {
      try {
        safeStorage("local")?.setItem(THEME_KEY, userTheme);
      } catch {
        /* storage is optional */
      }
    }
    applyTheme();
  }

  function populateStaticCopy() {
    document.title = CFG.meta?.title || document.title;
    document.documentElement.lang = CFG.meta?.lang || "zh-CN";
    const description = $('meta[name="description"]');
    if (description) description.setAttribute("content", CFG.meta?.description || "");

    ui.skipLink.textContent = CFG.nav?.skip || "";
    ui.brandMark.textContent = CFG.brand?.mark || "柜";
    ui.brandName.textContent = CFG.brand?.name || "";
    ui.brandTagline.textContent = CFG.brand?.tagline || "";

    ui.announcementLabel.textContent = CFG.nav?.announcements || "";
    ui.helpLabel.textContent = CFG.nav?.help || "";
    ui.progressLabel.textContent = CFG.nav?.progress || "";
    ui.announcementButton.setAttribute("aria-label", CFG.nav?.announcements || "");
    ui.helpButton.setAttribute("aria-label", CFG.nav?.help || "");
    ui.heroEyebrow.textContent = CFG.hero?.eyebrow || "";
    ui.heroTitle.textContent = CFG.hero?.title || "";
    ui.heroSubtitle.textContent = CFG.hero?.subtitle || "";
    ui.heroMetrics.hidden = CFG.settings?.showHeroMetrics === false;
    ui.themeToggle.hidden = CFG.settings?.allowThemeToggle === false;

    if (CFG.settings?.showFooter === false) {
      ui.pageFooter.hidden = true;
    } else {
      ui.pageFooter.hidden = false;
      ui.pageFooter.innerHTML = `
        <div class="page-footer__left">
          <span class="page-footer__note">${esc(CFG.footer?.note || "")}</span>
          <span>${esc(CFG.footer?.text || "")}</span>
        </div>
        <span class="page-footer__copy">${esc(CFG.footer?.copyright || "")}</span>
      `;
    }

    syncThemeButton();
  }

  function modeSwitchMarkup() {
    return (
      '<span class="segmented__thumb" aria-hidden="true"></span>' +
      MODE_ORDER.map((mode) => {
        const config = CFG.modes?.[mode] || {};
        const selected = state.mode === mode;
        return `<button class="segment" type="button" role="tab" data-mode="${mode}" aria-selected="${selected}" tabindex="${selected ? "0" : "-1"}">${esc(config.label || mode)}</button>`;
      }).join("")
    );
  }

  function initModeSwitch() {
    ui.modeSwitches.forEach((switcher) => {
      switcher.innerHTML = modeSwitchMarkup();
    });
    syncModeSwitch();
  }

  function syncModeSwitch() {
    ui.modeSwitches.forEach((switcher) => {
      switcher.dataset.mode = state.mode;
      $$(".segment", switcher).forEach((button) => {
        const active = button.dataset.mode === state.mode;
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
    });
    ui.modeCaptions.forEach((caption) => {
      caption.textContent = CFG.modes?.[state.mode]?.caption || "";
    });
  }

  function setMode(mode, options = {}) {
    if (!MODE_ORDER.includes(mode) || mode === state.mode) return;
    state.mode = mode;
    resetAllState();
    syncModeSwitch();
    render({ animate: true, initialFocus: false });
    if (options.focus) {
      const visibleSwitch =
        ui.modeSwitches.find((switcher) => switcher.offsetParent !== null) ||
        ui.modeSwitches[0];
      const button = visibleSwitch?.querySelector(`[data-mode="${mode}"]`);
      button?.focus({ preventScroll: true });
    }
  }

  function resetAllState() {
    Object.values(selections).forEach((set) => set.clear());
    Object.keys(comboConfigs).forEach((series) => delete comboConfigs[series]);
    state.step = 0;
    state.pulse = "";
    state.lastResult = null;
  }

  /* ------------------------------------------------------------------------
     Rendering · page chrome
     ------------------------------------------------------------------------ */

  function renderModeMetrics() {
    if (CFG.settings?.showHeroMetrics === false) {
      ui.heroMetrics.hidden = true;
      return;
    }

    ui.heroMetrics.hidden = false;
    const steps = getSteps();
    const values = {
      rowCount: records.length,
      seriesCount: seriesList.length,
      selectionCount: activeDimensionCount(),
      modeLabel: CFG.modes?.[state.mode]?.label || "",
      stepNumber: state.step + 1,
      stepTotal: steps.length,
    };
    const metrics = Array.isArray(CFG.hero?.metrics) ? CFG.hero.metrics : [];
    const signature = JSON.stringify(metrics.map((metric) => fmt(metric.value, values)));

    ui.heroMetrics.innerHTML = metrics
      .map((metric) => {
        const value = fmt(metric.value, values);
        return `<div class="metric"><span class="metric__value">${esc(value)}</span><span class="metric__label">${esc(metric.label || "")}</span></div>`;
      })
      .join("");

    if (signature !== lastMetricSignature && lastMetricSignature) {
      $$(".metric__value", ui.heroMetrics).forEach((element) => element.classList.add("is-updating"));
    }
    lastMetricSignature = signature;
  }

  function renderSteps() {
    const steps = getSteps();
    const total = steps.length || 1;
    ui.stepCount.textContent = fmt(CFG.common?.stepOf, {
      current: state.step + 1,
      total: steps.length,
    });

    ui.steps.innerHTML = steps
      .map((step, index) => {
        const active = index === state.step;
        const done = index < state.step;
        const accessible = active || canAccessStep(index);
        const marker = done ? ICONS.check : String(index + 1);
        return `<button
          class="step${active ? " is-active" : ""}${done ? " is-done" : ""}"
          type="button"
          data-step="${index}"
          ${accessible ? "" : "disabled"}
          ${active ? 'aria-current="step"' : ""}
          ${accessible ? "" : `title="${esc(CFG.common?.lockedStep || "")}"`}
        >
          <span class="step__marker">${marker}</span>
          <span class="step__body">
            <span class="step__name">${esc(step.nav || step.title || "")}</span>
            <span class="step__meta">${esc(step.title || "")}</span>
          </span>
          <span class="step__index">${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
        </button>`;
      })
      .join("");

    const activeStep = $(".step.is-active", ui.steps);
    if (activeStep && window.matchMedia("(max-width: 960px)").matches) {
      window.requestAnimationFrame(() => {
        const left = Math.max(
          0,
          activeStep.offsetLeft - (ui.steps.clientWidth - activeStep.offsetWidth) / 2
        );
        ui.steps.scrollTo({
          left,
          behavior: reduceMotion.matches ? "auto" : "smooth",
        });
      });
    }
  }

  function renderStepHeader() {
    const step = currentStep();
    if (!step) return;
    const steps = getSteps();
    const isResult = step.key === "result";

    ui.stepKicker.textContent = isResult
      ? CFG.result?.kicker || ""
      : fmt(CFG.common?.stepOf, { current: state.step + 1, total: steps.length });
    ui.stepTitle.textContent = step.title || "";
    ui.stepHint.textContent = step.hint || "";
    ui.stepTools.innerHTML = "";

    if (step.actionType && !isResult) {
      ui.stepTools.innerHTML = `
        <button class="btn btn--ghost btn--sm" type="button" data-action="select-all-global" data-kind="${esc(step.actionType)}" title="${esc(CFG.options?.selectAllHint || "")}">${esc(CFG.common?.allGlobal || "")}</button>
        <button class="btn btn--ghost btn--sm" type="button" data-action="select-none-global" data-kind="${esc(step.actionType)}">${esc(CFG.common?.noneGlobal || "")}</button>
      `;
    }

    const progress = ((state.step + 1) / Math.max(steps.length, 1)) * 100;
    ui.progressFill.style.width = `${progress}%`;
  }

  function renderSummary() {
    const steps = getSteps();
    const indexes = new Map(steps.map((step, index) => [step.key, index]));
    const chips = [];

    const addChip = (labelKey, value, stepKey) => {
      if (!value) return;
      const index = indexes.get(stepKey);
      if (index == null) return;
      chips.push(`<button class="summary-chip" type="button" data-jump="${index}" title="${esc(fmt(CFG.summary?.hint || "", { step: steps[index]?.nav || "" }))}">
        <span class="summary-chip__label">${esc(CFG.summary?.labels?.[labelKey] || "")}</span>
        <span class="summary-chip__value">${esc(value)}</span>
      </button>`);
    };

    const selectedSeries = selectedSeriesList();
    if (selectedSeries.length) {
      addChip(
        "series",
        fmt(CFG.summary?.formats?.seriesList, {
          value: selectedSeries.join(CFG.summary?.joiner || "、"),
        }),
        "series"
      );
    }

    if (state.mode === "single") {
      if (selections.models.size) {
        addChip(
          "model",
          fmt(CFG.summary?.formats?.modelCount, {
            count: selections.models.size,
          }),
          "model"
        );
      }
      if (selections.widths.size) {
        const widths = new Set(
          Array.from(selections.widths).map((entry) => entry.split("|").slice(1).join("|"))
        );
        addChip(
          "width",
          fmt(CFG.summary?.formats?.widthCount, { count: widths.size }),
          "width"
        );
      }
      if (selections.styles.size) {
        addChip(
          "style",
          fmt(CFG.summary?.formats?.styleCount, {
            count: selections.styles.size,
          }),
          "style"
        );
      }
      if (selections.colors.size) {
        const colors = sortColors(
          Array.from(selections.colors).map((entry) => entry.split("|").slice(1).join("|"))
        );
        addChip(
          "color",
          fmt(CFG.summary?.formats?.colorList, {
            value: colors.map(colorLabel).join(CFG.summary?.joiner || "、"),
          }),
          "color"
        );
      }
      if (selections.layers.size) {
        addChip(
          "layer",
          fmt(CFG.summary?.formats?.layerCount, {
            count: selections.layers.size,
          }),
          "layer"
        );
      }
    } else {
      const { validGroups } = getComboStatus();
      if (validGroups.length) {
        addChip(
          "combos",
          fmt(CFG.summary?.formats?.comboCount, { count: validGroups.length }),
          "combo"
        );
      }
      if (selections.styles.size) {
        addChip(
          "style",
          fmt(CFG.summary?.formats?.styleCount, {
            count: selections.styles.size,
          }),
          "style"
        );
      }
      if (selections.colors.size) {
        const colors = selectedComboColors();
        addChip(
          "color",
          fmt(CFG.summary?.formats?.colorList, {
            value: colors.map(colorLabel).join(CFG.summary?.joiner || "、"),
          }),
          "color"
        );
      }
      if (selections.layers.size) {
        addChip(
          "layer",
          fmt(CFG.summary?.formats?.layerCount, {
            count: selections.layers.size,
          }),
          "layer"
        );
      }
    }

    ui.summaryPanel.innerHTML = `
      <div class="summary__head">
        <span class="summary__title">${esc(CFG.summary?.title || "")}</span>
        <span class="summary__hint">${esc(CFG.summary?.hint || "")}</span>
      </div>
      ${
        chips.length
          ? `<div class="summary__chips">${chips.join("")}</div>`
          : `<p class="summary__empty">${esc(CFG.summary?.empty || "")}</p>`
      }
    `;
  }

  /* ------------------------------------------------------------------------
     Rendering · selection steps
     ------------------------------------------------------------------------ */

  function optionMarkup({ kind, value, title, desc = "", tag = "" }) {
    const selected = selections[SET_BY_KIND[kind]]?.has(value);
    const pulse = selected && state.pulse === `${kind}::${value}`;
    return `<button
      class="option${selected ? " is-selected" : ""}${pulse ? " is-picked" : ""}"
      type="button"
      data-choice="${esc(value)}"
      data-kind="${esc(kind)}"
      aria-pressed="${Boolean(selected)}"
    >
      <span class="option__check" aria-hidden="true">${ICONS.check}</span>
      <span class="option__title">${esc(title)}</span>
      ${desc ? `<span class="option__desc">${esc(desc)}</span>` : ""}
      ${tag ? `<span class="option__tag">${esc(tag)}</span>` : ""}
    </button>`;
  }

  function groupActionsMarkup(kind) {
    return `<div class="group-actions">
      <button class="mini-btn" type="button" data-action="select-all-group" data-kind="${esc(kind)}">${esc(CFG.common?.all || "")}</button>
      <button class="mini-btn" type="button" data-action="select-none-group" data-kind="${esc(kind)}">${esc(CFG.common?.none || "")}</button>
    </div>`;
  }

  function seriesGroupMarkup({ title, options = [], skip = "", kind, compact = false }) {
    return `<section class="series-group">
      <header class="group-head">
        <div class="group-head__title">
          <span class="group-head__dot" aria-hidden="true"></span>
          <h3>${esc(title)}</h3>
        </div>
        ${options.length ? groupActionsMarkup(kind) : ""}
      </header>
      ${
        options.length
          ? `<div class="option-grid${compact ? " option-grid--compact" : ""}">${options.join("")}</div>`
          : `<p class="group-empty">${esc(skip || CFG.common?.emptyGroup || "")}</p>`
      }
    </section>`;
  }

  function renderSeriesStep() {
    const options = seriesList.map((series) => {
      const count = recordsForSeries(series).length;
      return optionMarkup({
        kind: "series",
        value: series,
        title: series,
        desc: fmt(CFG.options?.seriesRows, { count }),
      });
    });

    if (state.mode === "combo") {
      options.push(
        optionMarkup({
          kind: "series",
          value: MIXED_SERIES,
          title: MIXED_SERIES,
          desc: CFG.options?.mixSeriesDesc || "",
        })
      );
    }

    if (!options.length) {
      return `<p class="group-empty">${esc(CFG.options?.empty || "")}</p>`;
    }

    return `<div class="option-grid">${options.join("")}</div>`;
  }

  function singleGroupsData() {
    const groups = [];
    for (const series of seriesList.filter((item) => selections.series.has(item))) {
      groups.push({ series, seriesRecords: recordsForSeries(series) });
    }
    return groups;
  }

  function renderModelStep() {
    const groups = singleGroupsData();
    if (!groups.length) return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;

    return groups
      .map(({ series, seriesRecords }) => {
        const models = uniqueBy(seriesRecords, (record) => record.m);
        const options = models.map((record) => {
          const pending = seriesRecords.some(
            (item) => item.m === record.m && Boolean(item.flag)
          );
          return optionMarkup({
            kind: "model",
            value: key(series, record.m),
            title: record.m,
            tag: pending ? CFG.options?.tagPending : "",
          });
        });
        return seriesGroupMarkup({
          title: series,
          options,
          skip: CFG.options?.noModel,
          kind: "model",
          compact: true,
        });
      })
      .join("");
  }

  function renderWidthStep() {
    const groups = singleGroupsData();
    if (!groups.length) return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;

    return groups
      .map(({ series, seriesRecords }) => {
        const selectedRows = seriesRecords.filter((record) =>
          selections.models.has(key(record.s, record.m))
        );
        if (!selectedRows.length) {
          return seriesGroupMarkup({
            title: series,
            options: [],
            skip: CFG.options?.noModel,
            kind: "width",
          });
        }
        const widths = Array.from(new Set(selectedRows.map((record) => record.w))).sort(
          (a, b) => Number(a) - Number(b)
        );
        const options = widths.map((width) =>
          optionMarkup({
            kind: "width",
            value: key(series, width),
            title: fmt(CFG.options?.width, { value: width }),
          })
        );
        return seriesGroupMarkup({
          title: series,
          options,
          skip: CFG.options?.noPrereq,
          kind: "width",
          compact: true,
        });
      })
      .join("");
  }

  function renderStyleStepSingle() {
    const groups = singleGroupsData();
    if (!groups.length) return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;

    return groups
      .map(({ series, seriesRecords }) => {
        const selectedRows = seriesRecords.filter((record) =>
          selections.widths.has(key(record.s, record.w))
        );
        if (!selectedRows.length) {
          return seriesGroupMarkup({
            title: series,
            options: [],
            skip: CFG.options?.noWidth,
            kind: "style",
          });
        }

        const optionMap = new Map();
        selectedRows.forEach((record) => {
          heightsOf(record.hg).forEach((option) => {
            if (!optionMap.has(option.height)) {
              optionMap.set(option.height, { ...option, pending: Boolean(record.flag) });
            } else if (record.flag) {
              optionMap.get(option.height).pending = true;
            }
          });
        });

        const options = Array.from(optionMap.values())
          .sort((a, b) => b.height - a.height)
          .map((option) =>
            optionMarkup({
              kind: "style",
              value: key(series, option.height),
              title: fmt(CFG.options?.styleMeta, {
                label: option.label,
                height: option.height,
              }),
              desc: option.desc,
              tag: option.pending ? CFG.options?.tagPending : "",
            })
          );

        return seriesGroupMarkup({
          title: series,
          options,
          skip: CFG.options?.noPrereq,
          kind: "style",
        });
      })
      .join("");
  }

  function renderColorStepSingle() {
    const groups = singleGroupsData();
    if (!groups.length) return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;

    return groups
      .map(({ series, seriesRecords }) => {
        const selectedRows = seriesRecords.filter(
          (record) =>
            selections.widths.has(key(record.s, record.w)) &&
            heightsOf(record.hg).some((option) =>
              selections.styles.has(key(record.s, option.height))
            )
        );
        if (!selectedRows.length) {
          return seriesGroupMarkup({
            title: series,
            options: [],
            skip: CFG.options?.noPrereq,
            kind: "color",
          });
        }

        const colors = sortColors(new Set(selectedRows.flatMap((record) => record.c)));
        const options = colors.map((color) =>
          optionMarkup({
            kind: "color",
            value: key(series, color),
            title: colorLabel(color),
          })
        );

        return seriesGroupMarkup({
          title: series,
          options,
          skip: CFG.options?.noPrereq,
          kind: "color",
          compact: true,
        });
      })
      .join("");
  }

  function renderLayerStepSingle() {
    const groups = singleGroupsData();
    if (!groups.length) return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;

    return groups
      .map(({ series, seriesRecords }) => {
        const selectedRows = seriesRecords.filter(
          (record) =>
            selections.widths.has(key(record.s, record.w)) &&
            heightsOf(record.hg).some((option) =>
              selections.styles.has(key(record.s, option.height))
            ) &&
            record.c.some((color) => selections.colors.has(key(record.s, color)))
        );
        if (!selectedRows.length) {
          return seriesGroupMarkup({
            title: series,
            options: [],
            skip: CFG.options?.noPrereq,
            kind: "layer",
          });
        }

        const layers = sortLayers(new Set(selectedRows.flatMap((record) => layersOf(record.hg))));
        const options = layers.map((layer) =>
          optionMarkup({
            kind: "layer",
            value: key(series, layer),
            title: fmt(CFG.options?.layer, { value: layer }),
          })
        );

        return seriesGroupMarkup({
          title: series,
          options,
          skip: CFG.options?.noPrereq,
          kind: "layer",
          compact: true,
        });
      })
      .join("");
  }

  function comboPickerTrigger(series, selectedValue, groupIndex, itemIndex) {
    const display = comboDisplayValue(series, selectedValue);
    return `<div class="combo-picker-wrap">
      <button
        class="combo-picker-trigger${selectedValue ? " has-value" : ""}"
        type="button"
        data-combo-picker
        data-picker-series="${esc(series)}"
        data-picker-group="${groupIndex}"
        data-picker-item="${itemIndex}"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-label="${esc(fmt(CFG.combo?.groupLabel, { index: groupIndex + 1 }))} · ${esc(display)}"
      >
        <span class="combo-picker-trigger__text">${esc(display)}</span>
        <span class="combo-picker-trigger__chevron" aria-hidden="true">${ICONS.chevronDown}</span>
      </button>
    </div>`;
  }

  function renderComboStep() {
    ensureComboConfigs();
    const groups = selectedSeriesList();
    if (!groups.length) return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;

    const context = getComboContext();
    const cards = groups
      .map((series) => {
        const seriesGroups = comboConfigs[series] || [];
        const selectedCount = seriesGroups.filter((group) => group.selected).length;
        const comboRows = seriesGroups
          .map((group, groupIndex) => {
            const validItems = group.items.filter(Boolean);
            const signature =
              validItems.length >= 2
                ? series + "::" + [...validItems].sort().join("+")
                : "";
            const duplicate = signature && context.duplicateKeys.has(signature);
            const fields = group.items
              .map((value, itemIndex) => {
                const trigger = comboPickerTrigger(series, value, groupIndex, itemIndex);
                return `${itemIndex > 0 ? `<span class="combo-plus" aria-hidden="true">${esc(CFG.combo?.separator || "+")}</span>` : ""}${trigger}`;
              })
              .join("");

            return `<article class="combo-card${duplicate ? " is-duplicate" : ""}">
              <div class="combo-card__rail">
                <label class="combo-check">
                  <input class="combo-check-input" type="checkbox" data-combo-series="${esc(series)}" data-group-index="${groupIndex}" ${group.selected ? "checked" : ""} aria-label="${esc(fmt(CFG.combo?.groupLabel, { index: groupIndex + 1 }))}">
                  <span class="combo-check__box" aria-hidden="true">${ICONS.check}</span>
                </label>
                <span class="combo-card__title">${esc(fmt(CFG.combo?.groupLabel, { index: groupIndex + 1 }))}</span>
                ${duplicate ? `<span class="badge badge--danger">${esc(CFG.combo?.duplicate || "")}</span>` : ""}
                <div class="combo-fields">${fields}</div>
                <div class="combo-card__actions">
                  ${group.items.length < 3 ? `<button class="combo-icon-btn combo-add-btn" type="button" data-action="add-combo-item" data-combo-series="${esc(series)}" data-group-index="${groupIndex}" title="${esc(CFG.combo?.addCabinet || "")}" aria-label="${esc(CFG.combo?.addCabinet || "")}">${ICONS.plus}<span>${esc(CFG.combo?.addCabinet || "")}</span></button>` : ""}
                  <button class="combo-icon-btn" type="button" data-action="copy-combo" data-combo-series="${esc(series)}" data-group-index="${groupIndex}" title="${esc(CFG.combo?.copyGroup || "")}" aria-label="${esc(CFG.combo?.copyGroup || "")}">${ICONS.copy}</button>
                  <button class="combo-icon-btn is-danger" type="button" data-action="delete-combo" data-combo-series="${esc(series)}" data-group-index="${groupIndex}" title="${esc(CFG.combo?.deleteGroup || "")}" aria-label="${esc(CFG.combo?.deleteGroup || "")}">${ICONS.trash}</button>
                </div>
              </div>
            </article>`;
          })
          .join("");

        return `<section class="series-group combo-series">
          <header class="group-head">
            <div class="group-head__title">
              <span class="group-head__dot" aria-hidden="true"></span>
              <h3>${esc(series)}</h3>
              ${selectedCount ? `<span class="badge badge--accent">${esc(fmt(CFG.combo?.selectedCount, { count: selectedCount }))}</span>` : ""}
            </div>
            <div class="group-actions">
              <button class="mini-btn" type="button" data-action="batch-copy" data-combo-series="${esc(series)}" ${selectedCount < 2 ? "disabled" : ""} title="${esc(CFG.combo?.batchSelectHint || "")}">${esc(CFG.combo?.batchCopy || "")}</button>
              <button class="mini-btn" type="button" data-action="add-combo" data-combo-series="${esc(series)}">${esc(CFG.combo?.addGroup || "")}</button>
            </div>
          </header>
          <div class="combo-list">${comboRows}</div>
        </section>`;
      })
      .join("");

    let status = "";
    let statusClass = "";
    if (!context.validGroups.length) {
      status = CFG.options?.comboNeed || "";
      statusClass = "is-error";
    } else if (context.duplicateKeys.size) {
      status = `${fmt(CFG.options?.comboReady, { count: context.validGroups.length })} · ${CFG.options?.comboDuplicate || ""}`;
      statusClass = "is-error";
    } else {
      status = `${fmt(CFG.options?.comboReady, { count: context.validGroups.length })} · ${CFG.options?.comboOk || ""}`;
      statusClass = "is-ready";
    }

    return `${cards}<div class="combo-status ${statusClass}">${esc(status)}</div>`;
  }

  /* ------------------------------------------------------------------------
     Cascading cabinet picker
     ------------------------------------------------------------------------ */

  function pickerSeriesData(seriesKey) {
    const targetSeries = seriesKey === MIXED_SERIES ? seriesList : [seriesKey];
    return targetSeries.map((series) => {
      const rows = records.filter((record) => record.s === series);
      const models = [];
      for (const record of rows) {
        let model = models.find((entry) => entry.name === record.m);
        if (!model) {
          model = { name: record.m, widths: [] };
          models.push(model);
        }
        if (!model.widths.includes(record.w)) model.widths.push(record.w);
      }
      models.forEach((model) => {
        model.widths.sort((a, b) => Number(a) - Number(b));
      });
      return { series, models };
    });
  }

  function comboPickerMarkup(seriesKey, groupIndex, itemIndex, currentValue) {
    const current = currentValue ? parseComboItem(currentValue, seriesKey) : null;
    const groups = pickerSeriesData(seriesKey);
    const mixed = seriesKey === MIXED_SERIES;
    let totalModels = 0;

    const sections = groups
      .map((group) => {
        totalModels += group.models.length;
        const selectedSeries = Boolean(current && current.series === group.series);
        const openSeries = mixed ? selectedSeries : true;
        const modelMarkup = group.models
          .map((model) => {
            const modelOpen = Boolean(
              current &&
                current.series === group.series &&
                current.model === model.name
            );
            const widths = model.widths
              .map((width) => {
                const value = mixed
                  ? `${group.series}|${model.name}|${width}`
                  : `${model.name}|${width}`;
                const selected = Boolean(
                  current &&
                    current.series === group.series &&
                    current.model === model.name &&
                    Number(current.width) === Number(width)
                );
                return `<button
                  class="picker-width${selected ? " is-selected" : ""}"
                  type="button"
                  data-picker-pick
                  data-picker-value="${esc(value)}"
                  aria-pressed="${selected}"
                >${esc(fmt(CFG.combo?.pickerWidth, { value: width }))}</button>`;
              })
              .join("");

            return `<div class="picker-model">
              <button class="picker-model__toggle" type="button" data-picker-model-toggle aria-expanded="${modelOpen}">
                <span class="picker-model__name">${esc(model.name)}</span>
                <span class="picker-model__meta">${esc(fmt(CFG.combo?.pickerModelMeta, { count: model.widths.length }))}</span>
                <span class="picker-chevron" aria-hidden="true">${ICONS.chevronDown}</span>
              </button>
              <div class="picker-model__widths" ${modelOpen ? "" : "hidden"}>
                ${widths || `<span class="picker-empty">${esc(CFG.combo?.pickerEmpty || "")}</span>`}
              </div>
            </div>`;
          })
          .join("");

        return `<section class="picker-series${openSeries ? " is-open" : ""}">
          <button class="picker-series__toggle" type="button" data-picker-series-toggle aria-expanded="${openSeries}">
            <span class="picker-series__dot" aria-hidden="true"></span>
            <span class="picker-series__name">${esc(group.series)}</span>
            <span class="picker-series__meta">${esc(fmt(CFG.combo?.pickerSeriesMeta, { count: group.models.length }))}</span>
            <span class="picker-chevron" aria-hidden="true">${ICONS.chevronDown}</span>
          </button>
          <div class="picker-series__body" ${openSeries ? "" : "hidden"}>
            ${modelMarkup || `<span class="picker-empty">${esc(CFG.combo?.pickerEmpty || "")}</span>`}
          </div>
        </section>`;
      })
      .join("");

    return `<div class="combo-picker" role="dialog" aria-modal="true" aria-labelledby="comboPickerTitle" tabindex="-1">
      <span class="combo-picker__grabber" aria-hidden="true"></span>
      <header class="combo-picker__head">
        <div>
          <h2 id="comboPickerTitle">${esc(CFG.combo?.pickerTitle || "")}</h2>
          <p>${esc(CFG.combo?.pickerHint || "")}</p>
        </div>
        <button class="combo-picker__close" type="button" data-picker-close aria-label="${esc(CFG.combo?.pickerClose || CFG.common?.close || "")}">${ICONS.close}</button>
      </header>
      <div class="combo-picker__body">
        ${totalModels ? sections : `<div class="picker-empty picker-empty--large">${esc(CFG.combo?.pickerEmpty || "")}</div>`}
      </div>
      <footer class="combo-picker__foot" ${currentValue ? "" : "hidden"}>
        <button class="picker-clear" type="button" data-picker-clear>${esc(CFG.combo?.pickerClear || "")}</button>
      </footer>
    </div>`;
  }

  function positionComboPicker() {
    const panel = $(".combo-picker", ui.pickerLayer);
    if (!panel || !activeComboPicker) return;
    if (window.matchMedia("(max-width: 640px)").matches) {
      panel.classList.add("is-sheet");
      panel.style.removeProperty("left");
      panel.style.removeProperty("top");
      panel.style.removeProperty("width");
      panel.style.removeProperty("max-height");
      return;
    }

    panel.classList.remove("is-sheet");
    const rect = activeComboPicker.trigger.getBoundingClientRect();
    const margin = 14;
    const width = Math.min(560, window.innerWidth - margin * 2);
    const left = Math.min(
      Math.max(margin, rect.left),
      Math.max(margin, window.innerWidth - width - margin)
    );
    const below = window.innerHeight - rect.bottom - margin - 8;
    const placeAbove = below < 260;
    const maxHeight = Math.max(
      220,
      Math.min(540, placeAbove ? rect.top - margin - 8 : below)
    );
    panel.style.width = `${width}px`;
    panel.style.left = `${left}px`;
    panel.style.maxHeight = `${maxHeight}px`;
    if (placeAbove) {
      const actualHeight = Math.min(panel.getBoundingClientRect().height, maxHeight);
      panel.style.top = `${Math.max(margin, rect.top - actualHeight - 8)}px`;
    } else {
      panel.style.top = `${rect.bottom + 8}px`;
    }
  }

  function openComboPicker(trigger) {
    const series = trigger.dataset.pickerSeries;
    const groupIndex = Number(trigger.dataset.pickerGroup);
    const itemIndex = Number(trigger.dataset.pickerItem);
    ensureComboConfigs();
    const group = comboConfigs[series]?.[groupIndex];
    if (!group) return;

    closeComboPicker({ restoreFocus: false });
    const current = group.items[itemIndex] || "";
    ui.pickerLayer.innerHTML = comboPickerMarkup(series, groupIndex, itemIndex, current);
    ui.pickerLayer.setAttribute("aria-hidden", "false");
    ui.pickerLayer.classList.add("is-open");
    document.body.classList.add("is-picker-open");
    trigger.setAttribute("aria-expanded", "true");
    activeComboPicker = { series, groupIndex, itemIndex, trigger };
    positionComboPicker();

    pickerKeyListener = onPickerKeydown;
    pickerResizeListener = () => closeComboPicker({ restoreFocus: false });
    document.addEventListener("keydown", pickerKeyListener, true);
    window.addEventListener("resize", pickerResizeListener);
    window.requestAnimationFrame(() => {
      $(".combo-picker", ui.pickerLayer)?.focus({ preventScroll: true });
    });
  }

  function closeComboPicker({ restoreFocus = true } = {}) {
    const picker = activeComboPicker;
    if (!picker) return;
    picker.trigger?.setAttribute("aria-expanded", "false");
    if (pickerKeyListener) {
      document.removeEventListener("keydown", pickerKeyListener, true);
      pickerKeyListener = null;
    }
    if (pickerResizeListener) {
      window.removeEventListener("resize", pickerResizeListener);
      pickerResizeListener = null;
    }
    ui.pickerLayer.classList.remove("is-open");
    ui.pickerLayer.setAttribute("aria-hidden", "true");
    ui.pickerLayer.innerHTML = "";
    document.body.classList.remove("is-picker-open");
    activeComboPicker = null;
    if (restoreFocus && picker.trigger?.isConnected) {
      picker.trigger.focus({ preventScroll: true });
    }
  }

  function focusComboTrigger(series, groupIndex, itemIndex) {
    const trigger = $$("[data-combo-picker]").find(
      (button) =>
        button.dataset.pickerSeries === series &&
        Number(button.dataset.pickerGroup) === groupIndex &&
        Number(button.dataset.pickerItem) === itemIndex
    );
    trigger?.focus({ preventScroll: true });
  }

  function applyComboPickerValue(value) {
    if (!activeComboPicker) return;
    const { series, groupIndex, itemIndex } = activeComboPicker;
    const group = comboConfigs[series]?.[groupIndex];
    if (!group) return;
    group.items[itemIndex] = value;
    closeComboPicker({ restoreFocus: false });
    pruneSelections();
    render({ preserveScroll: true });
    window.requestAnimationFrame(() => {
      focusComboTrigger(series, groupIndex, itemIndex);
    });
  }

  function onPickerKeydown(event) {
    if (!activeComboPicker) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeComboPicker();
      return;
    }
    if (event.key !== "Tab") return;
    const panel = $(".combo-picker", ui.pickerLayer);
    if (!panel) return;
    const focusable = $$(
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      panel
    ).filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onPickerClick(event) {
    if (event.target === ui.pickerLayer) {
      closeComboPicker();
      return;
    }
    if (event.target.closest("[data-picker-close]")) {
      closeComboPicker();
      return;
    }
    const seriesToggle = event.target.closest("[data-picker-series-toggle]");
    if (seriesToggle) {
      const section = seriesToggle.closest(".picker-series");
      const body = section?.querySelector(".picker-series__body");
      const expanded = seriesToggle.getAttribute("aria-expanded") === "true";
      seriesToggle.setAttribute("aria-expanded", String(!expanded));
      section?.classList.toggle("is-open", !expanded);
      if (body) body.hidden = expanded;
      return;
    }
    const modelToggle = event.target.closest("[data-picker-model-toggle]");
    if (modelToggle) {
      const model = modelToggle.closest(".picker-model");
      const widths = model?.querySelector(".picker-model__widths");
      const expanded = modelToggle.getAttribute("aria-expanded") === "true";
      modelToggle.setAttribute("aria-expanded", String(!expanded));
      if (widths) widths.hidden = expanded;
      return;
    }
    const pick = event.target.closest("[data-picker-pick]");
    if (pick) {
      applyComboPickerValue(pick.dataset.pickerValue || "");
      return;
    }
    if (event.target.closest("[data-picker-clear]")) {
      applyComboPickerValue("");
    }
  }

  function renderComboStyleStep() {
    const context = getComboContext();
    if (!context.validGroups.length) {
      return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;
    }

    const groups = context.hgs
      .map((heightGroup) => {
        const options = heightsOf(heightGroup)
          .sort((a, b) => b.height - a.height)
          .map((option) => {
            const pending = context.validGroups.some((info) =>
              info.records?.some(
                (record) => record.hg === heightGroup && Boolean(record.flag)
              )
            );
            return optionMarkup({
              kind: "style",
              value: key(heightGroup, option.height),
              title: fmt(CFG.options?.styleMeta, {
                label: option.label,
                height: option.height,
              }),
              desc: option.desc,
              tag: pending ? CFG.options?.tagPending : "",
            });
          });

        return seriesGroupMarkup({
          title: fmt(CFG.options?.heightGroup, { group: heightGroup }),
          options,
          skip: CFG.options?.noPrereq,
          kind: "style",
        });
      })
      .join("");

    return groups || `<p class="group-empty">${esc(CFG.options?.empty || "")}</p>`;
  }

  function renderComboColorStep() {
    const context = getComboContext();
    if (!context.validGroups.length) {
      return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;
    }

    const options = context.colors.map((color) =>
      optionMarkup({
        kind: "color",
        value: `combo|${color}`,
        title: colorLabel(color),
      })
    );

    return `<section class="series-group">
      <div class="option-grid option-grid--compact">${options.join("") || `<p class="group-empty">${esc(CFG.options?.empty || "")}</p>`}</div>
    </section>`;
  }

  function renderComboLayerStep() {
    const context = getComboContext();
    if (!context.validGroups.length) {
      return `<p class="group-empty">${esc(CFG.options?.noPrereq || "")}</p>`;
    }

    const options = context.layers.map((layer) =>
      optionMarkup({
        kind: "layer",
        value: `combo|${layer}`,
        title: fmt(CFG.options?.layer, { value: layer }),
      })
    );

    return `<section class="series-group">
      <div class="option-grid option-grid--compact">${options.join("") || `<p class="group-empty">${esc(CFG.options?.empty || "")}</p>`}</div>
    </section>`;
  }

  /* ------------------------------------------------------------------------
     Result model
     ------------------------------------------------------------------------ */

  function buildMeta(layers, colors) {
    const parts = [];
    if (layers.length) {
      parts.push(
        fmt(CFG.result?.metaLayers, {
          layers: layers
            .map((layer) => fmt(CFG.result?.layerValue, { value: layer }))
            .join(CFG.result?.colorJoiner || "、"),
        })
      );
    }
    if (colors.length) {
      parts.push(
        fmt(CFG.result?.metaColors, {
          colors: colors.map(colorLabel).join(CFG.result?.colorJoiner || "、"),
        })
      );
    }
    if (!parts.length) return "";
    return fmt(CFG.result?.metaWrap, {
      content: parts.join(CFG.result?.metaJoiner || " · "),
    });
  }

  function sortResultItems(a, b) {
    const kindOrder = { stand: 0, floor: 1 };
    return (
      (kindOrder[a.kind] ?? 9) - (kindOrder[b.kind] ?? 9) ||
      Number(b.height) - Number(a.height) ||
      collator.compare(a.model || "", b.model || "") ||
      Number(b.width || 0) - Number(a.width || 0) ||
      collator.compare(a.comboName || "", b.comboName || "")
    );
  }

  function buildResultText(groups) {
    const lines = [];
    groups.forEach((group) => {
      if (!group.items.length) return;
      lines.push(
        fmt(
          group.mode === "combo" ? CFG.result?.comboHeading : CFG.result?.seriesHeading,
          { series: group.series }
        )
      );
      if (group.meta) lines.push(group.meta);

      const stands = group.items.filter((item) => item.kind === "stand");
      const floors = group.items.filter((item) => item.kind !== "stand");

      stands.forEach((item) => {
        lines.push(
          item.prefix +
            item.name +
            (item.extra ? `${CFG.result?.metaJoiner || " · "}${item.extra}` : "")
        );
      });
      if (stands.length && floors.length) lines.push("");
      floors.forEach((item) => {
        lines.push(
          item.prefix +
            item.name +
            (item.extra ? `${CFG.result?.metaJoiner || " · "}${item.extra}` : "")
        );
      });
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  function buildSingleResult() {
    const groupsMap = new Map();
    selectedSeriesList().forEach((series) => groupsMap.set(series, new Map()));
    const modelKeys = new Set();
    let total = 0;

    for (const record of records) {
      if (!selections.series.has(record.s)) continue;
      if (!selections.models.has(key(record.s, record.m))) continue;
      if (!selections.widths.has(key(record.s, record.w))) continue;

      const styleOptions = heightsOf(record.hg).filter((option) =>
        selections.styles.has(key(record.s, option.height))
      );
      const colors = record.c.filter((color) =>
        selections.colors.has(key(record.s, color))
      );
      const layers = layersOf(record.hg).filter((layer) =>
        selections.layers.has(key(record.s, layer))
      );

      if (!styleOptions.length || !colors.length || !layers.length) continue;

      total += styleOptions.length * colors.length * layers.length;
      modelKeys.add(key(record.s, record.m));

      const specMap = groupsMap.get(record.s);
      styleOptions.forEach((option) => {
        const specKey = `${record.m}|${record.hg}|${option.height}|${record.w}`;
        if (!specMap.has(specKey)) {
          specMap.set(specKey, {
            model: record.m,
            width: record.w,
            height: option.height,
            heightGroup: record.hg,
            kind: option.kind,
            layers: new Set(),
            colors: new Set(),
            pending: false,
          });
        }
        const item = specMap.get(specKey);
        layers.forEach((layer) => item.layers.add(layer));
        colors.forEach((color) => item.colors.add(color));
        if (record.flag) item.pending = true;
      });
    }

    const groups = [];
    let specs = 0;

    for (const series of selectedSeriesList()) {
      const specMap = groupsMap.get(series);
      if (!specMap || !specMap.size) continue;
      const items = Array.from(specMap.values());
      let commonLayers = new Set(items[0].layers);
      let commonColors = new Set(items[0].colors);

      for (let index = 1; index < items.length; index += 1) {
        commonLayers = new Set(
          Array.from(commonLayers).filter((value) => items[index].layers.has(value))
        );
        commonColors = new Set(
          Array.from(commonColors).filter((value) => items[index].colors.has(value))
        );
      }

      const sortedLayers = sortLayers(commonLayers);
      const sortedColors = sortColors(commonColors);
      const meta = buildMeta(sortedLayers, sortedColors);

      items.sort(sortResultItems);
      const displayItems = items.map((item) => {
        const diffLayers = sortLayers(
          Array.from(item.layers).filter((layer) => !commonLayers.has(layer))
        );
        const diffColors = sortColors(
          Array.from(item.colors).filter((color) => !commonColors.has(color))
        );
        const extraParts = [];
        if (diffLayers.length) {
          extraParts.push(
            fmt(CFG.result?.extraLayers, {
              layers: diffLayers
                .map((layer) => fmt(CFG.result?.layerValue, { value: layer }))
                .join(CFG.result?.colorJoiner || "、"),
            })
          );
        }
        if (diffColors.length) {
          extraParts.push(
            fmt(CFG.result?.extraColors, {
              colors: diffColors.map(colorLabel).join(CFG.result?.colorJoiner || "、"),
            })
          );
        }
        return {
          kind: item.kind,
          height: item.height,
          prefix: fmt(
            item.kind === "stand" ? CFG.result?.standingPrefix : CFG.result?.floorPrefix,
            { height: item.height }
          ),
          name: fmt(CFG.result?.itemName, {
            model: item.model,
            width: item.width,
          }),
          extra: extraParts.join(CFG.result?.metaJoiner || " · "),
          pending: item.pending ? CFG.result?.pending || "" : "",
        };
      });

      specs += displayItems.length;
      groups.push({ mode: "single", series, meta, items: displayItems });
    }

    const text = buildResultText(groups);
    return {
      mode: "single",
      groups,
      total,
      specs,
      models: modelKeys.size,
      hasRows: specs > 0 && Boolean(text),
      text,
    };
  }

  function buildComboResult() {
    const context = getComboContext();
    const selectedColors = selectedComboColors();
    const selectedLayers = selectedComboLayers();
    const groupMap = new Map();
    const modelKeys = new Set();
    let total = 0;

    for (const info of context.validGroups) {
      const heights = [];
      const hgs = new Set((info.records || []).map((record) => record.hg));
      hgs.forEach((heightGroup) => {
        heightsOf(heightGroup).forEach((option) => {
          if (selections.styles.has(key(heightGroup, option.height))) {
            heights.push({ heightGroup, ...option });
          }
        });
      });

      const pending = (info.records || []).some((record) => Boolean(record.flag));
      (info.records || []).forEach((record) => modelKeys.add(key(record.s, record.m)));

      total += heights.length * selectedColors.length * selectedLayers.length;

      if (!heights.length) continue;
      if (!groupMap.has(info.s)) groupMap.set(info.s, []);

      const comboName = info.validItems
        .map((value) => {
          const parsed = parseComboItem(value, info.s);
          const isMixed = info.s === MIXED_SERIES || parsed.series !== info.s;
          return fmt(isMixed ? CFG.result?.comboItemMixed : CFG.result?.comboItem, {
            series: parsed.series,
            model: parsed.model,
            width: parsed.width,
          });
        })
        .join(CFG.result?.comboSeparator || " + ");

      heights.forEach((option) => {
        groupMap.get(info.s).push({
          kind: option.kind,
          height: option.height,
          comboName,
          pending,
        });
      });
    }

    const meta = buildMeta(selectedLayers, selectedColors);
    const groups = [];
    let specs = 0;

    for (const series of selectedSeriesList()) {
      const items = groupMap.get(series);
      if (!items || !items.length) continue;
      items.sort(sortResultItems);
      const displayItems = items.map((item) => ({
        kind: item.kind,
        height: item.height,
        prefix: fmt(
          item.kind === "stand" ? CFG.result?.standingPrefix : CFG.result?.floorPrefix,
          { height: item.height }
        ),
        name: item.comboName,
        extra: "",
        pending: item.pending ? CFG.result?.pending || "" : "",
      }));
      specs += displayItems.length;
      groups.push({ mode: "combo", series, meta, items: displayItems });
    }

    const text = buildResultText(groups);
    return {
      mode: "combo",
      groups,
      total,
      specs,
      models: modelKeys.size,
      hasRows: specs > 0 && Boolean(text),
      text,
    };
  }

  function buildResultModel() {
    const model = state.mode === "combo" ? buildComboResult() : buildSingleResult();
    state.lastResult = model;
    return model;
  }

  function renderResultStep() {
    const model = buildResultModel();
    const empty = `<div class="empty-state">
      <div class="empty-state__art" aria-hidden="true">${ICONS.cabinet}</div>
      <h3>${esc(CFG.result?.emptyTitle || "")}</h3>
      <p>${esc(CFG.result?.empty || "")}</p>
    </div>`;

    const stats = `<div class="result-stats">
      <div class="stat-card"><div class="stat-card__value">${esc(model.total)}</div><div class="stat-card__label">${esc(CFG.result?.totalLabel || "")}</div></div>
      <div class="stat-card"><div class="stat-card__value">${esc(model.specs)}</div><div class="stat-card__label">${esc(CFG.result?.specsLabel || "")}</div></div>
      <div class="stat-card"><div class="stat-card__value">${esc(model.models)}</div><div class="stat-card__label">${esc(CFG.result?.modelsLabel || "")}</div></div>
    </div>`;

    if (!model.groups.length) {
      return stats + empty;
    }

    const groups = model.groups
      .map((group, groupIndex) => {
        const rows = group.items
          .map(
            (item) => `<div class="result-row">
              <span class="pill pill--${item.kind === "stand" ? "stand" : "floor"}">${esc(String(item.prefix).trim())}</span>
              <span class="result-row__name">${esc(item.name)}</span>
              ${item.extra ? `<span class="result-row__extra">${esc(item.extra)}</span>` : ""}
              ${item.pending ? `<span class="tag--warning">${esc(item.pending)}</span>` : ""}
            </div>`
          )
          .join("");

        return `<section class="result-series">
          <div class="result-series__head">
            <h4 class="result-series__title">${esc(fmt(group.mode === "combo" ? CFG.result?.comboHeading : CFG.result?.seriesHeading, { series: group.series }))}</h4>
            <span class="badge">${esc(fmt(CFG.result?.specCount, { count: group.items.length }))}</span>
          </div>
          ${group.meta ? `<div class="result-series__meta">${esc(group.meta)}</div>` : ""}
          ${rows || empty}
          ${groupIndex < model.groups.length - 1 ? '<div class="result-spacer" aria-hidden="true"></div>' : ""}
        </section>`;
      })
      .join("");

    const countLabel = fmt(CFG.result?.specCount, { count: model.specs });

    return `${stats}
      <div class="result-card">
        <div class="result-card__head">
          <div>
            <div class="result-card__title">${esc(CFG.result?.listTitle || "")}</div>
            <p class="result-card__hint">${esc(CFG.result?.copyHint || "")}</p>
          </div>
          <span class="result-card__count">${esc(countLabel)}</span>
        </div>
        <div class="result-list">${groups}</div>
      </div>`;
  }

  function renderMainContent() {
    const step = currentStep();
    if (!step) return "";
    if (step.key === "result") return renderResultStep();
    if (state.mode === "single") {
      if (step.key === "series") return renderSeriesStep();
      if (step.key === "model") return renderModelStep();
      if (step.key === "width") return renderWidthStep();
      if (step.key === "style") return renderStyleStepSingle();
      if (step.key === "color") return renderColorStepSingle();
      if (step.key === "layer") return renderLayerStepSingle();
    } else {
      if (step.key === "series") return renderSeriesStep();
      if (step.key === "combo") return renderComboStep();
      if (step.key === "style") return renderComboStyleStep();
      if (step.key === "color") return renderComboColorStep();
      if (step.key === "layer") return renderComboLayerStep();
    }
    return `<p class="group-empty">${esc(CFG.options?.empty || "")}</p>`;
  }

  function renderFooter() {
    const steps = getSteps();
    const isResult = currentStep()?.key === "result";
    const atStart = state.step === 0;
    const ready = isStepReady(state.step);

    if (isResult) {
      const model = state.lastResult || buildResultModel();
      return `<button class="btn btn--ghost" type="button" data-nav="prev">${ICONS.arrowLeft}<span>${esc(CFG.common?.prev || "")}</span></button>
        <div class="footer-actions">
          <button class="btn btn--ghost" type="button" data-nav="restart">${ICONS.restart}<span>${esc(CFG.common?.restart || "")}</span></button>
          <button class="btn btn--primary" type="button" data-nav="copy" ${model.total > 0 && model.hasRows ? "" : "disabled"}>${ICONS.copy}<span>${esc(CFG.common?.copy || "")}</span></button>
        </div>`;
    }

    return `<button class="btn btn--ghost" type="button" data-nav="prev" ${atStart ? "disabled" : ""}>${ICONS.arrowLeft}<span>${esc(CFG.common?.prev || "")}</span></button>
      <div class="footer-actions">
        <button class="btn btn--primary" type="button" data-nav="next" ${ready ? "" : "disabled"} ${ready ? "" : `title="${esc(CFG.common?.lockedStep || "")}"`}>
          <span>${esc(CFG.common?.next || "")}</span>${ICONS.arrowRight}
        </button>
      </div>`;
  }

  function render({ animate = false, preserveScroll = false, focusChoice = null } = {}) {
    const scrollY = preserveScroll ? window.scrollY : null;
    const current = currentStep();

    renderModeMetrics();
    renderSteps();
    renderStepHeader();
    renderSummary();
    ui.mainContent.innerHTML = renderMainContent();
    ui.wizardFooter.innerHTML = renderFooter();

    if (animate) {
      ui.mainContent.classList.remove("is-enter");
      void ui.mainContent.offsetWidth;
      ui.mainContent.classList.add("is-enter");
    } else {
      ui.mainContent.classList.remove("is-enter");
    }

    const isResult = current?.key === "result";
    ui.mainContent.setAttribute("aria-busy", "false");
    ui.wizard.classList.toggle("is-result", Boolean(isResult));

    if (preserveScroll && scrollY != null) {
      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }

    if (focusChoice) {
      window.requestAnimationFrame(() => {
        const match = $$("[data-choice]", ui.mainContent).find(
          (element) =>
            element.dataset.choice === focusChoice.value &&
            element.dataset.kind === focusChoice.kind
        );
        match?.focus({ preventScroll: true });
      });
    }

    window.requestAnimationFrame(() => {
      state.pulse = "";
    });
  }

  function scrollToWizard() {
    const headerRect = ui.header?.getBoundingClientRect();
    const workbenchSticky =
      ui.workbench && window.matchMedia("(min-width: 961px)").matches;
    const stickyWorkbench = workbenchSticky
      ? ui.workbench.getBoundingClientRect().height
      : 0;
    const stickyTop = workbenchSticky
      ? parseFloat(window.getComputedStyle(ui.workbench).top) || headerRect?.bottom || 0
      : headerRect?.bottom || 0;
    const reserved = stickyTop + stickyWorkbench + 16;
    const top = window.scrollY + ui.wizard.getBoundingClientRect().top - reserved;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  }

  function goToStep(index, { focus = false } = {}) {
    const steps = getSteps();
    if (index < 0 || index >= steps.length) return;
    if (index > state.step && !isStepReady(state.step)) return;
    state.step = index;
    state.pulse = "";
    render({ animate: true });
    scrollToWizard();
    if (focus) {
      window.requestAnimationFrame(() => {
        ui.stepTitle.setAttribute("tabindex", "-1");
        ui.stepTitle.focus({ preventScroll: true });
      });
    }
  }

  /* ------------------------------------------------------------------------
     Announcements
     ------------------------------------------------------------------------ */

  function announcementKey(announcement) {
    return `${announcement.id || announcement.title || "announcement"}::${announcement.publishedAt || ""}`;
  }

  function readDismissed() {
    try {
      const raw = dismissStorage?.getItem(DISMISS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function dismissedSet() {
    return new Set(readDismissed());
  }

  function dismissAnnouncement(announcement) {
    const dismissed = readDismissed().filter((entry) => typeof entry === "string");
    dismissed.push(announcementKey(announcement));
    try {
      dismissStorage?.setItem(DISMISS_KEY, JSON.stringify(dismissed.slice(-40)));
    } catch {
      /* storage is optional */
    }
  }

  function parseExpiry(value) {
    if (!value) return NaN;
    const text = String(value);
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T23:59:59` : text);
    return date.getTime();
  }

  function activeAnnouncements() {
    const now = Date.now();
    return (Array.isArray(CFG.announcements) ? CFG.announcements : [])
      .filter((announcement) => {
        if (!announcement || announcement.active === false) return false;
        const published = announcement.publishedAt
          ? new Date(announcement.publishedAt).getTime()
          : NaN;
        if (Number.isFinite(published) && published > now) return false;
        const expires = parseExpiry(announcement.expiresAt);
        if (Number.isFinite(expires) && expires < now) return false;
        return true;
      })
      .sort((a, b) => {
        const pinned = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
        if (pinned) return pinned;
        return (
          (new Date(b.publishedAt || 0).getTime() || 0) -
          (new Date(a.publishedAt || 0).getTime() || 0)
        );
      });
  }

  function toneOf(announcement) {
    return ["info", "success", "warning", "important"].includes(announcement?.tone)
      ? announcement.tone
      : "info";
  }

  function renderNotice() {
    if (!dismissStorage) {
      dismissStorage = safeStorage(IS_PREVIEW ? "session" : "local");
    }
    const announcements = activeAnnouncements();
    ui.noticeDot.hidden = announcements.length === 0;

    if (!announcements.length || CFG.settings?.announcementBanner === false) {
      ui.noticeSlot.innerHTML = "";
      return;
    }

    const dismissed = dismissedSet();
    const notice = announcements.find((announcement) => !dismissed.has(announcementKey(announcement)));
    if (!notice) {
      ui.noticeSlot.innerHTML = "";
      return;
    }

    const published = notice.publishedAt
      ? fmt(CFG.announcement?.published, { date: formatDate(notice.publishedAt) })
      : "";
    const actionLabel = announcements.length > 1 ? CFG.announcement?.viewAll : CFG.announcement?.readMore;
    const dismissible = notice.dismissible !== false;

    ui.noticeSlot.innerHTML = `<article class="notice glass" data-tone="${esc(toneOf(notice))}">
      <div class="notice__content">
        <div class="notice__meta">
          <span class="notice__badge">${esc(notice.badge || CFG.announcement?.badge || "")}</span>
          ${notice.pinned ? `<span class="notice__pinned">${esc(CFG.announcement?.pinned || "")}</span>` : ""}
          ${published ? `<span>${esc(published)}</span>` : ""}
        </div>
        <h3 class="notice__title">${esc(notice.title || "")}</h3>
        ${notice.body ? `<p class="notice__body">${esc(notice.body)}</p>` : ""}
      </div>
      <div class="notice__actions">
        <button class="btn btn--ghost" type="button" data-action="open-announcements">${esc(actionLabel || "")}</button>
        ${dismissible ? `<button class="notice__close" type="button" data-action="dismiss-notice" aria-label="${esc(CFG.announcement?.dismiss || "")}">${ICONS.close}</button>` : ""}
      </div>
    </article>`;
  }

  function announcementItemMarkup(announcement) {
    const link = safeHref(announcement.linkHref);
    const published = announcement.publishedAt
      ? fmt(CFG.announcement?.published, { date: formatDate(announcement.publishedAt) })
      : "";
    const expires = announcement.expiresAt
      ? fmt(CFG.announcement?.expires, { date: formatDate(announcement.expiresAt) })
      : "";
    return `<article class="announcement-item" data-tone="${esc(toneOf(announcement))}">
      <div class="announcement-item__meta">
        <span class="announcement-item__badge">${esc(announcement.badge || CFG.announcement?.badge || "")}</span>
        ${announcement.pinned ? `<span>${esc(CFG.announcement?.pinned || "")}</span>` : ""}
        ${published ? `<span>${esc(published)}</span>` : ""}
        ${expires ? `<span>${esc(expires)}</span>` : ""}
      </div>
      <h3 class="announcement-item__title">${esc(announcement.title || "")}</h3>
      ${announcement.body ? `<p class="announcement-item__body">${esc(announcement.body)}</p>` : ""}
      ${
        link
          ? `<a class="announcement-item__link" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${esc(announcement.linkText || CFG.announcement?.readMore || "")}${ICONS.external}</a>`
          : ""
      }
    </article>`;
  }

  function openAnnouncements() {
    const announcements = activeAnnouncements();
    const content = announcements.length
      ? `<div class="announcement-list">${announcements.map(announcementItemMarkup).join("")}</div>`
      : `<p class="announcement-empty">${esc(CFG.dialogs?.announcementEmpty || CFG.announcement?.empty || "")}</p>`;

    openModal(`<div class="modal modal--announcement" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">
      <button class="modal__close" type="button" data-close-modal aria-label="${esc(CFG.common?.close || "")}">${ICONS.close}</button>
      <div class="modal__header">
        <p class="modal__eyebrow">${esc(CFG.nav?.announcements || "")}</p>
        <h2 class="modal__title" id="modalTitle">${esc(CFG.dialogs?.announcementTitle || "")}</h2>
      </div>
      <div class="modal__scroll">${content}</div>
      <div class="modal__footer">
        <button class="btn btn--ghost" type="button" data-close-modal>${esc(CFG.dialogs?.announcementClose || CFG.common?.close || "")}</button>
      </div>
    </div>`);
  }

  /* ------------------------------------------------------------------------
     Help
     ------------------------------------------------------------------------ */

  function openHelp() {
    const helps = Array.isArray(CFG.help?.steps) ? CFG.help.steps : [];
    const tips = Array.isArray(CFG.help?.tips) ? CFG.help.tips : [];
    const helpGrid = helps.length
      ? `<div class="help-grid">${helps
          .map(
            (item, index) => `<article class="help-item">
              <div class="help-item__num">${String(index + 1).padStart(2, "0")}</div>
              <h3>${esc(item.title || "")}</h3>
              <p>${esc(item.body || "")}</p>
            </article>`
          )
          .join("")}</div>`
      : "";
    const tipsBlock = tips.length
      ? `<div class="help-tips">
          <h3>${esc(CFG.help?.tipsTitle || "")}</h3>
          <ul>${tips.map((tip) => `<li>${esc(tip)}</li>`).join("")}</ul>
        </div>`
      : "";

    openModal(`<div class="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">
      <button class="modal__close" type="button" data-close-modal aria-label="${esc(CFG.common?.close || "")}">${ICONS.close}</button>
      <div class="modal__header">
        <p class="modal__eyebrow">${esc(CFG.help?.kicker || "")}</p>
        <h2 class="modal__title" id="modalTitle">${esc(CFG.dialogs?.helpTitle || "")}</h2>
        <p class="modal__lead">${esc(CFG.help?.subtitle || "")}</p>
      </div>
      <div class="modal__scroll">
        <p class="help-intro">${esc(CFG.help?.intro || "")}</p>
        ${helpGrid}
        ${tipsBlock}
        <p class="help-footer">${esc(CFG.help?.footer || "")}</p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--primary" type="button" data-close-modal>${esc(CFG.dialogs?.helpClose || CFG.common?.close || "")}</button>
      </div>
    </div>`);
  }

  /* ------------------------------------------------------------------------
     Copy modal and clipboard
     ------------------------------------------------------------------------ */

  function openCopyModal() {
    const submitUrl = safeHref(CFG.dialogs?.submitUrl);
    openModal(`<div class="modal modal--copy" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">
      <button class="modal__close" type="button" data-close-modal aria-label="${esc(CFG.common?.close || "")}">${ICONS.close}</button>
      <div class="modal__body">
        <div class="success-orb" aria-hidden="true">${ICONS.check}</div>
        <h2 class="modal__title" id="modalTitle">${esc(CFG.dialogs?.copyTitle || "")}</h2>
        <p class="modal__text">${esc(CFG.dialogs?.copyBody || "")}</p>
        <div class="modal__actions">
          <button class="btn btn--ghost" type="button" data-modal-action="continue">${esc(CFG.dialogs?.continue || "")}</button>
          ${
            submitUrl
              ? `<button class="btn btn--primary" type="button" data-modal-action="submit">${esc(CFG.dialogs?.submit || "")}${ICONS.external}</button>`
              : ""
          }
        </div>
      </div>
    </div>`);
  }

  async function writeClipboard(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* fall back below */
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    textarea.remove();
    return copied;
  }

  async function copyCurrent() {
    const model = buildResultModel();
    if (!model.hasRows || !model.text) {
      showToast(CFG.common?.copyFailedToast || "", "error");
      return;
    }
    const success = await writeClipboard(model.text);
    if (!success) {
      showToast(CFG.common?.copyFailedToast || "", "error");
      return;
    }
    showToast(CFG.common?.copiedToast || CFG.common?.copied || "");
    window.setTimeout(() => openCopyModal(), 180);
  }

  /* ------------------------------------------------------------------------
     Modal shell
     ------------------------------------------------------------------------ */

  function openModal(markup) {
    window.clearTimeout(modalTimer);
    if (!ui.modalLayer.classList.contains("is-open")) {
      modalReturnFocus = document.activeElement;
    }
    ui.modalLayer.innerHTML = markup;
    ui.modalLayer.setAttribute("aria-hidden", "false");
    ui.modalLayer.classList.add("is-open");
    document.body.classList.add("is-locked");
    window.requestAnimationFrame(() => {
      ui.modalLayer.querySelector(".modal")?.focus({ preventScroll: true });
    });
  }

  function closeModal({ restoreFocus = true } = {}) {
    if (!ui.modalLayer.classList.contains("is-open")) return;
    ui.modalLayer.classList.remove("is-open");
    ui.modalLayer.setAttribute("aria-hidden", "true");
    window.clearTimeout(modalTimer);
    modalTimer = window.setTimeout(() => {
      if (!ui.modalLayer.classList.contains("is-open")) {
        ui.modalLayer.innerHTML = "";
        document.body.classList.remove("is-locked");
      }
    }, reduceMotion.matches ? 20 : 340);

    if (restoreFocus) {
      const target = modalReturnFocus;
      modalReturnFocus = null;
      window.setTimeout(() => {
        if (target && document.contains(target)) target.focus({ preventScroll: true });
      }, reduceMotion.matches ? 20 : 340);
    }
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab" || !ui.modalLayer.classList.contains("is-open")) return;
    const modal = ui.modalLayer.querySelector(".modal");
    if (!modal) return;
    const focusable = $$(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      modal
    ).filter((element) => element.getClientRects().length > 0);

    if (!focusable.length) {
      event.preventDefault();
      modal.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */

  function showToast(message, type = "success") {
    if (!message) return;
    ui.toastText.textContent = message;
    ui.toast.classList.toggle("is-error", type === "error");
    const icon = ui.toast.querySelector(".toast__icon");
    if (icon) icon.innerHTML = type === "error" ? ICONS.alert : ICONS.check;
    ui.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      ui.toast.classList.remove("is-visible");
    }, 2600);
  }

  /* ------------------------------------------------------------------------
     Interaction
     ------------------------------------------------------------------------ */

  function selectionFor(kind) {
    return selections[SET_BY_KIND[kind]];
  }

  function toggleChoice(kind, value) {
    const set = selectionFor(kind);
    if (!set) return;
    if (set.has(value)) set.delete(value);
    else set.add(value);
    pruneSelections();
    state.pulse = `${kind}::${value}`;
    render({ preserveScroll: true, focusChoice: { kind, value } });
  }

  function selectVisibleGlobal(kind, shouldSelect) {
    const set = selectionFor(kind);
    if (!set) return;
    if (!shouldSelect) {
      set.clear();
    } else {
      $$(`[data-choice][data-kind="${kind}"]`, ui.mainContent).forEach((element) => {
        set.add(element.dataset.choice);
      });
    }
    pruneSelections();
    state.pulse = "";
    render({ preserveScroll: true });
  }

  function selectVisibleGroup(kind, target, shouldSelect) {
    const group = target.closest(".series-group");
    if (!group) return;
    const set = selectionFor(kind);
    if (!set) return;
    if (shouldSelect) {
      $$(`[data-choice][data-kind="${kind}"]`, group).forEach((element) => {
        set.add(element.dataset.choice);
      });
    } else {
      $$(`[data-choice][data-kind="${kind}"]`, group).forEach((element) => {
        set.delete(element.dataset.choice);
      });
    }
    pruneSelections();
    state.pulse = "";
    render({ preserveScroll: true });
  }

  function onChoiceClick(button) {
    const kind = button.dataset.kind;
    const value = button.dataset.choice || "";
    if (!kind || !value) return;
    toggleChoice(kind, value);
  }

  function handleComboAction(action, target) {
    const series = target.dataset.comboSeries;
    if (!series) return;
    const groupIndex = Number(target.dataset.groupIndex);
    ensureComboConfigs();
    const groups = comboConfigs[series];
    if (!Array.isArray(groups)) return;

    if (action === "add-combo") {
      groups.push({ items: ["", ""], selected: false });
    } else if (action === "add-combo-item") {
      const group = groups[groupIndex];
      if (group && group.items.length < 3) {
        group.items.push("");
      }
    } else if (action === "copy-combo") {
      const group = groups[groupIndex];
      if (group) {
        groups.splice(groupIndex + 1, 0, {
          items: [...group.items],
          selected: false,
        });
      }
    } else if (action === "delete-combo") {
      if (groups[groupIndex]) {
        groups.splice(groupIndex, 1);
        if (!groups.length) groups.push({ items: ["", ""], selected: false });
      }
    } else if (action === "batch-copy") {
      const copies = [];
      groups.forEach((group) => {
        if (group.selected) {
          copies.push({ items: [...group.items], selected: false });
          group.selected = false;
        }
      });
      if (!copies.length) return;
      groups.push(...copies);
      showToast(fmt(CFG.combo?.batchCopyDone, { count: copies.length }));
    }

    pruneSelections();
    render({ preserveScroll: true });
  }

  function onDocumentClick(event) {
    const pickerTrigger = event.target.closest("[data-combo-picker]");
    if (pickerTrigger) {
      openComboPicker(pickerTrigger);
      return;
    }

    const closeButton = event.target.closest("[data-close-modal]");
    if (closeButton) {
      closeModal();
      return;
    }

    const modalAction = event.target.closest("[data-modal-action]");
    if (modalAction) {
      const action = modalAction.dataset.modalAction;
      if (action === "continue") {
        closeModal({ restoreFocus: false });
        resetAllState();
        syncModeSwitch();
        render({ animate: true });
        scrollToWizard();
        showToast(CFG.common?.resetToast || "");
      } else if (action === "submit") {
        const url = safeHref(CFG.dialogs?.submitUrl);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
        closeModal();
      }
      return;
    }

    const modeButton = event.target.closest("[data-mode]");
    if (modeButton) {
      setMode(modeButton.dataset.mode, { focus: true });
      return;
    }

    const choice = event.target.closest("[data-choice]");
    if (choice) {
      onChoiceClick(choice);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton && !(actionButton instanceof HTMLInputElement)) {
      const action = actionButton.dataset.action;
      if (action === "dismiss-notice") {
        const notice = activeAnnouncements().find(
          (announcement) => !dismissedSet().has(announcementKey(announcement))
        );
        if (notice) dismissAnnouncement(notice);
        renderNotice();
        ui.announcementButton.focus({ preventScroll: true });
        return;
      }
      if (action === "open-announcements") {
        openAnnouncements();
        return;
      }
      if (action === "select-all-global") {
        selectVisibleGlobal(actionButton.dataset.kind, true);
        return;
      }
      if (action === "select-none-global") {
        selectVisibleGlobal(actionButton.dataset.kind, false);
        return;
      }
      if (action === "select-all-group") {
        selectVisibleGroup(actionButton.dataset.kind, actionButton, true);
        return;
      }
      if (action === "select-none-group") {
        selectVisibleGroup(actionButton.dataset.kind, actionButton, false);
        return;
      }
      if (
        action === "add-combo" ||
        action === "add-combo-item" ||
        action === "copy-combo" ||
        action === "delete-combo" ||
        action === "batch-copy"
      ) {
        handleComboAction(action, actionButton);
        return;
      }
    }

    const stepButton = event.target.closest("[data-step]");
    if (stepButton && !stepButton.disabled) {
      const nextIndex = Number(stepButton.dataset.step);
      if (Number.isInteger(nextIndex) && nextIndex !== state.step) {
        goToStep(nextIndex, { focus: true });
      }
      return;
    }

    const jumpButton = event.target.closest("[data-jump]");
    if (jumpButton) {
      const nextIndex = Number(jumpButton.dataset.jump);
      if (Number.isInteger(nextIndex) && nextIndex !== state.step) {
        goToStep(nextIndex, { focus: true });
      }
      return;
    }

    const navButton = event.target.closest("[data-nav]");
    if (navButton && !navButton.disabled) {
      const action = navButton.dataset.nav;
      if (action === "prev") {
        goToStep(state.step - 1, { focus: true });
      } else if (action === "next") {
        if (isStepReady(state.step)) goToStep(state.step + 1, { focus: true });
      } else if (action === "restart") {
        resetAllState();
        syncModeSwitch();
        render({ animate: true });
        scrollToWizard();
        showToast(CFG.common?.resetToast || "");
      } else if (action === "copy") {
        copyCurrent();
      }
    }
  }

  function onDocumentChange(event) {
    const checkbox = event.target.closest(".combo-check-input");
    if (checkbox) {
      const series = checkbox.dataset.comboSeries;
      const groupIndex = Number(checkbox.dataset.groupIndex);
      const group = comboConfigs[series]?.[groupIndex];
      if (group) {
        group.selected = checkbox.checked;
        render({ preserveScroll: true });
        const nextCheckbox = ui.mainContent.querySelector(
          `.combo-check-input[data-combo-series="${CSS.escape(series)}"][data-group-index="${groupIndex}"]`
        );
        nextCheckbox?.focus({ preventScroll: true });
      }
    }
  }

  function bindEvents() {
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("change", onDocumentChange);
    ui.announcementButton.addEventListener("click", openAnnouncements);
    ui.helpButton.addEventListener("click", openHelp);
    ui.themeToggle.addEventListener("click", toggleTheme);
    ui.pickerLayer.addEventListener("click", onPickerClick);
    ui.modeSwitches.forEach((switcher) => {
      switcher.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const buttons = $$(".segment", switcher);
        const currentIndex = buttons.findIndex((button) => button.dataset.mode === state.mode);
        let nextIndex = currentIndex;
        if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = buttons.length - 1;
        setMode(buttons[nextIndex].dataset.mode, { focus: true });
      });
    });
    ui.modalLayer.addEventListener("mousedown", (event) => {
      if (event.target === ui.modalLayer) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (!ui.modalLayer.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      trapModalFocus(event);
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */

  function cacheDom() {
    ui = {
      header: $("#siteHeader"),
      skipLink: $("#skipLink"),
      brandMark: $("#brandMark"),
      brandName: $("#brandName"),
      brandTagline: $("#brandTagline"),
      announcementButton: $("#announcementButton"),
      announcementLabel: $("#announcementLabel"),
      noticeDot: $("#noticeDot"),
      helpButton: $("#helpButton"),
      helpLabel: $("#helpLabel"),
      themeToggle: $("#themeToggle"),
      noticeSlot: $("#noticeSlot"),
      heroEyebrow: $("#heroEyebrow"),
      heroTitle: $("#heroTitle"),
      heroSubtitle: $("#heroSubtitle"),
      heroMetrics: $("#heroMetrics"),
      modeSwitches: $$("[data-mode-switch]"),
      modeCaptions: $$(".mode-panel__caption"),
      progressLabel: $("#progressLabel"),
      stepCount: $("#stepCount"),
      steps: $("#steps"),
      summaryPanel: $("#summaryPanel"),
      workbench: $(".workbench"),
      wizard: $("#wizard"),
      progressFill: $("#progressFill"),
      stepKicker: $("#stepKicker"),
      stepTitle: $("#stepTitle"),
      stepHint: $("#stepHint"),
      stepTools: $("#stepTools"),
      mainContent: $("#mainContent"),
      wizardFooter: $("#wizardFooter"),
      pageFooter: $("#pageFooter"),
      toast: $("#toast"),
      toastText: $("#toastText"),
      pickerLayer: $("#pickerLayer"),
      modalLayer: $("#modalLayer"),
    };
  }

  function init() {
    cacheDom();
    dismissStorage = safeStorage(IS_PREVIEW ? "session" : "local");
    applyThemeConfig();
    loadData();
    initTheme();
    populateStaticCopy();
    initModeSwitch();
    bindEvents();
    ensureComboConfigs();
    pruneSelections();
    render();
    renderNotice();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
