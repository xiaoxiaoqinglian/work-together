# 汽车场景评估与新车上市日历

整合了两个应用的 React 单页应用：

> 本仓库是 `work-together` 站点的一个子项目，站点根目录提供统一首页入口，访问路径为 `/car-evaluation/`。

1. **多维度场景评分看板** — 基于 Supabase 云端数据的多维度车型场景评分可视化看板
2. **新车上市日历** — 新车上市/预售/发布事件日历，从侧边栏「新车上市日历」进入

## 技术栈

- React 18 + Vite 5
- Chart.js 4（含 datalabels 插件）
- Supabase（认证 + 数据存储，通过 REST API 直连，无需 SDK）
- SheetJS（xlsx）用于 Excel 导入导出

## 功能

### 评分看板（主应用）

- 登录认证（Supabase Auth，账号支持简写自动补全域名）
- 仪表盘统计卡片、多条件筛选（价位段/动力/品牌/类别/分数区间/关键词）
- 四大图表：总分排名、二级场景多车对比折线图、价格-得分气泡图、三维钻取分析（均支持全屏）
- Top/Bottom 榜单：按任意三级场景查看车型得分 Top5/Bottom5
- 车型明细表：新增/编辑/删除车型，三级场景逐项打分（0~5 分，0.25 步进）
- Excel 导入导出（按看板格式生成多 Sheet）
- 深色/浅色主题切换、数据云端同步

### 新车上市日历

- 上市/预售/发布/首秀/发布会等事件类型，按品牌、车身类型、事件类型筛选
- 即将上市（未来约 30 天）+ 最近上市（近 7 天）+ 更远预告 三视图
- 数据源为云端 JSON（extendsclass），页面运行时拉取并写入本地缓存；云端不可达时自动回退缓存，无需重新构建即可更新内容

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

产物输出到 `dist/`，使用相对路径（`base: './'`），可托管到任意静态服务器。

## 部署

本项目作为 `work-together` 站点的子项目，为**纯静态**应用，访问路径为：

```
/car-evaluation/
```

构建与产物合并由仓库根目录的 `npm run build` 统一编排，最终产物合并到根目录 `.dist/`。当前尚未确定部署平台，待确定后在根 README 补充具体步骤。

> 注意：登录依赖 Supabase Auth，与部署域名无关；但 Supabase 项目需保持可用。

## 配置说明

- Supabase 地址与 anon key 位于 `src/lib/constants.js`（anon key 为公开密钥，数据安全由 Supabase RLS 行级权限保障）
- 评估场景结构（5 大维度 / 29 个二级场景 / 三级场景映射）同样在 `src/lib/constants.js`
- 日历数据来自云端 `CALENDAR_BLOB_URL`（`src/lib/constants.js` 中配置），运行时拉取并缓存

## 目录结构

```
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx             # 入口
    ├── App.jsx              # 根组件（认证 + 视图切换）
    ├── styles.css           # 看板全局样式（含深色主题）
    ├── lib/                 # Supabase 数据层 / 常量 / 工具函数 / Excel IO
    ├── hooks/useChart.js    # Chart.js 生命周期钩子
    ├── components/          # 看板组件（侧边栏/头部/图表/表格/弹窗等）
    │   └── charts/          # 四个图表组件
    └── calendar/            # 新车上市日历（独立样式作用域 calendar-mode）
        ├── CalendarApp.jsx
        ├── calendar.css
        ├── components/
        └── utils/
```
