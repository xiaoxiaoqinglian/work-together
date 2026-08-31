export default function Hero({ stats }) {
  return (
    <header className="hero">
      <p className="hero-eyebrow">New Car Launch Calendar</p>
      <h1>新车上市日历</h1>
      <p className="hero-sub">实时追踪主流车企的预售、上市与技术发布会动态，覆盖新势力与传统主机厂。</p>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-num">
            {stats.upcoming}
            <span className="unit">款</span>
          </span>
          <span className="stat-label">即将上市 · 未来 30 天</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {stats.recent}
            <span className="unit">款</span>
          </span>
          <span className="stat-label">最近 7 天上市 / 发布</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {stats.brands}
            <span className="unit">个</span>
          </span>
          <span className="stat-label">覆盖品牌</span>
        </div>
      </div>
    </header>
  )
}
