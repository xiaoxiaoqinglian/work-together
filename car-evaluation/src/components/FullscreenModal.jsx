import { useEffect, useRef, useState } from 'react'
import RankChart from './charts/RankChart.jsx'
import LineChart from './charts/LineChart.jsx'
import BubbleChart from './charts/BubbleChart.jsx'
import DrillChart from './charts/DrillChart.jsx'

const TITLES = { rank: '总分排名', line: '二级场景对比', bubble: '价格-得分趋势图', drill: '钻取分析' }
const EXIT_MS = 280

export default function FullscreenModal({
  fs,
  onClose,
  data,
  selectedCars,
  onToggleCar,
  drill,
  setDrill,
  onOpenDetail,
  onToggleDrillCar,
  theme,
}) {
  const [shown, setShown] = useState(null)
  const [closing, setClosing] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    if (fs) {
      setShown(fs)
      setClosing(false)
    } else if (shown) {
      setClosing(true)
      timer.current = setTimeout(() => {
        setShown(null)
        setClosing(false)
      }, EXIT_MS)
    }
    return () => clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fs])

  useEffect(() => {
    if (!shown) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, onClose])

  if (!shown) return null

  return (
    <div
      className={`fs-overlay active${closing ? ' closing' : ''}`}
      onClick={(e) => {
        if (e.target.classList.contains('fs-overlay')) onClose()
      }}
    >
      <div className={`fs-box${closing ? ' closing' : ''}`}>
        <button className="fs-close" onClick={onClose}>&times;</button>
        <div className="fs-title">{TITLES[shown]}</div>
        <div className="fs-canvas-wrap">
          {shown === 'rank' && <RankChart data={data} theme={theme} limit={0} />}
          {shown === 'line' && (
            <div style={{ position: 'relative', height: '100%' }}>
              <LineChart data={data} selectedCars={selectedCars} onToggleCar={onToggleCar} theme={theme} fullscreen />
            </div>
          )}
          {shown === 'bubble' && <BubbleChart data={data} theme={theme} fullscreen />}
          {shown === 'drill' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <DrillChart
                data={data}
                drill={drill}
                setDrill={setDrill}
                onOpenDetail={onOpenDetail}
                onToggleDrillCar={onToggleDrillCar}
                theme={theme}
                fullscreen
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
