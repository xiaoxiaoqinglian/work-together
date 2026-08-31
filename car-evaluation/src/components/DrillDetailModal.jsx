import { useEffect } from 'react'
import { carName, getDim, dimL2s, l2Name, l2L3s, l3Name, l3Score, l3HL, l3SL, sf } from '../lib/carUtils.js'

export default function DrillDetailModal({ detail, data, selNames, onClose }) {
  useEffect(() => {
    if (!detail) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detail, onClose])

  if (!detail) return null
  const targetData = selNames && selNames.length > 0 ? data.filter((c) => selNames.includes(carName(c))) : data

  const rows = []
  targetData.forEach((c) => {
    const dim = getDim(c, detail.dim)
    if (!dim) return
    const l2 = dimL2s(dim).find((l) => l2Name(l) === detail.l2)
    if (!l2) return
    const l3 = l2L3s(l2).find((x) => l3Name(x) === detail.l3)
    if (!l3) return
    rows.push({ car: carName(c), score: l3Score(l3), hl: l3HL(l3), sl: l3SL(l3) })
  })
  rows.sort((a, b) => (b.score === -1 ? -1 : b.score) - (a.score === -1 ? -1 : a.score))

  return (
    <div
      className="drill-overlay active"
      onClick={(e) => {
        if (e.target.classList.contains('drill-overlay')) onClose()
      }}
    >
      <div className="drill-modal">
        <button className="drill-close" onClick={onClose}>&times;</button>
        <h3>{detail.l3}</h3>
        <div className="drill-carname">
          {detail.dim} &gt; {detail.l2} &gt; {detail.l3} —{' '}
          {selNames && selNames.length > 0 ? `已选 ${selNames.length} 款` : `全部 ${targetData.length} 款车型`}
        </div>
        <table className="drill-table">
          <thead>
            <tr>
              <th>车型</th>
              <th>得分</th>
              <th>亮点</th>
              <th>槽点</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.car}>
                <td><strong>{r.car}</strong></td>
                <td className={`score-cell${r.score === -1 ? '' : ' sc-hi'}`}>{sf(r.score)}</td>
                <td className="hl">{r.hl || '-'}</td>
                <td className="sl">{r.sl || '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="4">当前场景下无车型数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
