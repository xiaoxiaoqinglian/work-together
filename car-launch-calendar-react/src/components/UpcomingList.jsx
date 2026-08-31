import { parseDate, diffDays, fmtDay, WEEK_LABELS } from '../utils/date.js'
import DateHead from './DateHead.jsx'
import EventCard from './EventCard.jsx'
import Empty from './Empty.jsx'

export default function UpcomingList({ items, filtersActive, onReset }) {
  const dayGroups = new Map()
  const monthGroups = new Map()
  items.forEach((e) => {
    const p = parseDate(e.date)
    if (p.kind === 'day') {
      if (!dayGroups.has(e.date)) dayGroups.set(e.date, [])
      dayGroups.get(e.date).push(e)
    } else if (p.kind === 'month') {
      if (!monthGroups.has(e.date)) monthGroups.set(e.date, [])
      monthGroups.get(e.date).push(e)
    }
  })

  if (dayGroups.size === 0 && monthGroups.size === 0) {
    return <Empty filtersActive={filtersActive} message="近 30 天暂未捕获到即将上市的新车信息" onReset={onReset} />
  }

  let stagger = 0
  const nextDelay = () => (stagger < 16 ? stagger++ * 35 : 0)

  const dayKeys = [...dayGroups.keys()].sort()
  const monthKeys = [...monthGroups.keys()].sort()

  return (
    <>
      {dayKeys.map((key) => {
        const d = parseDate(key).date
        const diff = diffDays(d)
        let chipClass, chipText
        if (diff < 0) {
          chipClass = 'chip-presale'; chipText = '预售中'
        } else if (diff === 0) {
          chipClass = 'chip-today'; chipText = '今天'
        } else if (diff === 1) {
          chipClass = 'chip-soon'; chipText = '明天'
        } else {
          chipClass = 'chip-soon'; chipText = `还有 ${diff} 天`
        }
        return (
          <div key={key}>
            <DateHead main={fmtDay(d)} sub={WEEK_LABELS[d.getDay()]} chipClass={chipClass} chipText={chipText} />
            <div className="cards">
              {dayGroups.get(key).map((e) => (
                <EventCard key={e.id} event={e} delay={nextDelay()} />
              ))}
            </div>
          </div>
        )
      })}
      {monthKeys.map((key) => {
        const p = parseDate(key)
        const confirmed = monthGroups.get(key).some((e) => e.dateConfirmed)
        return (
          <div key={key}>
            <DateHead
              main={`${p.year} 年 ${p.month} 月`}
              sub="具体日期待官宣"
              chipClass={confirmed ? 'chip-confirm' : 'chip-tbd'}
              chipText={confirmed ? '官方公布窗口' : '媒体预计窗口'}
            />
            <div className="cards">
              {monthGroups.get(key).map((e) => (
                <EventCard key={e.id} event={e} delay={nextDelay()} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
