import { carName, carTotal, formatScore, median } from '../lib/carUtils.js'

function StatCard({ icon, iconCls, trend, trendCls, label, value, unit, sub, hero }) {
  return (
    <div className={`stat-card${hero ? ' kpi-hero' : ''}`}>
      <div className="stat-card-top">
        <div className={`stat-icon ${iconCls}`} dangerouslySetInnerHTML={{ __html: icon }} />
        <span className={`stat-trend${trendCls ? ' ' + trendCls : ''}`}>{trend}</span>
      </div>
      <div className="stat-card-bottom">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">
            {value}
            <span className="unit">{unit}</span>
          </div>
        </div>
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

export default function StatsRow({ data, totalCount }) {
  if (!data || data.length === 0) {
    return (
      <div className="stats-row">
        <StatCard icon="&#x1F4CA;" iconCls="c1" label="评估车型" value="0" />
        <StatCard icon="&#x2B50;" iconCls="c2" label="最高总分" value="-" />
        <StatCard icon="&#x1F4C8;" iconCls="c3" label="平均总分" value="-" />
        <StatCard icon="&#x1F3C6;" iconCls="c4" label="300分以上" value="0" />
      </div>
    )
  }
  const max = Math.max(...data.map((c) => carTotal(c)))
  const avg = data.reduce((a, c) => a + carTotal(c), 0) / data.length
  const top = data.filter((c) => carTotal(c) >= 300).length
  const best = data.find((c) => carTotal(c) === max)
  const topRatio = top / data.length
  return (
    <div className="stats-row">
      <StatCard
        icon="&#x1F4CA;"
        iconCls="c1"
        trend="+10%"
        label="评估车型"
        value={data.length}
        unit="款"
        sub={
          <>
            <span className="arrow-up">↑</span>
            <span className="num">{totalCount} 款</span> 总数据库
          </>
        }
      />
      <StatCard
        icon="&#x2B50;"
        iconCls="c2"
        hero
        trend={`+${Math.round(max / 5)}%`}
        label="最高车型得分"
        value={formatScore(max)}
        unit="分"
        sub={
          <>
            <span className="arrow-up">↑</span>
            <span className="num">{best ? carName(best) : '-'}</span>
          </>
        }
      />
      <StatCard
        icon="&#x1F4C8;"
        iconCls="c3"
        trend="steady"
        trendCls="steady"
        label="平均总分"
        value={formatScore(avg)}
        unit="分"
        sub={
          <>
            中位数 <span className="num">{formatScore(median(data.map((c) => carTotal(c))))}</span>
          </>
        }
      />
      <StatCard
        icon="&#x1F3C6;"
        iconCls="c4"
        trend={topRatio >= 0.3 ? 'steady' : '-5%'}
        trendCls={topRatio >= 0.3 ? 'steady' : 'down'}
        label="300分以上"
        value={top}
        unit="款"
        sub={
          <>
            占比 <span className="num">{formatScore((topRatio * 100).toFixed(0))}%</span>
          </>
        }
      />
    </div>
  )
}
