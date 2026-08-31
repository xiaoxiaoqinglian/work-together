# 新车上市日历

追踪主流车企新车 **预售 / 上市 / 首秀 / 发布会** 动态的静态单页应用。按品牌、车身类型、事件类型筛选，并提供「即将上市」「最近上市」「更远预告」三个板块。

## 技术栈

- React 18 + Vite 5
- 纯静态站点，无后端依赖
- 数据源：`public/data.js`（`window.CAR_DATA` 格式）

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

产物输出到 `dist/`。`vite.config.js` 中已设置 `base: './'`，全部资源使用相对路径，因此可直接托管在任意静态服务器或子目录下。

## 数据更新

编辑 `public/data.js` 中的 `window.CAR_DATA` 即可更新日历内容，无需重新构建（直接替换部署产物中的 `data.js` 同样生效）。

字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识（品牌-车型-事件） |
| `brand` | 品牌 |
| `model` | 车型名称 |
| `type` | 车身类型：轿车 / SUV / MPV / 超跑 / 品牌 |
| `eventType` | 事件类型：上市 / 预售 / 首秀 / 发布会 |
| `section` | 板块：`upcoming` / `recent` / `future` |
| `date` | 日期，支持 `2026-09-02`、`2026-09`、`2026-Q4`、`2026-H2` |
| `dateConfirmed` | 日期是否为官方公布 |
| `price` / `priceNote` | 价格与价格性质说明 |
| `desc` | 一句话核心卖点 |
| `sourceName` / `sourceUrl` | 来源媒体与链接 |

## 部署

本项目作为 `work-together` 站点的子项目，为**纯静态**应用，访问路径为：

```
/car-launch-calendar-react/
```

构建与产物合并由仓库根目录的 `npm run build` 统一编排，产物最终合并到根目录 `.dist/`。当前尚未确定部署平台，待确定后在根 README 补充具体步骤。

## 目录结构

```
├── index.html
├── vite.config.js
├── public/
│   └── data.js          # 日历数据
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    ├── components/
    └── utils/
```

## 许可证

[MIT](./LICENSE)
