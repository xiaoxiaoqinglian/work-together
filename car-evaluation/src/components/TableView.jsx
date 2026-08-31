import { carName, carBrand, carPrice, carCat, carPow, carTotal, carDims, dimScore, getDim, formatScore, sf, sc } from '../lib/carUtils.js'
import { DIMS } from '../lib/constants.js'

function catBadgeCls(cat) {
  return cat === 'SUV' ? 'bd-suv' : cat === '轿车' ? 'bd-car' : cat === 'MPV' ? 'bd-mpv' : 'bd-other'
}
function powBadgeCls(pow) {
  return pow === '纯电' ? 'bd-ev' : pow === '插混' ? 'bd-hybrid' : pow === '增程' ? 'bd-range' : 'bd-fuel'
}

export default function TableView({ data, onEdit, onDelete, onAdd, onOpenL3Rank }) {
  const sorted = [...data].sort((a, b) => carTotal(b) - carTotal(a))

  return (
    <div className="table-panel">
      <div className="table-title">
        车型评估明细
        <button className="btn-sm" style={{ marginLeft: 'auto' }} onClick={onOpenL3Rank}>🏆 Top/Bottom 榜单</button>
        <button className="btn-sm primary" onClick={onAdd}>+ 新增车型</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>车型</th>
              <th>品牌</th>
              <th>价格</th>
              <th>类别</th>
              <th>动力</th>
              {DIMS.map((d) => (
                <th key={d}>{d}</th>
              ))}
              <th>总分</th>
              <th>编辑</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7 + DIMS.length}>
                  <div className="empty-state">暂无匹配数据</div>
                </td>
              </tr>
            )}
            {sorted.map((c, i) => {
              const ts = carTotal(c)
              const cls = sc(ts)
              const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`
              return (
                <tr key={carName(c)}>
                  <td>
                    <strong>
                      {rank} {carName(c)}
                    </strong>
                  </td>
                  <td>{carBrand(c)}</td>
                  <td>
                    <span className="price-tag">{carPrice(c)}万</span>
                  </td>
                  <td>
                    <span className={`badge ${catBadgeCls(carCat(c))}`}>{carCat(c)}</span>
                  </td>
                  <td>
                    <span className={`badge ${powBadgeCls(carPow(c))}`}>{carPow(c)}</span>
                  </td>
                  {DIMS.map((dn) => {
                    const dim = getDim(c, dn)
                    const s = dim ? dimScore(dim) : -1
                    return (
                      <td key={dn} className="score-cell">
                        {sf(s)}
                      </td>
                    )
                  })}
                  <td className="score-cell">
                    <strong className={cls}>{formatScore(ts)}</strong>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => onEdit(carName(c))}>编辑</button>
                    <button className="btn-del" onClick={() => onDelete(carName(c))}>删除</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
