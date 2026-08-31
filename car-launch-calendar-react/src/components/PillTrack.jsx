import { useRef, useState, useEffect, useCallback } from 'react'

export default function PillTrack({ label, options, value, onChange }) {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    setCanPrev(track.scrollLeft > 4)
    setCanNext(track.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, options])

  const scrollBy = (dir) => {
    trackRef.current?.scrollBy({ left: 240 * dir, behavior: 'smooth' })
  }

  // 鼠标滚轮：行内还有滚动余量时横向滚动，滚到头则正常滚动页面
  const onWheel = (e) => {
    const track = trackRef.current
    if (!track || e.deltaY === 0) return
    const max = track.scrollWidth - track.clientWidth
    const canGo = e.deltaY > 0 ? track.scrollLeft < max - 1 : track.scrollLeft > 1
    if (canGo) {
      e.preventDefault()
      track.scrollLeft += e.deltaY
    }
  }

  return (
    <div className={`track-wrap${canPrev ? ' can-prev' : ''}${canNext ? ' can-next' : ''}`}>
      <div className="track-fade left" />
      <button
        className={`track-btn prev${canPrev ? ' show' : ''}`}
        type="button"
        aria-label={`查看前面的${label}`}
        onClick={() => scrollBy(-1)}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="pill-track" ref={trackRef} onScroll={update} onWheel={onWheel} role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            className={`pill${value === opt ? ' active' : ''}`}
            type="button"
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        className={`track-btn next${canNext ? ' show' : ''}`}
        type="button"
        aria-label={`查看更多${label}`}
        onClick={() => scrollBy(1)}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M4.5 2L8.5 6l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="track-fade right" />
    </div>
  )
}
