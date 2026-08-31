import { Chart } from 'chart.js'
import { useChart } from '../../hooks/useChart.js'
import { carName, carTotal, formatScore, themeTextColor } from '../../lib/carUtils.js'

const COLORS = [
  '#6366f1', '#a5b4fc', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f97316', '#6366f1', '#22c55e', '#e11d48', '#06b6d4', '#a855f7', '#84cc16',
  '#ef4444', '#0ea5e9', '#d946ef', '#eab308',
]

export default function RankChart({ data, theme, limit = 8 }) {
  const canvasRef = useChart(
    (ctx) => {
      const sorted = [...data].sort((a, b) => carTotal(b) - carTotal(a)).slice(0, limit || undefined)
      const labels = sorted.map((c) =>
        !limit && carName(c).length > 12 ? carName(c).slice(0, 11) + '…' : carName(c),
      )
      const scores = sorted.map(carTotal)
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: '总分',
              data: scores,
              backgroundColor: sorted.map((_, i) => COLORS[i % COLORS.length]),
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { right: 64 } },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => '总分: ' + formatScore(c.raw) } },
          },
          scales: {
            x: {
              grid: { color: themeTextColor() },
              ticks: { font: { size: 13 }, callback: (v) => formatScore(v) + '分' },
            },
            y: { grid: { display: false }, ticks: { font: { size: 13 } } },
          },
        },
      })
    },
    [data, theme, limit],
  )

  return <canvas ref={canvasRef} />
}
