import { useEffect, useRef, useState } from 'react'

// 输入框统一 debounce 220ms，避免频繁重渲染
export default function FilterBar({ filters, onChange, onReset, options, filteredCount, totalCount }) {
  const [search, setSearch] = useState(filters.search)
  const [minS, setMinS] = useState(filters.minS)
  const [maxS, setMaxS] = useState(filters.maxS)
  const timerRef = useRef(null)

  useEffect(() => {
    setSearch(filters.search)
    setMinS(filters.minS)
    setMaxS(filters.maxS)
  }, [filters])

  function debounced(patch) {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(patch), 220)
  }

  const { segs, pows, brands, cats } = options

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">价位段</span>
        <select className="fs" value={filters.price} onChange={(e) => onChange({ price: e.target.value })}>
          <option value="">全部</option>
          {segs.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <span className="filter-label">动力</span>
        <select className="fs" value={filters.pow} onChange={(e) => onChange({ pow: e.target.value })}>
          <option value="">全部</option>
          {pows.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <span className="filter-label">品牌</span>
        <select className="fs" value={filters.brand} onChange={(e) => onChange({ brand: e.target.value })}>
          <option value="">全部</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <span className="filter-label">类别</span>
        <select className="fs" value={filters.cat} onChange={(e) => onChange({ cat: e.target.value })}>
          <option value="">全部</option>
          {cats.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <span className="filter-label">最低总分</span>
        <input
          type="number"
          className="fi"
          value={minS}
          min="0"
          placeholder="0"
          onChange={(e) => {
            setMinS(e.target.value)
            debounced({ minS: e.target.value })
          }}
        />
      </div>
      <div className="filter-group">
        <span className="filter-label">最高总分</span>
        <input
          type="number"
          className="fi"
          value={maxS}
          min="0"
          placeholder="455"
          onChange={(e) => {
            setMaxS(e.target.value)
            debounced({ maxS: e.target.value })
          }}
        />
      </div>
      <div className="search-wrap">
        <span className="sicon">🔍</span>
        <input
          type="text"
          value={search}
          placeholder="搜索车型或品牌..."
          onChange={(e) => {
            setSearch(e.target.value)
            debounced({ search: e.target.value })
          }}
        />
      </div>
      <button className="btn-sm" onClick={onReset}>重置筛选</button>
      <span className="filter-count">匹配 {filteredCount} / {totalCount} 款</span>
    </div>
  )
}
