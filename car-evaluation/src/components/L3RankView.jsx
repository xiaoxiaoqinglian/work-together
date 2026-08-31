import { useState, useMemo, useEffect } from 'react'
import { L2_NAMES, L3_MAP } from '../lib/constants.js'
import { carName, carDims, dimL2s, l2Name, l2L3s, l3Name, l3Score, formatScore } from '../lib/carUtils.js'

function getCarScoresForL3(cars, l2NameStr, l3NameStr) {
  const rows = []
  cars.forEach((car) => {
    let found = false
    carDims(car).forEach((dim) => {
      if (found) return
      dimL2s(dim).forEach((l2) => {
        if (found) return
        if (l2Name(l2) !== l2NameStr) return
        l2L3s(l2).forEach((l3) => {
          if (l3Name(l3) !== l3NameStr) return
          const s = l3Score(l3)
          if (s === -1) return
          rows.push({ name: carName(car), score: s })
          found = true
        })
      })
    })
  })
  return rows
}

function RankList({ rows, type }) {
  if (rows.length === 0) {
    return <div className="l3rank-empty">当前三级场景下无可用评分</div>
  }
  return rows.map((r, idx) => {
    const rank = idx + 1
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'normal'
    return (
      <div className="l3rank-item" key={r.name}>
        <div className={`l3rank-rank ${rankClass}`}>{rank}</div>
        <div className="l3rank-name">{r.name}</div>
        <div className={`l3rank-score ${type}`}>{formatScore(r.score)}</div>
      </div>
    )
  })
}

export default function L3RankView({ carsData, onBack }) {
  const [kw, setKw] = useState('')
  const [l2, setL2] = useState('')
  const [l3, setL3] = useState('')

  const l2Options = useMemo(() => {
    const list = kw.trim() ? L2_NAMES.filter((n) => n.includes(kw.trim())) : L2_NAMES
    return list
  }, [kw])

  useEffect(() => {
    if (l2Options.length === 0) {
      if (l2 !== '') setL2('')
      return
    }
    if (!l2Options.includes(l2)) setL2(l2Options[0])
  }, [l2Options])

  const l3Options = useMemo(() => (l2 && L3_MAP[l2]) || [], [l2])

  useEffect(() => {
    if (l3Options.length === 0) {
      if (l3 !== '') setL3('')
      return
    }
    if (!l3Options.includes(l3)) setL3(l3Options[0])
  }, [l3Options])

  const rows = useMemo(() => {
    if (!l2 || !l3) return []
    return getCarScoresForL3(carsData, l2, l3)
  }, [carsData, l2, l3])

  const sortedHigh = [...rows].sort((a, b) => b.score - a.score)
  const high = sortedHigh.slice(0, 5)
  const low = sortedHigh.slice(-5).reverse()

  const title = l3 || '请选择三级场景'

  return (
    <div className="l3rank-page">
      <button className="l3rank-close" onClick={onBack} title="返回看板">×</button>
      <div className="l3rank-page-header">
        <div className="l3rank-page-title-wrap">
          <div className="l3rank-page-title">Top/Bottom 榜单</div>
          <div className="l3rank-page-sub">选择三级场景，查看各车型得分排名</div>
        </div>
        <div className="l3rank-page-controls">
          <div className="l3rank-search">
            <input
              type="text"
              placeholder="搜索二级场景"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
            />
          </div>
          <div>
            <label>二级场景</label>
            <select
              className="fs"
              value={l2}
              onChange={(e) => {
                setL2(e.target.value)
              }}
            >
              {l2Options.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label>三级场景</label>
            <select
              className="fs"
              value={l3}
              disabled={l3Options.length === 0}
              onChange={(e) => setL3(e.target.value)}
            >
              {l3Options.length === 0 ? (
                <option value="">（该二级场景下无三级场景）</option>
              ) : (
                l3Options.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
      <div className="l3rank-boards">
        <div className="l3rank-board">
          <div className="l3rank-board-title">
            <span className="l3rank-dot high" />
            <span>{title}</span>-Top5
          </div>
          <div className="l3rank-list">
            <RankList rows={high} type="high" />
          </div>
        </div>
        <div className="l3rank-board">
          <div className="l3rank-board-title">
            <span className="l3rank-dot low" />
            <span>{title}</span>-Bottom5
          </div>
          <div className="l3rank-list">
            <RankList rows={low} type="low" />
          </div>
        </div>
      </div>
    </div>
  )
}
