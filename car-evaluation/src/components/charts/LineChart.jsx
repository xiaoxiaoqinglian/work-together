import { useEffect, useMemo, useRef } from 'react'
import { Chart } from 'chart.js'
import { carName, carDims, dimL2s, l2Name, l2Score, formatScore, themeTextColor } from '../../lib/carUtils.js'
import { L2_NAMES } from '../../lib/constants.js'

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1']

// Chart.js 的 options 会把函数值当作 scriptable option 调用（入参是 context 对象），
// 因此 easing 只能用内置名称；easeOutQuint 的减速特性最接近苹果的 cubic-bezier(0.32, 0.72, 0, 1)
const APPLE_EASE = 'easeOutQuint'

function buildDatasets(sel, data, fullscreen) {
  return sel.map((name, i) => {
    const car = data.find((c) => carName(c) === name)
    const color = COLORS[i % 10]
    const l2Scores = L2_NAMES.map((l2n) => {
      let total = 0
      let count = 0
      carDims(car).forEach((dim) => {
        dimL2s(dim).forEach((l2) => {
          if (l2Name(l2) === l2n) {
            const s = l2Score(l2)
            if (s !== -1) {
              total += s
              count++
            }
          }
        })
      })
      return count > 0 ? total : null
    })
    return {
      label: name,
      data: l2Scores,
      borderColor: color,
      backgroundColor: color + '26',
      borderWidth: 2.5,
      borderJoinStyle: 'round',
      borderCapStyle: 'round',
      tension: 0.4,
      pointRadius: fullscreen ? 4.5 : 3.5,
      pointBackgroundColor: color,
      pointBorderColor: color,
      pointBorderWidth: 0,
      pointHoverRadius: fullscreen ? 7 : 6,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
      spanGaps: false,
    }
  })
}

function drawEmptyHint(canvas) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = '#9ca3af'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('请选择车型', canvas.width / 2, canvas.height / 2)
}

export default function LineChart({ data, selectedCars, onToggleCar, theme, fullscreen = false }) {
  const sel = useMemo(
    () => [...selectedCars].filter((n) => data.some((c) => carName(c) === n)),
    [selectedCars, data],
  )
  const datasets = useMemo(() => buildDatasets(sel, data, fullscreen), [sel, data, fullscreen])
  const datasetsRef = useRef(datasets)
  datasetsRef.current = datasets

  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  // 主题/全屏/空↔非空等结构变化时销毁重建；日常数据变化由下面的原地平滑更新接管
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    if (sel.length === 0) {
      chartRef.current?.destroy()
      chartRef.current = null
      drawEmptyHint(canvas)
      return undefined
    }
    const chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: { labels: L2_NAMES, datasets: datasetsRef.current },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: APPLE_EASE },
        transitions: {
          active: { animation: { duration: 260, easing: APPLE_EASE } },
          show: { animation: { duration: 500, easing: APPLE_EASE } },
          hide: { animation: { duration: 320, easing: APPLE_EASE } },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, padding: fullscreen ? 14 : 10, font: { size: fullscreen ? 14 : 13 } },
          },
          tooltip: {
            callbacks: {
              label: (c) =>
                c.raw !== null && c.raw !== undefined
                  ? c.dataset.label + ': ' + formatScore(c.raw) + '分'
                  : c.dataset.label + ': 无数据',
            },
          },
        },
        scales: {
          y: {
            min: 0,
            grid: { color: 'rgba(148,163,184,0.18)' },
            ticks: { color: '#94a3b8', font: { size: fullscreen ? 14 : 13 }, callback: (v) => formatScore(v) + '分' },
          },
          x: {
            position: 'top',
            grid: { display: false },
            ticks: {
              font: { size: fullscreen ? 15 : 14, weight: 'bold' },
              color: themeTextColor(),
              maxRotation: 45,
              minRotation: 45,
              padding: fullscreen ? 10 : 8,
            },
          },
        },
      },
    })
    chartRef.current = chart
    return () => {
      chart.destroy()
      if (chartRef.current === chart) chartRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, fullscreen, sel.length === 0])

  // 点击车型 chip 增删曲线时原地更新数据，用 Apple 缓动平滑过渡而不是整图销毁重播
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    if (chart.data.datasets === datasets) return
    chart.data.datasets = datasets
    chart.update()
  }, [datasets])

  return (
    <>
      {!fullscreen && (
        <div className="car-selector">
          {data.map((c) => {
            const name = carName(c)
            return (
              <span
                key={name}
                className={`car-chip${selectedCars.has(name) ? ' active' : ''}`}
                onClick={() => onToggleCar(name)}
              >
                {name}
              </span>
            )
          })}
        </div>
      )}
      <div className="chart-container" style={fullscreen ? { height: '100%' } : undefined}>
        <canvas ref={canvasRef} />
      </div>
    </>
  )
}
