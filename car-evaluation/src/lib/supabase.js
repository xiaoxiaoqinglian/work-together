import pako from 'pako'
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  BLOB_URL,
  STORAGE_KEY,
  KNOWN_IDS,
  CLOUD_PAYLOAD_VERSION,
  AUTH_STORAGE_KEY,
} from './constants.js'
import { isValidFormat } from './carUtils.js'

// Supabase 数据表名（用户在控制台改名后为 cars-evaluation）
const CARS_TABLE = 'cars-evaluation'

function strHash(s) {
  let h = 0
  s = String(s || '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h.toString(16).padStart(8, '0').slice(0, 8)
}

function carRowId(c, i) {
  if (KNOWN_IDS[c[0]]) return KNOWN_IDS[c[0]]
  return 'car_' + strHash(c[0] || 'x' + i)
}

function carsToRows(arr) {
  const rows = []
  arr.forEach((c, i) => {
    // 护栏：结构异常（无维度）的车型绝不写入云端，避免破坏已有数据
    if (!Array.isArray(c[7]) || c[7].length === 0) return
    rows.push({ id: carRowId(c, i), name: c[0], ord: i, data: c, updated_by: 'web' })
  })
  return rows
}

// 若登录主页已通过 Supabase Auth 登录并缓存了 access_token（authenticated JWT），
// 则这里带上 Authorization，让 PostgREST 以登录用户身份访问，匹配 RLS 的 authenticated 策略。
function getSBHeaders() {
  const headers = { apikey: SUPABASE_ANON_KEY }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s && s.access_token) headers['Authorization'] = 'Bearer ' + s.access_token
    }
  } catch (e) {
    // 忽略：无登录态时按 anon 访问
  }
  return headers
}

// gzip 压缩 + base64
function gzipPayload(jsonStr) {
  try {
    const gzStr = pako.gzip(jsonStr, { to: 'string' })
    return btoa(gzStr)
  } catch (e) {}
  return btoa(unescape(encodeURIComponent(jsonStr)))
}

function ungzipPayload(b64) {
  try {
    const bin = atob(b64)
    return JSON.parse(pako.ungzip(bin, { to: 'string' }))
  } catch (e) {}
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))))
  } catch (e2) {
    throw e2
  }
}

function saveCarsLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {}
}

function loadCarsLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      if (Array.isArray(data) && data.length > 0 && isValidFormat(data[0])) return data
    }
  } catch (e) {}
  return []
}

// Supabase 优先，extendsclass 兜底，最后本地缓存
async function loadCars() {
  let base = null
  try {
    const resp = await fetch(SUPABASE_URL + '/rest/v1/' + CARS_TABLE + '?select=id,data,ord&order=ord.asc', {
      headers: getSBHeaders(),
      cache: 'no-store',
    })
    if (resp.ok) {
      const rows = await resp.json()
      if (Array.isArray(rows) && rows.length > 0) {
        const arr = rows
          .map((r) => r.data)
          .filter((d) => d && d[0] !== 'PROBE' && isValidFormat(d))
        if (arr.length > 0) base = arr
      }
    }
  } catch (e) {
    console.warn('Supabase 加载失败，回退', e)
  }
  if (!base) {
    try {
      const resp = await fetch(BLOB_URL + '?t=' + Date.now(), { cache: 'no-store' })
      if (resp.ok) {
        const payload = await resp.json()
        if (payload && typeof payload.c === 'string' && payload.c) {
          const data = ungzipPayload(payload.c)
          if (Array.isArray(data)) {
            const arr = data.filter((d) => d && d[0] !== 'PROBE' && isValidFormat(d))
            if (arr.length > 0) base = arr
          }
        }
      }
    } catch (e) {
      console.warn('extendsclass 加载失败，回退本地', e)
    }
  }
  if (!base) base = loadCarsLocal()

  // 恢复：把浏览器 localStorage 中云端没有的新车（按车型名判断）补回
  try {
    const localSaved = localStorage.getItem(STORAGE_KEY)
    if (localSaved) {
      const localArr = JSON.parse(localSaved)
      if (Array.isArray(localArr)) {
        const baseNames = new Set(base.map((c) => c[0]))
        const extras = localArr.filter(
          (c) => c && c[0] !== 'PROBE' && !baseNames.has(c[0]) && isValidFormat(c),
        )
        if (extras.length > 0) {
          const merged = base.concat(extras)
          saveCars(merged)
          return merged
        }
      }
    }
  } catch (e) {}
  return base
}

// 返回 'ok' | 'ok-blob' | 'error'
async function saveCars(data) {
  saveCarsLocal(data)
  try {
    const rows = carsToRows(data)
    const resp = await fetch(SUPABASE_URL + '/rest/v1/' + CARS_TABLE, {
      method: 'POST',
      headers: Object.assign({}, getSBHeaders(), {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      }),
      body: JSON.stringify(rows),
    })
    if (resp.ok) return 'ok'
    console.warn('Supabase 写入失败(' + resp.status + ')，尝试 extendsclass', await resp.text())
  } catch (e) {
    console.warn('Supabase 写入异常，尝试 extendsclass', e)
  }
  try {
    const b64 = gzipPayload(JSON.stringify(data))
    const resp = await fetch(BLOB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ v: CLOUD_PAYLOAD_VERSION, c: b64 }),
    })
    if (resp.ok) return 'ok-blob'
  } catch (e) {}
  return 'error'
}

// 从云端真正删除某车型（按车型名匹配 jsonb 首字段），避免删除后成为孤儿行
async function deleteCarCloud(name) {
  try {
    await fetch(SUPABASE_URL + '/rest/v1/' + CARS_TABLE + '?data->>0=eq.' + encodeURIComponent(name), {
      method: 'DELETE',
      headers: getSBHeaders(),
    })
  } catch (e) {
    console.warn('Supabase 删除失败', e)
  }
}

// 一键清除本地缓存 + 纯净从 Supabase 拉取最新数据
async function forceReloadFromCloud(completeL3Structure) {
  localStorage.removeItem(STORAGE_KEY)
  const resp = await fetch(SUPABASE_URL + '/rest/v1/' + CARS_TABLE + '?select=id,data,ord&order=ord.asc', {
    headers: getSBHeaders(),
    cache: 'no-store',
  })
  if (!resp.ok) throw new Error('Supabase HTTP ' + resp.status)
  const rows = await resp.json()
  const arr = rows.map((r) => r.data).filter((d) => d && d[0] !== 'PROBE' && isValidFormat(d))
  if (arr.length === 0) throw new Error('无有效数据')
  arr.forEach((car) => completeL3Structure(car))
  saveCarsLocal(arr)
  return arr
}

export {
  getSBHeaders,
  loadCars,
  saveCars,
  saveCarsLocal,
  loadCarsLocal,
  deleteCarCloud,
  forceReloadFromCloud,
}
