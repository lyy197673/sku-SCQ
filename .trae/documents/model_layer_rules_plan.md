# 门型层板规则 Implementation Plan

## Repository Research

### 现状
- `js/catalog.js` 目前只导出 `window.SKU_CATALOG = [...]`，里面是 7 系列 × 若干门型 × 若干宽度的规格行。
- `js/app.js` 里 `layersOf(heightGroup)` 写死了规则：`1320` 高度组 → `[4,5]` 层，其余 → `[3,4,5]` 层。上轮刚加了个硬编码 `MODEL_LAYER_LIMITS = { "立三门": [3] }` 作为例外。
- 服务端 `server/server.js` 的 `renderCatalogSource(catalog)` 生成 catalog.js，`loadWorkspaceData()` 用 vm.Script 跑一遍读 `window.SKU_CATALOG`。
- 编辑器 `js/editor.js` 的 `/api/content` PUT payload 是 `{ siteConfig, catalog }`，catalog 由 `toCatalogRows(state.catalog)` 生成。
- 层板数 → 层数 换算规则：**N 个层板 = N+1 层**（N 块板把柜子分割成 N+1 个空间），用户举例「最低 2 层板、最高 4 层板 → 展开成 3/4/5 层」。

### 新需求
- 编辑器里每个门型支持配置「最低层板数」和「最高层板数」（一个门型跨系列共用同一条规则，因为层板数是结构特性）。
- 前端根据 `minBoards` ~ `maxBoards` 自动展开层数选项。
- 未配置规则的门型继续用现有 heightGroup 逻辑 fallback。

### 现有门型清单（来自 catalog）
单开圆门、单开铁门、立三门、对开圆门、对开拱门、对开铁门、二斗对开铁门、二斗对开圆门、二斗对开拱门、三开圆门、三开铁门、三斗三开圆门、三斗三开铁门、三斗三开拱门、四开铁门、单三抽、四抽柜、单门梅花、二门梅花、二斗二门梅花、三门梅花、三斗三门梅花、四门梅花、单门藤编、二门藤编、二斗二门藤编、三门藤编、三斗三门藤编、四门藤编、单门格栅、二门格栅、二斗二门格栅、三门格栅、三斗三门格栅、四门格栅、二门方压型、二斗二门方压型、三门方压型、三斗三门方压型、四门方压型、二门拱压型、二门二斗拱压型、三门拱压型、三门三斗拱压型、四门拱压型、二门鹅颈、二门二斗鹅颈、三门鹅颈、三门三斗鹅颈、四门鹅颈。

当前只发现「立三门」需要特殊规则（3 块板 → 仅 4 层），其余门型保持原有 3/4/5 层。

---

## Files and Modules

| 文件 | 改动 |
|------|------|
| `js/catalog.js` | 新增 `window.MODEL_LAYER_RULES` 段（由服务端写入，暂手动补一份立三门规则） |
| `js/app.js` | `MODEL_LAYER_LIMITS` 改为从 `window.MODEL_LAYER_RULES` 解析；保留现有 heightGroup fallback |
| `js/editor.js` | state 加 `modelMeta[]`；catalog section 顶部加"门型层板规则"表单；saveVisual payload 加 `modelMeta`；parse 链路同步 |
| `server/server.js` | `renderCatalogSource` 加 rules 参数；`loadWorkspaceData` 读 `MODEL_LAYER_RULES`；`/api/content` PUT 接收 rules；`validateCatalog` 不涉及 rules，加新的 `validateModelMeta` |
| `css/app.css` | 新表单样式（沿用现有 catalog 卡片风格即可，预计只需要补少量 class） |

---

## Implementation Steps

### 1. 服务端：catalog.js 生成/读取/校验三条链路一起打通
- `renderCatalogSource(catalog, rules)`：SKU_CATALOG 段之后追加 MODEL_LAYER_RULES 段（`window.MODEL_LAYER_RULES = {...};`）。
- `loadWorkspaceData()`：vm.Script 运行 catalog.js 后读 `sandbox.window.MODEL_LAYER_RULES ?? {}`，返回给编辑器。
- `/api/content` PUT：body 新增 `rules` 字段；`validateModelMeta(rules)` 校验每个对象结构正确（model / minBoards / maxBoards，都是正整数，max ≥ min）。

### 2. 前端 app.js：layersOf 改为从 MODEL_LAYER_RULES 解析
```
MODEL_LAYER_RULES = { "立三门": { minBoards: 3, maxBoards: 3 } }

layersOf(heightGroup, model) {
  // 1. 从 window.MODEL_LAYER_RULES 找 model 名匹配
  // 2. 若有：min = rule.minBoards + 1, max = rule.maxBoards + 1；返回 [min, min+1, ..., max]
  // 3. 若无：走现有 heightGroup fallback
}
```
删掉硬编码 MODEL_LAYER_LIMITS 常量。

### 3. 编辑器 editor.js：modelMeta 状态 + 表单 UI
- state 加 `modelMeta: []` / `originalModelMeta: []`。
- catalog 加载时，从 catalog.js 读回来的 `MODEL_LAYER_RULES` 转成 `state.modelMeta = Object.entries(rules).map(([model, rule]) => ({ model, ...rule }))`。
- `saveVisual` payload 加 `modelMeta`（直接传数组，服务端 `renderCatalogSource` 内部再转成 object map）。
- `renderCatalogSection` 顶部（所有规格行上方）加一个独立区块 `<section class="model-layer-rules">`，每行：门型名（下拉选择，选项自动从 catalog 聚合去重）、最低层板 `<input type="number" min="0">`、最高层板 `<input type="number" min="0">`、删除按钮。顶部有"添加规则"按钮。
- 校验：`validateModelMetaState()` —— 每条 rule 的 model 不能空、min/max 必须是非负整数、max ≥ min、model 名不能与 catalog 里实际门型完全不匹配（给 warning 而非 error，以防提前配置）。

### 4. 样式
新表单复用 `.catalog-series / .catalog-toolbar / input[type=number]` 风格；三列网格排布（门型 | 最低层板 | 最高层板 + 操作）。

---

## Dependencies and Considerations

- **兼容旧数据**：`catalog.js` 没有 `MODEL_LAYER_RULES` 时 vm.Script 读取为 undefined，编辑器和 app.js 都要按空对象处理，继续走 fallback。
- **门型名匹配**：规则 key 用门型名字符串精确匹配，不区分系列。
- **交集逻辑**：如果规则展开出的层数和某个 heightGroup 的 fallback 层数有重叠（例如规则 3–4 层板，但门型只在 1320 高度组），前端 `layersOf` 先取规则展开，再用现有 intersection 逻辑跟实际存在的规格行做交集——这个逻辑在 app.js 里已经有了（L508 `intersectSet`），不需要改。
- **保存原子性**：rules 是 catalog.js 的一部分，跟 SKU_CATALOG 一起写，保持一次保存原子提交。
- **localStorage 缓存**：编辑器 viewport localStorage 不涉及 rules，不需要迁移。

---

## Validation

1. **编辑器新表单独填写一条（立三门 3–3）**，保存后刷新 → catalog.js 里出现 `window.MODEL_LAYER_RULES = {"立三门":{"minBoards":3,"maxBoards":3}}`。
2. **前端组合柜/单柜模式** → 立三门卡片层数只剩 4 层（3 块板 → 4 层）；其他门型仍按 heightGroup 显示 3/4/5 或 4/5 层。
3. **未配置规则的门型** → 行为不变（单开圆门等仍 3/4/5 层）。
4. **多个系列里同名门型** → 应用同一条规则（二门梅花、二门藤编、二门格栅、二门方压型、二门拱压型、二门鹅颈都是"二门 XX"，但名字不同，所以各自独立配置——这是正确的）。
5. **app.js 语法检查**通过；编辑器保存/回退/切 tab 无报错；控制台零错误。

---

## Risks

- **规则写了但门型在 catalog 里并不存在**：校验时给 warning 而不是 error，避免提前配置被卡住。
- **minBoards / maxBoards 都填成 0**：展开后是 `[1]` 层，虽然物理上不可能，但不拦截（让数据自己说话，如果 SKU 里没有对应层数的规格行会自然被过滤掉）。
- **服务端旧版本没有 renderCatalogSource 的 rules 参数**：部署时一起更新即可，不会出现新旧不匹配。
- **之前硬编码的 MODEL_LAYER_LIMITS**：删掉，规则迁移到 MODEL_LAYER_RULES 里写一份 `{"立三门":{"minBoards":3,"maxBoards":3}}`，确保行为一致。
