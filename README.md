# 这一夜，我们家都没有睡好

> 一个中国三代同堂家庭的睡眠数据叙事作品

---

## 🚀 如何运行

**⚠️ 重要：必须通过本地服务器运行，不能直接双击 HTML 文件！**

**方式一：VS Code Live Server（推荐）**
1. 安装 VS Code 扩展 "Live Server"
2. 右键 `index.html` → "Open with Live Server"
3. 浏览器自动打开

**方式二：命令行**
```bash
cd Data_storytelling
npx serve .
# 或
python -m http.server 8000
```

---

## 📁 模块化文件结构

```
Data_storytelling/
├── index.html                    ← 🧑‍💼 协调员：页面主壳，加载所有模块
├── README.md                     ← 📋 本文件
│
├── css/
│   └── styles.css                ← 🎨 设计组：全部 CSS 样式（配色/动画/布局）
│
├── js/
│   ├── data.js                   ← 📊 数据组：图表数据常量，改数据只改这里
│   ├── charts.js                 ← 📊 数据组：Chart.js 图表初始化代码
│   └── main.js                   ← 🧑‍💼 协调员：页面组件加载器 + 滚动动画
│
└── components/
    ├── cover.html                ← ✍️ 文案组：开场封面（标题+导语）
    ├── family-intro.html         ← 🎨 设计组：家庭角色卡片（含头像 SVG）
    ├── transitions.html          ← ✍️ 文案组：全部转场过渡文字
    ├── chart-containers.html     ← 📊 数据组：图表 <canvas> 容器
    ├── scene-son.html            ← 儿子场景（🎨SVG + ✍️文案 + 📊数据卡）
    ├── scene-daughter.html       ← 姐姐场景（同上）
    ├── scene-parents.html        ← 父母场景（同上）
    ├── scene-grandma.html        ← 外婆场景（同上）
    ├── scene-morning.html        ← 早晨全家场景（同上）
    ├── finale.html               ← ✍️ 文案组：结尾升华段落
    ├── data-summary.html         ← 📊 数据组：数据总览卡片 + 年龄图表
    └── footer.html               ← 📊 数据组：数据来源页脚
```

---

## 👥 团队分工指南

| 角色 | 负责文件 | 改什么 |
|------|---------|--------|
| **🎨 设计/图画** | `css/styles.css` | 配色、字体、动画、布局 |
| | 各 `scene-*.html` 中 `<!-- SVG -->` 区域 | 角色插画、场景图 |
| | `family-intro.html` 中头像 SVG | 角色头像 |
| **✍️ 文案/故事** | `cover.html` | 封面标题和导语 |
| | `transitions.html` | 所有转场金句 |
| | `finale.html` | 结尾升华文字 |
| | 各 `scene-*.html` 中 `<!-- TEXT -->` 区域 | 场景叙事文字 |
| **📊 数据/图表** | `js/data.js` | 图表数据值（改数字改这里） |
| | `js/charts.js` | 图表类型/样式调整 |
| | `chart-containers.html` | 图表位置和尺寸 |
| | `data-summary.html` | 数据总览卡片 |
| | `footer.html` | 数据来源列表 |
| | 各 `scene-*.html` 中 `<!-- DATA -->` 区域 | 场景内数据卡片 |
| **🧑‍💼 协调/整合** | `index.html` | 页面骨架和加载顺序 |
| | `js/main.js` | 组件加载逻辑 |

---

## 🔧 Scene 文件内部编辑约定

每个 scene 文件内部用注释清晰分隔，**不同人编辑不同区域，互不冲突**：

```html
<!-- ═══════════════ SVG ILLUSTRATION ═══════════════ -->
<!-- 🎨 设计组：在这里修改场景插画 -->
<svg>...</svg>
<!-- ═══════════════ END SVG ═══════════════ -->

<!-- ═══════════════ TEXT ═══════════════ -->
<!-- ✍️ 文案组：在这里修改叙事文字 -->
<div class="scene-text">...</div>
<!-- ═══════════════ END TEXT ═══════════════ -->

<!-- ═══════════════ DATA ═══════════════ -->
<!-- 📊 数据组：在这里修改数据卡片 -->
<div class="data-card">...</div>
<!-- ═══════════════ END DATA ═══════════════ -->
```

---

## 📊 数据来源

| 来源 | 内容 |
|------|------|
| 国家卫健委《健康中国行动（2019-2030）》 | 各年龄段推荐睡眠时间 |
| 北京大学 CFPS 中国家庭追踪调查 | 中国人十年睡眠变化趋势 |
| 中国睡眠研究会 × 华为《2025中国睡眠健康研究白皮书》 | 超15万用户睡眠数据 |
| 中国社会科学院《2024年中国睡眠指数报告》 | 6586人样本调查 |
| 喜临门睡眠研究院《不同就业类型群体的睡眠状况》 | 职业与睡眠差异 |
| 瑞思迈 ResMed《2026年全球睡眠调查》 | 全球睡眠障碍数据 |

---

## 🛠️ 技术栈

- 纯 HTML/CSS/JavaScript
- [Chart.js](https://www.chartjs.org/) v4.4.0（CDN）
- SVG 矢量插画（手写代码）
- Intersection Observer API（滚动动画）
- Fetch API（组件动态加载）
