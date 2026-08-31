/**
 * 本地预览服务器：以 .dist/ 为站点根，模拟通用静态托管行为。
 * 支持目录索引（/car-evaluation/ → /car-evaluation/index.html）。
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, '.dist')
const PORT = Number(process.env.PORT || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

if (!fs.existsSync(DIST)) {
  console.error('缺少 .dist/，请先运行 npm run build')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0])

  // 统一补全目录索引
  if (urlPath.endsWith('/')) urlPath += 'index.html'

  let filePath = path.join(DIST, urlPath)

  // 防目录穿越
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden')
    return
  }

  // 若请求的是目录（无尾斜杠），重定向到带斜杠的形式
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    res.writeHead(301, { Location: urlPath + '/' })
    res.end()
    return
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found: ' + urlPath)
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  })
  fs.createReadStream(filePath).pipe(res)
})

server.listen(PORT, () => {
  console.log(`\n预览服务已启动：http://localhost:${PORT}/`)
  console.log(`  首页             http://localhost:${PORT}/`)
  console.log(`  评分看板         http://localhost:${PORT}/car-evaluation/`)
  console.log(`  新车上市日历     http://localhost:${PORT}/car-launch-calendar-react/`)
  console.log('\n按 Ctrl+C 停止\n')
})
