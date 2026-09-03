// =====================================================================
// 新车上市日历 · 自动化更新主脚本（调用大模型 API）
// ---------------------------------------------------------------------
// 功能：把「联网搜索 → 甄别发布会 → 改 data.js → 同步 dist → 上传 Supabase」
// 这一整条每周人工流程，交给大模型 API 自动完成。
//
// 前提：
//   1) 已有模型 API Key（DeepSeek / 通义 / GLM 任一，未申请时脚本会提示）
//   2) 已有 Supabase secret（即现有 upload-calendar.cjs 用的 SB_SECRET）
//
// 使用（在项目根目录 PowerShell 执行）：
//   $env:MODEL_API_KEY='sk-xxxxxx'                       # 模型 key（必填）
//   $env:SEARCH_API_KEY='...'                              # 联网搜索 key（建议，增强时效）
//   $env:SB_SECRET='你的_Supabase_service_role_密钥'               # Supabase key（复用现有，勿写明文/勿提交）
//   $env:MODEL_BASE_URL='https://api.deepseek.com'          # 可选，默认 DeepSeek
//   $env:MODEL_NAME='deepseek-chat'                         # 可选，默认 DeepSeek
//   node scripts/auto-update-calendar.cjs
//
// 说明：本脚本只负责「生成 + 校验 + 写文件 + 触发上传」，
//      联网搜索可通过 modelscope/Bing 等标准接口接入（见 searchWeb）。
// =====================================================================
const fs = require('fs')
const { execFileSync } = require('child_process')

const ROOT = 'd:/Trae/work-together'
const SRC = `${ROOT}/car-launch-calendar-react/public/data.js`
const DIST_A = `${ROOT}/car-launch-calendar-react/dist/data.js`
const DIST_B = `${ROOT}/.dist/car-launch-calendar-react/data.js`
const UPLOAD_SCRIPT = `${ROOT}/scripts/upload-calendar.cjs`

// ---- 联网搜索配置（可选） -------------------------------------------
const SEARCH_API_KEY = process.env.SEARCH_API_KEY || ''
const SEARCH_URL = 'https://api.bing.microsoft.com/v7.0/search'  // 也可换成其他标准搜索接口

// ---- 大模型配置（OpenAI 兼容 chat.completions） ----------------------
const MODEL_API_KEY = process.env.MODEL_API_KEY || ''
const MODEL_BASE_URL = process.env.MODEL_BASE_URL || 'https://api.deepseek.com'
const MODEL_NAME = process.env.MODEL_NAME || 'deepseek-chat'

// ---- 需覆盖的品牌清单（含后补充的启境，防止漏网） --------------------
const BRANDS = [
  '比亚迪','腾势','方程豹','仰望',
  '吉利','银河','领克','极氪',
  '理想','小米','蔚来','乐道','萤火虫','小鹏',
  '鸿蒙智行','问界','智界','享界',
  '零跑','长安启源','深蓝','阿维塔',
  '奇瑞','星途','iCAR','神行者',
  '长城','魏牌','坦克','欧拉',
  '智己','荣威','埃安','昊铂',
  '岚图','猛士','奕境','启境',
  '红旗','极狐','宝骏'
]

// ---- 收录口径（忠实还原需求，作为模型 system 提示） ------------------
const SYSTEM_PROMPT = `
你是《新车上市日历》内容的维护引擎。每周根据最新的联网搜索结果，输出未来发布会与最近发布会的结构化事件，并严格遵守以下规则。

【收录范围】仅收录车企官方已确认将举办或已举办的真实发布会。事件类型必须从四种「发布会细分」中选用：
- 上市发布会（车型正式上市并发起上市发布会）
- 预售发布会（开启预售时同步举办预售/预订发布会）
- 技术发布会（发布新技术、新平台、新架构、新电池、智能驾驶等，不含车型销售信息）
- 新车发布会（全新车型首发/亮相并伴随官方发布会，含"首发+发布会"性质）

【硬性门槛】
1. 必须是车企官方已确认将举办或已举办的真实发布会，dateConfirmed 必须为 true。
2. 纯媒体猜测、无官方发布会安排的普通上市/预售/开售消息，一律不收录。
3. 首秀类：仅当车型"首秀/首发"伴随官方发布会（首发+发布会）才保留并标为「新车发布会」；
   纯静态车展首秀（无发布会）、谍照、申报图、降价促销一律不收录。

【时效过滤】只收录今年已公布或已举办的发布会；排除旧闻与 30 天前的活动。
【来源要求】每条必须携带真实的 sourceName 与可访问的 sourceUrl，禁止编造来源。

请务必覆盖下列品牌：${BRANDS.join('、')}。
品牌名若为公司新成立的子品牌（如启境、奕境），优先保留独立条目。
`

// ---- 校验规则（程序二次把关，保证准确性不被模型口误破坏） ------------
const EVENT_TYPES = ['上市发布会','预售发布会','技术发布会','新车发布会']
const SECTIONS = ['upcoming','recent','future']
const BAN_WORDS = ['谍照','申报','曝光图','媒体猜测','或将于','疑似','网传','媒体预测'] // 命中即视为非官方实锤

// ---- 联网搜索：标准接口封装（可选） ----------------------------------
// 若未配置 SEARCH_API_KEY，则降级为仅凭模型知识输出（时效较弱，仍会强校验）。
async function searchWeb(query) {
  if (!SEARCH_API_KEY) return []
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&count=5`
  const r = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': SEARCH_API_KEY } })
  if (!r.ok) { console.warn('[search] 搜索失败', r.status); return [] }
  const d = await r.json()
  return (d.webPages && d.webPages.value || []).map(p => ({
    title: p.name, url: p.url, snippet: (p.snippet || '').slice(0, 200),
  }))
}

// ---- 调用大模型（OpenAI 兼容 chat/chat.completions） -----------------
async function askModel(searchedText) {
  const adv = searchedText ? `\n\n以下是针对各品牌的联网搜索结果（可作为事实依据，无搜索结果的品牌请显式说明"未获官方发布会信息"）：\n${searchedText}` : ''
  const body = {
    model: MODEL_NAME,
    temperature: 0.3, // 低温度，保证事实稳定
    response_format: { type: 'json_object' }, // 让模型只输出 JSON
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `今天是 2026-09-01。请输出一个 JSON 对象，结构如下：
{
  "updatedAt": "2026-09-01",
  "events": [ 每个元素包含 id,brand,model,type,eventType,section,date,dateConfirmed,price,priceNote,desc,sourceName,sourceUrl ],
  "excluded": [ 对每条被你剔除的候选，给出 {model, reason} ]
}
要求：
- section 规则：未来约 30 天内=upcoming，过去 7 天内=recent，30 天以外=future。
- date 精确到日 "2026-09-02"；只能给月/季度则 month 精度并保持 dateConfirmed 为 false。
- price 未公布时为 null。desc 一句话（45 字内）。
- 只输出这个 JSON，不要任何其它文字。${adv}`,
      },
    ],
  }
  const r = await fetch(`${MODEL_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + MODEL_API_KEY },
    body: JSON.stringify(body),
  })
  if (!r.ok) { const t = await r.text(); throw new Error(`模型调用失败 ${r.status}: ${t.slice(0,300)}`) }
  const d = await r.json()
  return JSON.parse(d.choices[0].message.content)
}

// ---- 逐条目硬校验（模型口误时在此拦截） -------------------------------
function validateEvents(events) {
  const seen = new Set()
  const ok = []
  for (const e of events) {
    const issues = []
    // 必填字段
    for (const f of ['id','brand','model','type','eventType','section','date']) {
      if (!e[f]) issues.push(`缺字段 ${f}`)
    }
    if (!EVENT_TYPES.includes(e.eventType)) issues.push(`非法 eventType: ${e.eventType}`)
    if (!SECTIONS.includes(e.section)) issues.push(`非法 section: ${e.section}`)
    if (e.dateConfirmed !== true) issues.push('dateConfirmed 必须为 true')
    // 来源必须真实
    if (!/^https?:\/\//.test(e.sourceUrl || '')) issues.push('sourceUrl 非法')
    if (!e.sourceName) issues.push('缺 sourceName')
    // 剔除疑似媒体猜测/非发布会词
    const text = [e.model, e.desc, e.eventType].join(' ')
    if (BAN_WORDS.some(w => text.includes(w))) issues.push('含非官方实锤关键词')
    // id 去重
    if (seen.has(e.id)) issues.push('id 重复')
    seen.add(e.id)
    if (issues.length) { console.warn(`[忽略] ${e.brand||''} ${e.model||''}: ${issues.join('; ')}`) ; continue }
    ok.push(e)
  }
  return ok
}

// ---- 生成标准 data.js 文本（与 header 注释格式一致） ------------------
function buildDataJs(data) {
  const header = `/* =====================================================================
   新车上市日历 · 数据文件 (data.js)
   ---------------------------------------------------------------------
   由 AI 联网搜索汇总生成，每周更新。请勿修改本文件的数据结构。
   字段说明：
     id            唯一标识（品牌-车型-事件）
     brand         品牌（用于品牌筛选）
     model         车型名称
     type          车身类型：轿车 | SUV | MPV | 超跑 | 品牌（品牌=非具体车型的活动）
     eventType     事件类型（发布会细分）：上市发布会 | 预售发布会 | 技术发布会 | 新车发布会
    收录原则：仅收录车企官方已确认将举办或已举办的发布会；首秀仅在有发布会性质（首发+发布会）时保留，纯静态车展首秀不收录
    section       板块：upcoming=即将上市(未来约30天)
                         recent=最近上市(近7天)
                         future=更远预告(30天以外)
     date          日期：精确到日 "2026-09-02"；精确到月 "2026-09"；
                   季度 "2026-Q4"；半年 "2026-H2"
     dateConfirmed true=官方已公布该日期/时间窗口；false=媒体或行业预计
     price         价格字符串，如 "23-28万元"；未公布为 null
     priceNote     价格性质说明，如 "预售价"、"媒体预测"；无则为 null
     desc          一句话核心卖点（45字内）
     sourceName    来源媒体名称
     sourceUrl     来源链接
   ===================================================================== */

window.CAR_DATA = {
  updatedAt: ${JSON.stringify(data.updatedAt)},
  dataSource: "AI 联网搜索汇总（汽车之家、新浪汽车、新华网、易车、太平洋汽车、凤凰网汽车等公开报道）",
  events: [
`
  const items = data.events.map(e => '    ' + Object.entries(e)
    .map(([k, v]) => `      ${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`).join(',\n')
  ).join('\n    },\n    {\n')
  return `${header}    ${items}\n  ]\n};\n`
}

// ---- 主流程 ----------------------------------------------------------
;(async () => {
  if (!MODEL_API_KEY) {
    console.error('==> 未设置 MODEL_API_KEY。请先注册并申请一个大模型 API Key，例如：')
    console.error('    $env:MODEL_API_KEY=\'sk-xxxx\'  然后重跑。当前的脚本骨架已就绪。')
    process.exit(1)
  }

  console.log('[1/4] 联网搜索各品牌发布会动态 ...')
  let searchedText = ''
  if (SEARCH_API_KEY) {
    const chunks = []
    for (const b of BRANDS) {
      const res = await searchWeb(`${b} 上市发布会 时间 2026`)
      if (res.length) { chunks.push(`\n## ${b}\n` + res.map(r => `- ${r.title} | ${r.url} | ${r.snippet}`).join('\n')) }
    }
    searchedText = chunks.join('\n')
  } else {
    console.log('    未配置 SEARCH_API_KEY，本次基于模型知识输出（后续建议接入搜索以增强时效）。')
  }

  console.log('[2/4] 调用大模型生成并甄别 ...')
  const data = await askModel(searchedText)
  const events = validateEvents(data.events || [])
  if (!events.length) { throw new Error('生成的条目全部未通过校验，中止写入，请人工检查。') }
  const final = { updatedAt: data.updatedAt || '2026-09-01', events }

  console.log(`[3/4] 写入 public/dist/.dist 共 ${events.length} 条 ...`)
  const js = buildDataJs(final)
  fs.writeFileSync(SRC, js)
  fs.copyFileSync(SRC, DIST_A)
  fs.copyFileSync(SRC, DIST_B)
  execFileSync('node', ['--check', SRC]); // 语法通过才继续
  console.log('    node --check 通过')

  console.log('[4/4] 上传 Supabase 云端 ...')
  execFileSync('node', [UPLOAD_SCRIPT], { env: { ...process.env } })

  console.log('\n==== 更新完成 ====')
  console.log('新增/保留条目：', events.map(e => `${e.brand} ${e.model}`).join('、') || '（空）')
  console.log('被剔除候选：', data.excluded && data.excluded.length ? JSON.stringify(data.excluded) : '（无）')
})().catch((e) => { console.error('[失败]', e.message); process.exit(1) })