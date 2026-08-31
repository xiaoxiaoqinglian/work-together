// 将 car-launch-calendar-react 的 data.js 快照 upsert 到 Supabase newcar-calendar 表（覆盖写）。
// 用法: SB_SECRET=xxx node upload-calendar.cjs [data.js路径]
// 读取 window.CAR_DATA = {...}，整份存入 id=1 行的 payload 列，实现覆盖。
const fs = require('fs')
const path = process.argv[2] || 'd:/Trae/work-together/.dist/car-launch-calendar-react/data.js'
const secret = process.env.SB_SECRET
if (!secret) { console.error('需设置环境变量 SB_SECRET'); process.exit(1) }

const s = fs.readFileSync(path, 'utf8')
const start = s.indexOf('window.CAR_DATA = ')
const eq = s.indexOf('=', start)
const body = s.slice(eq + 1).replace(/;\s*$/, '')
let obj
try { obj = eval('(' + body + ')') } catch (e) { console.error('data.js 解析失败:', e.message); process.exit(1) }

const url = 'https://ucsubgbnkcdjbgozqfaj.supabase.co/rest/v1/newcar-calendar?on_conflict=id'
;(async () => {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: secret,
      Authorization: 'Bearer ' + secret,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({ id: 1, payload: obj, updated_at: new Date().toISOString() }),
  })
  console.log('status', r.status)
  console.log(await r.text())
})().catch((e) => { console.error(e); process.exit(1) })