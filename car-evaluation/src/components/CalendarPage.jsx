import { useEffect, useState } from 'react'
import CalendarApp from '../calendar/CalendarApp.jsx'
import { CALENDAR_BLOB_URL } from '../lib/constants.js'

const CALENDAR_STORAGE_KEY = 'car_calendar_v1'

const FALLBACK_DATA = {
  updatedAt: new Date().toISOString().slice(0, 10),
  dataSource: '云端同步失败，已加载默认空数据。请检查网络或 extendsclass 服务状态。',
  events: [],
}

async function fetchCalendarData() {
  // 1. 优先从 extendsclass 云端读取
  const resp = await fetch(CALENDAR_BLOB_URL + '?t=' + Date.now(), { cache: 'no-store' })
  if (!resp.ok) throw new Error('calendar cloud fetch failed: ' + resp.status)
  const data = await resp.json()
  if (!data || !Array.isArray(data.events)) throw new Error('calendar data format error')
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {}
  return data
}

function loadCalendarLocal() {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data && Array.isArray(data.events)) return data
    }
  } catch (e) {}
  return null
}

let dataPromise = null

function loadCalendarData() {
  if (dataPromise) return dataPromise
  dataPromise = fetchCalendarData().catch((e) => {
    console.warn('日历云端读取失败，尝试本地缓存', e)
    const local = loadCalendarLocal()
    if (local) return local
    return FALLBACK_DATA
  })
  return dataPromise
}

export default function CalendarPage({ onBack }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    document.body.classList.add('calendar-mode')
    return () => {
      document.body.classList.remove('calendar-mode')
    }
  }, [])

  useEffect(() => {
    let alive = true
    loadCalendarData()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setErr(e.message || '加载失败'))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <>
      <button className="calendar-back" onClick={onBack} title="返回看板">◂ 返回看板</button>
      {err && (
        <p style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'sans-serif', color: '#e30000' }}>
          {err}
        </p>
      )}
      {data && <CalendarApp data={data} />}
    </>
  )
}
