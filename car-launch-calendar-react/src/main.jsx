import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Supabase 云端数据（匿名只读，公开页安全）
const SUPABASE_URL = 'https://ucsubgbnkcdjbgozqfaj.supabase.co'
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjc3ViZ2Jua2NkamJnb3pxZmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTM4ODAsImV4cCI6MjEwMjMyOTg4MH0.gClpGM9iQDUc65ZEGJTVMmrqgQ788TtRAWfU3v6_eZU'

// 数据加载：优先读 Supabase 云端快照（newcar-calendar 表 id=1 的 payload），
// 云端不可达则回退本地 data.js（由构建时从 public/ 原样复制）。
async function loadData() {
  try {
    const resp = await fetch(
      SUPABASE_URL + '/rest/v1/newcar-calendar?select=payload&limit=1',
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: 'Bearer ' + ANON_KEY,
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    )
    if (resp.ok) {
      const rows = await resp.json()
      const p = Array.isArray(rows) && rows[0] ? rows[0].payload : null
      if (p && Array.isArray(p.events) && p.events.length > 0) return p
    }
  } catch (e) {
    console.warn('云端数据加载失败，回退本地', e)
  }
  return new Promise((resolve, reject) => {
    if (window.CAR_DATA) {
      resolve(window.CAR_DATA)
      return
    }
    const script = document.createElement('script')
    script.src = new URL('data.js', window.location.href).href
    script.onload = () => {
      if (window.CAR_DATA) resolve(window.CAR_DATA)
      else reject(new Error('数据文件 data.js 格式错误'))
    }
    script.onerror = () => reject(new Error('数据文件 data.js 加载失败'))
    document.head.appendChild(script)
  })
}

function showFatal(message) {
  document.getElementById('root').innerHTML =
    '<p style="padding:60px;text-align:center;font-family:sans-serif;">' + message + '</p>'
}

loadData()
  .then((data) => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App data={data} />
      </React.StrictMode>,
    )
  })
  .catch((err) => showFatal(err.message))
