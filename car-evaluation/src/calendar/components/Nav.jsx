export default function Nav({ updatedAt }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-brand">
          <span className="nav-logo" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2.5" width="12" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M4 1v2.6M10 1v2.6M1 6h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          新车上市日历
        </div>
        <div className="nav-meta">
          数据更新于 <span>{updatedAt || '—'}</span>
        </div>
      </div>
    </nav>
  )
}
