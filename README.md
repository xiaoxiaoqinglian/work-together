# work-together

汽车数据看板的统一站点入口。根目录提供一个首页，通过不同 path 分别进入两个独立的前端应用：

| 入口 | 路径 | 说明 |
| --- | --- | --- |
| 多维度场景评分看板 | `/car-evaluation/` | 5 大维度、29 个二级场景的多车型评分对比，支持图表钻取、明细编辑、Excel 导入导出，数据经 Supabase 云端同步 |
| 新车上市日历 | `/car-launch-calendar-react/` | 主流车企新车预售 / 上市 / 首秀 / 发布会动态追踪，纯静态，数据随 `data.js` 发布 |

## 目录结构

```
work-together/
├── index.html                    # 站点首页（两个入口卡片）
├── package.json                  # 构建 / 预览 / 自查 脚本编排
├── scripts/
│   ├── build.mjs                 # 构建两个子项目并合并产物到 .dist/
│   ├── preview.mjs               # 本地静态预览服务器
│   └── verify.mjs                # 自查脚本
├── car-evaluation/               # 子项目：多维度场景评分看板
│   ├── README.md  LICENSE  .gitignore
│   └── src/ …
├── car-launch-calendar-react/    # 子项目：新车上市日历
│   ├── README.md  LICENSE  .gitignore
│   └── src/ …
└── .dist/                        # 构建产物（gitignore，部署用）
```

## 本地开发

两个子项目互相独立，分别进入目录开发：

```bash
# 评分看板
cd car-evaluation && npm install && npm run dev

# 新车上市日历
cd car-launch-calendar-react && npm install && npm run dev
```

## 构建

在**根目录**执行，会依次构建两个子项目并把产物合并到 `.dist/`：

```bash
npm run build
```

产物结构：

```
.dist/
├── index.html
├── car-evaluation/
│   ├── index.html
│   └── assets/…
└── car-launch-calendar-react/
    ├── index.html
    ├── data.js
    └── assets/…
```

两个子项目的 `vite.config.js` 均为 `base: './'`，资源使用相对路径，因此可直接托管在子目录下。

## 本地预览

```bash
npm run preview
```

默认启动 `http://localhost:4173/`，行为与通用静态托管一致：

- `/` — 首页
- `/car-evaluation/` — 评分看板
- `/car-launch-calendar-react/` — 新车上市日历

## 自查

```bash
npm run verify
```

会校验：GitHub 规范文件是否齐全、子项目源码结构是否未被改动、构建产物是否完整、各 path 是否可访问（含资源相对路径校验）。全部通过时退出码为 0。

## 部署

本项目为**纯静态站点**，`npm run build` 后将所有产物合并到 `.dist/`，可部署到任意静态托管平台。当前尚未确定部署目标，待确定后在此补充具体步骤。

> 首页与两个子应用均使用相对路径（`base: './'`），因此可直接放置在任何静态服务器的子目录下。
>
> Supabase 登录与数据依赖外部服务；更换部署平台不影响登录，但需保证 Supabase 项目可用。

## 许可证

[MIT](./LICENSE)
