import { parseDate, diffDays, fmtDay, WEEK_LABELS } from '../utils/date.js'
import DateHead from './DateHead.jsx'
import EventCard from './EventCard.jsx'
import Empty from './Empty.jsx'

export default function RecentList({ items, filtersActive, onReset }) {
  const groups = new Map()
  items.forEach((e) => {
    if (parseDate(e.date).kind === 'day') {
      if (!groups.has(e.date)) groups.set(e.date, [])
      groups.get(e.date).push(e)
    }
  })

  if (groups.size === 0) {
    return <Empty filtersActive={filtersActive} message="近 7 天暂未捕获到新车上市信息" onReset={onReset} />
  }

  let stagger = 0
  const nextDelay = () => (stagger < 16 ? stagger++ * 35 : 0)

  const keys = [...groups.keys()].sort().reverse()

  return (
    <>
      {keys.map((key) => {
        const d = parseDate(key).date
        const diff = -diffDays(d)
        let chipClass, chipText
        if (diff === 0) {
          chipClass = 'chip-today'; chipText = '今天'
        } else if (diff === 1) {
          chipClass = 'chip-ago'; chipText = '昨天'
        } else {
          chipClass = 'chip-ago'; chipText = `${diff} 天前`
        }
        return (
          <div key={key}>
            <DateHead main={fmtDay(d)} sub={WEEK_LABELS[d.getDay()]} chipClass={chipClass} chipText={chipText} />
            <div className="cards">
              {groups.get(key).map((e) => (
                <EventCard key={e.id} event={e} delay={nextDelay()} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
