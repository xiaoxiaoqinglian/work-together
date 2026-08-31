import PillTrack from './PillTrack.jsx'

export default function Filters({ filters, brandOptions, typeOptions, eventOptions, onChange }) {
  return (
    <>
      <div className="filter-row">
        <span className="filter-label">搜索</span>
        <div className="search-wrap">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            className="search"
            type="search"
            placeholder="搜索车型、品牌或关键词…"
            autoComplete="off"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
          />
        </div>
      </div>
      <div className="filter-row">
        <span className="filter-label">品牌</span>
        <PillTrack
          label="品牌"
          options={['全部', ...brandOptions]}
          value={filters.brand}
          onChange={(v) => onChange({ brand: v })}
        />
      </div>
      <div className="filter-row">
        <span className="filter-label">车型</span>
        <PillTrack
          label="车型"
          options={['全部', ...typeOptions]}
          value={filters.type}
          onChange={(v) => onChange({ type: v })}
        />
      </div>
      <div className="filter-row">
        <span className="filter-label">事件</span>
        <PillTrack
          label="事件类型"
          options={['全部', ...eventOptions]}
          value={filters.event}
          onChange={(v) => onChange({ event: v })}
        />
      </div>
    </>
  )
}
