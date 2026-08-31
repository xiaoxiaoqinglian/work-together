import { looseKey, fmtLoose } from '../utils/date.js'
import EventCard from './EventCard.jsx'
import Empty from './Empty.jsx'

export default function FutureList({ items, filtersActive, onReset }) {
  if (items.length === 0) {
    return <Empty filtersActive={filtersActive} message="暂无更远期的预告信息" onReset={onReset} />
  }

  const sorted = [...items].sort((a, b) => looseKey(a.date) - looseKey(b.date))

  return (
    <div className="cards">
      {sorted.map((e, i) => {
        const when = (e.dateConfirmed ? '' : '预计 ') + fmtLoose(e.date)
        return <EventCard key={e.id} event={e} when={when} delay={i < 16 ? i * 35 : 0} />
      })}
    </div>
  )
}
