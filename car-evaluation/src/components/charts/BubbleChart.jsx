import { Chart } from 'chart.js'
import { useChart } from '../../hooks/useChart.js'
import { carName, carPrice, carTotal, carPriceSeg, priceSegOrder, formatScore, themeTextColor } from '../../lib/carUtils.js'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function BubbleChart({ data, theme, fullscreen = false }) {
  const canvasRef = useChart(
    (ctx) => {
      const segs = [...new Set(data.map((c) => carPriceSeg(c)))].sort((a, b) => priceSegOrder(a) - priceSegOrder(b))
      const segColor = {}
      segs.forEach((s, i) => {
        segColor[s] = COLORS[i % COLORS.length]
      })
      const scatterDatasets = segs.map((seg) => ({
        label: seg,
        data: data.filter((c) => carPriceSeg(c) === seg).map((c) => ({ x: carPrice(c), y: carTotal(c), name: carName(c) })),
        backgroundColor: segColor[seg],
        pointRadius: fullscreen ? 8 : 7,
        pointHoverRadius: fullscreen ? 12 : 10,
        order: 1,
      }))
      return new Chart(ctx, {
        type: 'scatter',
        data: { datasets: scatterDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 0 },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: fullscreen ? 14 : 13 } } },
            tooltip: {
              callbacks: {
                label: (c) => {
                  const d = c.raw
                  if (d && d.name) return `${d.name}: ${formatScore(d.y)}分, ${d.x}万元`
                  return `${c.dataset.label}: ${formatScore(d.y)}分`
                },
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: '价格(万元)', font: { size: fullscreen ? 14 : 13 } },
              grid: { color: themeTextColor() },
              ticks: { font: { size: 13 } },
              beginAtZero: true,
              grace: 0,
            },
            y: {
              title: { display: true, text: '总分', font: { size: fullscreen ? 14 : 13 } },
              grid: { color: themeTextColor() },
              ticks: { font: { size: 13 }, callback: (v) => formatScore(v) + '分' },
              beginAtZero: true,
              grace: 0,
            },
          },
        },
      })
    },
    [data, theme, fullscreen],
  )

  return <canvas ref={canvasRef} />
}
