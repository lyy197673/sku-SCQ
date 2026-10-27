/* 餐边柜 SKU Studio · 站点配置
 * 这里的内容由可视化编辑器维护，也可以直接编辑。
 * 所有前台可见的静态文案、主题与公告都集中在本文件中。
 */
window.SITE_CONFIG = {
  "schemaVersion": 2,
  "updatedAt": "2026-10-27T05:28:13.846Z",
  "settings": {
    "announcementBanner": true,
    "showHeroMetrics": true,
    "showFooter": true,
    "allowThemeToggle": true
  },
  "meta": {
    "title": "餐边柜标准 SKU 生成器",
    "description": "按需点选，即时生成餐边柜单柜与组合柜标准 SKU 清单。",
    "lang": "zh-CN"
  },
  "brand": {
    "mark": "SKU",
    "name": "餐边柜SKU生成器",
    "tagline": "SKU WORKSPACE"
  },
  "nav": {
    "announcements": "公告",
    "help": "使用说明",
    "themeLight": "切换为浅色外观",
    "themeDark": "切换为深色外观",
    "skip": "跳到主要内容",
    "progress": "PROGRESS",
    "catalog": "产品画册"
  },
  "hero": {
    "eyebrow": "CABINET / SKU",
    "title": "标准SKU生成",
    "subtitle": "通过点选的方式生成标准sku列表，美工老师再也不怕我写不清楚啦~",
    "metrics": [
      {
        "value": "{rowCount}",
        "label": "规格行"
      },
      {
        "value": "{seriesCount}",
        "label": "系列"
      },
      {
        "value": "{selectionCount}",
        "label": "已选维度"
      }
    ]
  },
  "modes": {
    "single": {
      "label": "单柜 SKU",
      "caption": "逐项筛选单个柜体"
    },
    "combo": {
      "label": "组合柜 SKU",
      "caption": "自由拼搭多个柜体"
    }
  },
  "steps": {
    "single": [
      {
        "key": "series",
        "nav": "系列",
        "title": "选择系列",
        "hint": "选择要制作的系列，可多选。不同系列会分别汇总。",
        "actionType": "series"
      },
      {
        "key": "model",
        "nav": "门型",
        "title": "挑选门型",
        "hint": "逐一选择各系列需要的门型，待补价款式会单独标记。",
        "actionType": "model"
      },
      {
        "key": "width",
        "nav": "宽度",
        "title": "确定宽度",
        "hint": "按系列选择柜体宽度；深度统一为 350 mm。",
        "actionType": "width"
      },
      {
        "key": "style",
        "nav": "款式",
        "title": "选择款式",
        "hint": "柜腿统一高 150 mm。站脚款含腿，落地款总高减少 150 mm。",
        "actionType": "style"
      },
      {
        "key": "color",
        "nav": "颜色",
        "title": "选择颜色",
        "hint": "按系列选择颜色，可多选组合。",
        "actionType": "color"
      },
      {
        "key": "layer",
        "nav": "层数",
        "title": "选择层数",
        "hint": "1320 高度组为 4 / 5 层，1020 与 1200 高度组为 3 / 4 / 5 层。",
        "actionType": "layer"
      },
      {
        "key": "result",
        "nav": "生成",
        "title": "生成清单",
        "hint": "核对条件后复制完整 SKU 清单，或继续调整筛选。",
        "actionType": ""
      }
    ],
    "combo": [
      {
        "key": "series",
        "nav": "系列",
        "title": "选择系列",
        "hint": "选择要制作的系列，可多选。也可以选择「混搭系列」跨系列组合。",
        "actionType": "series"
      },
      {
        "key": "combo",
        "nav": "组合",
        "title": "配置组合",
        "hint": "在每个系列下自由拼搭 2–3 个柜体；相同的组合会被自动标记。",
        "actionType": ""
      },
      {
        "key": "color",
        "nav": "颜色",
        "title": "选择颜色",
        "hint": "选择组合柜需要制作的颜色，可多选。",
        "actionType": "color"
      },
      {
        "key": "layer",
        "nav": "层数",
        "title": "选择层数",
        "hint": "按所组合的柜体高度，选择需要制作的层数。",
        "actionType": "layer"
      },
      {
        "key": "result",
        "nav": "生成",
        "title": "生成清单",
        "hint": "核对条件后复制完整 SKU 清单，或继续调整筛选。",
        "actionType": ""
      }
    ]
  },
  "common": {
    "all": "全选",
    "none": "清空",
    "allGlobal": "全选所有",
    "noneGlobal": "清空所有",
    "prev": "上一步",
    "next": "下一步",
    "restart": "重新开始",
    "copy": "复制当前列表",
    "copied": "已复制",
    "copiedToast": "SKU 清单已复制",
    "copyFailedToast": "复制失败，请稍后重试",
    "resetToast": "已重新开始选择",
    "stepOf": "第 {current} 步 / 共 {total} 步",
    "close": "关闭",
    "lockedStep": "请先完成前面的选择",
    "emptyGroup": "暂无可选项"
  },
  "summary": {
    "formats": {
      "seriesList": "{value}",
      "modelCount": "{count} 个门型",
      "widthCount": "{count} 种宽度",
      "styleCount": "{count} 种款式",
      "colorList": "{value}",
      "layerCount": "{count} 种层数",
      "comboCount": "{count} 个组合"
    },
    "joiner": "、"
  },
  "options": {
    "seriesRows": "{count} 个规格行",
    "mixSeries": "混搭系列",
    "mixSeriesDesc": "跨系列自由组合",
    "tagPending": "待补价",
    "width": "宽 {value} mm",
    "layer": "{value} 层",
    "standing": "站脚款",
    "floor": "落地款",
    "standingDesc": "有柜腿，含腿总高 {height} mm",
    "floorDesc": "落地款，总高 {height} mm",
    "styleMeta": "{label} · 高 {height} mm",
    "heightGroup": "高度组 {group}",
    "empty": "暂无可选项",
    "comboNeed": "至少需要一个包含 2 个柜子的组合",
    "comboReady": "已配置 {count} 个有效组合",
    "comboDuplicate": "发现重复组合，请调整后再继续",
    "comboOk": "条件已满足",
    "noModel": "该系列未选择门型，跳过。",
    "noWidth": "该系列尚未选齐门型和宽度，跳过。",
    "noPrereq": "该系列尚未选齐前置条件，跳过。",
    "selectAllHint": "全选当前步骤可用项"
  },
  "combo": {
    "groupLabel": "组合 {index}",
    "selectPlaceholder": "选择柜体",
    "addCabinet": "添加柜体",
    "copyGroup": "复制组合",
    "deleteGroup": "删除",
    "addGroup": "新建组合",
    "batchCopy": "复制勾选",
    "batchCopyDone": "已批量复制 {count} 个组合",
    "batchSelectHint": "勾选至少两个组合后可批量复制",
    "selectedCount": "已勾选 {count} 个",
    "duplicate": "重复",
    "item": "{model} · 宽 {width} mm",
    "itemMixed": "{series} · {model} · 宽 {width} mm",
    "separator": "+",
    "pickerTitle": "选择柜体",
    "pickerHint": "按系列和门型展开，选择需要拼搭的宽度。",
    "pickerSeriesMeta": "{count} 个门型",
    "pickerModelMeta": "{count} 个宽度",
    "pickerWidth": "{value} mm",
    "pickerClear": "清除选择",
    "pickerClose": "关闭选择",
    "pickerEmpty": "暂无可选柜体",
    "preview": "组合效果预览",
    "previewHint": "点击放大查看",
    "previewTitle": "组合效果预览",
    "previewEmpty": "请先选择柜体",
    "previewNote": "示意图，实际颜色与款式以最终清单为准。",
    "livePreview": "实时预览",
    "zoomHint": "滚轮缩放 · 拖拽移动",
    "standingShort": "站脚",
    "floorShort": "落地",
    "cabinetStyleLabel": "款式",
    "pickerStyleTitle": "选择款式",
    "pickerStyleHint": "先定宽度，再选这个柜体做站脚还是落地。",
    "pickerStyleBack": "返回宽度",
    "itemStyle": "{model}·{width}·{style}{height}",
    "itemMixedStyle": "{series}·{model}·{width}·{style}{height}",
    "pickerModeTitle": "先选站脚还是落地",
    "pickerModeHint": "选定后，下面只列出这个款式的柜子和高度。",
    "pickerModeBack": "返回款式",
    "pickerModeStandDesc": "有柜腿，含腿总高",
    "pickerModeFloorDesc": "落地款，总高",
    "removeCabinet": "移除这个柜体"
  },
  "result": {
    "kicker": "RESULT",
    "totalLabel": "SKU 总数",
    "specsLabel": "柜体规格",
    "modelsLabel": "款式数",
    "listTitle": "SKU 清单",
    "copyHint": "复制后可直接粘贴到作图任务系统",
    "emptyTitle": "暂无可生成的 SKU",
    "empty": "当前条件没有匹配的规格，请返回调整筛选，或重新开始。",
    "seriesHeading": "【{series}】",
    "comboHeading": "【{series}组合柜】",
    "itemName": "{model}（{width}）",
    "comboItem": "{model}({width})",
    "comboItemMixed": "{model}({width})",
    "metaWrap": "---{content}---",
    "metaLayers": "层板数：{layers}",
    "metaColors": "颜色：{colors}",
    "metaJoiner": " · ",
    "standingPrefix": "站脚（{height}）- ",
    "floorPrefix": "落地（{height}）- ",
    "comboSeparator": " + ",
    "pending": "待补价",
    "layerValue": "{value}层",
    "colorJoiner": "、",
    "specCount": "{count} 条",
    "comboStyledItem": "{height}{style}-{width}{model}",
    "comboStyledItemMixed": "{height}{style}-{width}{model}",
    "comboGroupedLead": "{height}{style}--",
    "comboPlainItem": "{width}{model}"
  },
  "colors": {
    "黑": "黑色",
    "白": "白色",
    "绿": "绿色"
  },
  "styleNames": {
    "870": "落地款",
    "1020": "站脚款",
    "1050": "落地款",
    "1170": "落地款",
    "1200": "站脚款",
    "1320": "站脚款"
  },
  "dialogs": {
    "copyTitle": "复制成功",
    "copyBody": "SKU 清单已复制到剪贴板，可以继续生成，或前往提交作图任务。",
    "continue": "继续生成",
    "submit": "去提交作图任务",
    "submitUrl": "https://web.wps.cn/wo/sl/v32wVBih?app_id=yy9GICgIKfzDNCNpbIkWC",
    "announcementTitle": "公告中心",
    "announcementEmpty": "暂时没有新公告。",
    "announcementClose": "知道了",
    "helpTitle": "使用说明",
    "helpClose": "开始使用"
  },
  "announcement": {
    "badge": "公告",
    "pinned": "置顶",
    "published": "发布于 {date}",
    "expires": "有效期至 {date}",
    "readMore": "查看详情",
    "dismiss": "关闭公告",
    "viewAll": "查看全部",
    "empty": "当前没有有效公告。"
  },
  "help": {
    "kicker": "GUIDE",
    "subtitle": "四步生成标准 SKU 清单",
    "intro": "这个工作台不需要登录，所有选择都在本地浏览器完成。按流程选择后，一键复制即可交付。",
    "steps": [
      {
        "title": "选择模式",
        "body": "单柜模式逐项筛选单个柜体；组合柜模式可自由拼搭 2–3 个柜体。"
      },
      {
        "title": "逐步筛选",
        "body": "单柜模式按系列、门型、宽度、款式、颜色与层数依次选择；组合柜点击柜体字段，可按系列、门型、宽度逐级展开。顶部步骤可以随时回看和修改。"
      },
      {
        "title": "核对与复制",
        "body": "生成页会汇总 SKU 总数与清单。点击「复制当前列表」，即可粘贴到作图任务系统。"
      },
      {
        "title": "三端适配",
        "body": "手机电脑平板都可正常打开使用。"
      }
    ],
    "tipsTitle": "小提示",
    "tips": [
      "带「待补价」标记的款式，请先确认价格。",
      "组合柜模式下，重复拼搭会被标红提示。",
      "复制遇到权限限制时，可刷新页面后再试。"
    ],
    "footer": "生成结果只在当前页面使用；重新开始即可清空条件，刷新页面也不会保留未复制的选择。"
  },
  "footer": {
    "note": "© 2026 餐边柜 SKU 列表生成器",
    "text": "",
    "copyright": "AAA网站开发刘桑"
  },
  "theme": {
    "accent": "#0B6BFF",
    "accentAlt": "#7559FF",
    "background": "aurora",
    "appearance": "auto",
    "radius": 28,
    "glass": 38,
    "motion": true
  },
  "announcements": [
    {
      "id": "03187b7b-84a8-4b03-ab5f-9e580a774bea",
      "title": "网站又双叒叕更新了！",
      "body": "微调了一下界面，另外右上角新增【产品画册】功能（简笔画）\n组合柜新增【组合效果实时预览】功能，更直观（自己先看看丑不丑）",
      "badge": "升级",
      "tone": "success",
      "pinned": false,
      "active": true,
      "dismissible": true,
      "publishedAt": "2026-10-27T02:42:00.000Z",
      "expiresAt": "",
      "linkText": "",
      "linkHref": ""
    }
  ],
  "catalog": {
    "kicker": "PRODUCT CATALOG",
    "title": "产品画册",
    "subtitle": "查看全部柜体线稿，支持分类、搜索、宽度和颜色筛选。",
    "searchPlaceholder": "搜索系列、门型、宽度或颜色…",
    "allSeries": "全部",
    "styleLabel": "款式",
    "stand": "站脚款",
    "floor": "落地款",
    "widthLabel": "宽度",
    "allWidths": "全部宽度",
    "colorLabel": "颜色",
    "allColors": "全部颜色",
    "count": "{count} 款柜体",
    "empty": "没有找到匹配的柜体",
    "viewLarge": "查看大图"
  }
};
