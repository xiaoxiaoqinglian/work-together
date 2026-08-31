export default function Sidebar({ view, onNav, theme, onToggleTheme, collapsed, onToggleCollapsed }) {
  const items = [
    { key: 'board', icon: '▦', label: '多维度场景评分看板' },
    { key: 'calendar', icon: '📅', label: '新车上市日历' },
  ]
  const activeKey = view === 'calendar' ? 'calendar' : 'board'

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">A</div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">Adminator</div>
          <div className="sidebar-brand-sub">汽车评分</div>
        </div>
        <button className="sidebar-toggle" onClick={onToggleCollapsed} title="折叠/展开侧栏">
          <span className="arrow">◂</span>
        </button>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-group-body">
          {items.map((it) => (
            <div
              key={it.key}
              className={`sidebar-item${activeKey === it.key ? ' active' : ''}`}
              onClick={() => onNav(it.key)}
            >
              <span className="sidebar-item-icon">{it.icon}</span>
              <span>{it.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="theme-toggle-wrap">
        <button className="theme-toggle" onClick={onToggleTheme} title="切换主题">
          <span className="theme-icon">{theme === 'dark' ? '☀' : '🌙'}</span>
          <span className="theme-label">{theme === 'dark' ? '亮色主题' : '暗色主题'}</span>
        </button>
      </div>
    </aside>
  )
}
