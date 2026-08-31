export default function Hero({ week7, month30, future }) {
  return (
    <header className="hero">
      <p className="hero-eyebrow">New Car Launch Calendar</p>
      <h1>新车上市日历</h1>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-num">
            {week7}
            <span className="unit">款</span>
          </span>
          <span className="stat-label">未来 7 天</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {month30}
            <span className="unit">款</span>
          </span>
          <span className="stat-label">未来 30 天</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {future}
            <span className="unit">款</span>
          </span>
          <span className="stat-label">更远预告</span>
        </div>
      </div>
    </header>
  )
}
