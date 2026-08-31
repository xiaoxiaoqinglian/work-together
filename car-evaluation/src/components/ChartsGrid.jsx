import RankChart from './charts/RankChart.jsx'
import LineChart from './charts/LineChart.jsx'
import BubbleChart from './charts/BubbleChart.jsx'
import DrillChart from './charts/DrillChart.jsx'

export default function ChartsGrid({
  data,
  selectedCars,
  onToggleCar,
  drill,
  setDrill,
  onToggleDrillCar,
  onOpenDrillDetail,
  onOpenFullscreen,
  theme,
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <>
      <div className="charts-header">
        <div className="title">图表分析</div>
        <button className={`charts-toggle${collapsed ? ' collapsed' : ''}`} onClick={onToggleCollapsed}>
          <span className="arrow">▾</span> <span className="label">{collapsed ? '展开' : '折叠'}</span>
        </button>
      </div>
      <div className={`charts-grid${collapsed ? ' collapsed' : ''}`}>
        <div className="chart-panel">
          <div className="chart-header">
            <div className="chart-title">总分排名</div>
            <button className="chart-fullscreen" onClick={() => onOpenFullscreen('rank')} title="全屏">⛶</button>
          </div>
          <div className="chart-with-rank">
            <div className="chart-container">
              <RankChart data={data} theme={theme} limit={8} />
            </div>
          </div>
        </div>
        <div className="chart-panel">
          <div className="chart-header">
            <div className="chart-title">二级场景对比</div>
            <button className="chart-fullscreen" onClick={() => onOpenFullscreen('line')} title="全屏">⛶</button>
          </div>
          <LineChart data={data} selectedCars={selectedCars} onToggleCar={onToggleCar} theme={theme} />
        </div>
        <div className="chart-panel bubble-chart-panel">
          <div className="chart-header">
            <div className="chart-title">价格-得分趋势图</div>
            <button className="chart-fullscreen" onClick={() => onOpenFullscreen('bubble')} title="全屏">⛶</button>
          </div>
          <div className="chart-container bubble-chart-container">
            <BubbleChart data={data} theme={theme} />
          </div>
        </div>
        <div className="chart-panel drill-chart-panel">
          <DrillChart
            data={data}
            drill={drill}
            setDrill={setDrill}
            onOpenDetail={onOpenDrillDetail}
            onToggleDrillCar={onToggleDrillCar}
            onOpenFullscreen={() => onOpenFullscreen('drill')}
            theme={theme}
          />
        </div>
      </div>
    </>
  )
}
