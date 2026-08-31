import { useMemo } from 'react'
import { Chart } from 'chart.js'
import { useChart } from '../../hooks/useChart.js'
import { computeDrillData, buildDrillChartModel, drillTitle } from '../../lib/drill.js'
import { carName, themeTextColor } from '../../lib/carUtils.js'

export default function DrillChart({ data, drill, setDrill, onOpenDetail, onToggleDrillCar, onOpenFullscreen, theme, fullscreen = false }) {
  const computed = useMemo(() => computeDrillData(data, drill), [data, drill])
  const model = useMemo(() => buildDrillChartModel(computed, drill), [computed, drill])
  const title = drillTitle(drill, model.mode, model.selNames)

  const canvasRef = useChart(
    (ctx) => {
      if (data.length === 0) return null
      const labelsShort = model.labels.map((d) => (d.length > 10 ? d.slice(0, 9) + '…' : d))
      const handleClick = (e, elements) => {
        if (!elements || elements.length === 0) return
        const idx = elements[0].index
        const item = model.base[idx]
        if (!item) return
        if (drill.level === 0) setDrill({ level: 1, dim: item.name, l2: null })
        else if (drill.level === 1) setDrill({ level: 2, l2: item.name })
        else onOpenDetail(drill.dim, drill.l2, item.name)
      }
      return new Chart(ctx, {
        type: 'bar',
        data: { labels: labelsShort, datasets: model.datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 900, easing: 'easeInOutQuart' },
          transitions: {
            active: { animation: { duration: 300 } },
            show: { animation: { duration: 700, easing: 'easeOutCubic' } },
            hide: { animation: { duration: 400, easing: 'easeInCubic' } },
          },
          plugins: {
            legend:
              model.datasets.length > 1
                ? { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: fullscreen ? 14 : 13 } } }
                : { display: false },
            tooltip: { callbacks: { label: model.tooltipLabel } },
          },
          scales: {
            y: { min: 0, grid: { color: themeTextColor() }, ticks: { callback: (v) => v + '分' } },
            x: { grid: { display: false }, ticks: { font: { size: fullscreen ? 13 : 14 }, maxRotation: 45 } },
          },
          onClick: handleClick,
        },
      })
    },
    [data, drill, theme, fullscreen],
  )

  function breadcrumbUp(level) {
    if (level === 0) setDrill({ level: 0, dim: null, l2: null })
    else if (level === 1) setDrill({ level: 1, l2: null })
  }

  const breadcrumb = (
    <div className="drill-breadcrumb">
      <span onClick={() => breadcrumbUp(0)}>一级维度</span>
      {drill.level >= 1 && (
        <>
          <span className="sep">&gt;</span>
          {drill.level === 1 ? (
            <span className="current">{drill.dim}</span>
          ) : (
            <span onClick={() => breadcrumbUp(1)}>{drill.dim}</span>
          )}
        </>
      )}
      {drill.level === 2 && (
        <>
          <span className="sep">&gt;</span>
          <span className="current">{drill.l2}</span>
        </>
      )}
    </div>
  )

  return (
    <div className="drill-chart-inner" key={drill.level + (drill.dim || '') + (drill.l2 || '')}>
      {!fullscreen && onOpenFullscreen && (
        <button className="drill-fullscreen" onClick={onOpenFullscreen} title="全屏">⛶</button>
      )}
      <div className="chart-title drill-chart-title">{title}</div>
      {breadcrumb}
      {!fullscreen && (
        <div className="drill-car-slicer">
          <span className="slicer-label">车型筛选：</span>
          {data.length === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 8 }}>当前筛选无匹配车型</span>
          ) : (
            data.map((c) => {
              const n = carName(c)
              return (
                <span
                  key={n}
                  className={`car-chip${drill.selCars.has(n) ? ' active' : ''}`}
                  onClick={() => onToggleDrillCar(n)}
                >
                  {n}
                </span>
              )
            })
          )}
        </div>
      )}
      <div className="chart-container drill-chart-canvas" style={fullscreen ? { flex: 1, minHeight: 0 } : undefined}>
        <canvas ref={canvasRef} />
      </div>
      {model.skipped && model.skipped.length > 0 && (
        <div className="drill-no-data-tip" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, textAlign: 'center' }}>
          提示：{model.skipped.join('、')} 无三级场景得分数据，已自动隐藏
        </div>
      )}
      {!fullscreen && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 6 }}>
          点击柱状图进入下一层级查看详情
        </div>
      )}
    </div>
  )
}
