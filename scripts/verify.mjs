/**
 * 自查脚本：校验仓库规范文件、构建产物与各 path 可达性。
 * 用法：npm run verify
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, '.dist')
const PORT = 4399
const BASE = `http://127.0.0.1:${PORT}`

const APPS = ['car-evaluation', 'car-launch-calendar-react']

let pass = 0
let fail = 0

function ok(msg) {
  pass++
  console.log('  [OK]   ' + msg)
}
function bad(msg) {
  fail++
  console.log('  [FAIL] ' + msg)
}
function check(cond, msg) {
  cond ? ok(msg) : bad(msg)
}
function exists(p) {
  return fs.existsSync(p)
}

function section(title) {
  console.log('\n' + title)
}

// ---------- 1. 仓库规范文件 ----------
section('1. GitHub 规范文件')
const rootFiles = ['README.md', 'LICENSE', '.gitignore', 'index.html', 'package.json']
for (const f of rootFiles) {
  check(exists(path.join(ROOT, f)), `根目录存在 ${f}`)
}
for (const app of APPS) {
  for (const f of ['README.md', 'LICENSE', '.gitignore']) {
    check(exists(path.join(ROOT, app, f)), `${app}/ 存在 ${f}`)
  }
}

// ---------- 2. 子项目源码结构未被动过 ----------
section('2. 子项目源码结构')
const srcMarkers = [
  ['car-evaluation', 'src/App.jsx'],
  ['car-evaluation', 'src/main.jsx'],
  ['car-evaluation', 'src/lib/constants.js'],
  ['car-evaluation', 'src/components/Sidebar.jsx'],
  ['car-evaluation', 'src/calendar/CalendarApp.jsx'],
  ['car-launch-calendar-react', 'src/App.jsx'],
  ['car-launch-calendar-react', 'src/main.jsx'],
  ['car-launch-calendar-react', 'public/data.js'],
]
for (const [app, rel] of srcMarkers) {
  check(exists(path.join(ROOT, app, rel)), `${app}/${rel} 仍存在`)
}
for (const app of APPS) {
  const viteCfg = path.join(ROOT, app, 'vite.config.js')
  if (exists(viteCfg)) {
    const txt = fs.readFileSync(viteCfg, 'utf8')
    check(txt.includes("base: './'"), `${app}/vite.config.js 仍为 base: './'`)
  } else {
    bad(`${app}/vite.config.js 缺失`)
  }
}

// ---------- 3. 构建产物 ----------
section('3. 构建产物 .dist/')
const requiredArtifacts = [
  'index.html',
  'car-evaluation/index.html',
  'car-launch-calendar-react/index.html',
  'car-launch-calendar-react/data.js',
]
for (const rel of requiredArtifacts) {
  check(exists(path.join(DIST, rel)), `.dist/${rel}`)
}

// 首页必须包含两个入口链接
const homeHtml = exists(path.join(DIST, 'index.html')) ? fs.readFileSync(path.join(DIST, 'index.html'), 'utf8') : ''
check(homeHtml.includes('/car-evaluation/'), '首页包含 /car-evaluation/ 链接')
check(homeHtml.includes('/car-launch-calendar-react/'), '首页包含 /car-launch-calendar-react/ 链接')

// ---------- 4. HTTP 可达性 ----------
async function httpChecks() {
  section('4. 各 path 可达性')
  const targets = [
    { path: '/', label: '首页 /', marker: '多维度场景评分看板' },
    { path: '/car-evaluation/', label: '评分看板 /car-evaluation/', marker: null },
    { path: '/car-launch-calendar-react/', label: '日历 /car-launch-calendar-react/', marker: null },
    { path: '/car-launch-calendar-react/data.js', label: '日历数据 data.js', marker: 'CAR_DATA' },
  ]
  for (const t of targets) {
    try {
      const resp = await fetch(BASE + t.path, { cache: 'no-store' })
      const body = resp.ok ? await resp.text() : ''
      if (!resp.ok) {
        bad(`${t.label} → HTTP ${resp.status}`)
      } else if (t.marker && !body.includes(t.marker)) {
        bad(`${t.label} → 200 但缺少内容标记「${t.marker}」`)
      } else {
        ok(`${t.label} → HTTP 200`)
      }
    } catch (e) {
      bad(`${t.label} → 请求失败 ${e.message}`)
    }
  }

  // 校验看板页资源引用是否为相对路径（保证子目录部署可用）
  try {
    const resp = await fetch(BASE + '/car-evaluation/', { cache: 'no-store' })
    const html = await resp.text()
    check(!/\ssrc="\/assets\//.test(html), '看板 index.html 未使用根绝对路径引用资源')
    check(/\ssrc="\.\/assets\//.test(html), '看板 index.html 使用相对路径 ./assets/')
  } catch (e) {
    bad('看板资源路径校验失败：' + e.message)
  }
}

// 启动预览服务器 → 跑 HTTP 检查 → 关闭
const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'preview.mjs')], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
})

async function waitReady(retries = 40) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(BASE + '/', { cache: 'no-store' })
      if (r.ok) return true
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

const ready = await waitReady()
if (!ready) {
  console.log('\n[FAIL] 预览服务器启动失败，跳过 HTTP 检查')
  fail++
} else {
  await httpChecks()
}
child.kill()

// ---------- 汇总 ----------
console.log('\n' + '─'.repeat(46))
console.log(`自查结果： 通过 ${pass} 项，失败 ${fail} 项`)
console.log('─'.repeat(46))
process.exit(fail === 0 ? 0 : 1)
