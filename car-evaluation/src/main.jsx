import React from 'react'
import ReactDOM from 'react-dom/client'
import { Chart, registerables } from 'chart.js'
import App from './App.jsx'
import './styles.css'
import './calendar/calendar.css'

Chart.register(...registerables)

// 水平条形图（indexAxis:'y'）末端自动绘制分数
Chart.register({
  id: 'barEndScore',
  afterDatasetsDraw(chart) {
    if (chart.config.options.indexAxis !== 'y') return
    const { ctx } = chart
    const color = document.body.classList.contains('dark') ? '#9aa3b8' : '#475569'
    chart.data.datasets.forEach((ds, di) => {
      if (!Array.isArray(ds.data) || typeof ds.data[0] !== 'number') return
      const meta = chart.getDatasetMeta(di)
      meta.data.forEach((bar, i) => {
        const v = ds.data[i]
        if (typeof v !== 'number') return
        ctx.save()
        ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
        ctx.fillStyle = color
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(formatScoreText(v) + '分', bar.x + 14, bar.y)
        ctx.restore()
      })
    })
  },
})

function formatScoreText(v) {
  if (v === -1 || v === null || v === undefined || isNaN(v)) return '-'
  return Number.isInteger(Number(v)) ? v.toString() : Number(v).toFixed(2)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
