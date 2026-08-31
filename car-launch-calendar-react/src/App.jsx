import { useState, useEffect, useMemo, useCallback } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Filters from './components/Filters.jsx'
import Section from './components/Section.jsx'
import UpcomingList from './components/UpcomingList.jsx'
import FutureList from './components/FutureList.jsx'
import Footer from './components/Footer.jsx'
import { parseDate, diffDays } from './utils/date.js'

const TYPE_ORDER = ['轿车', 'SUV', 'MPV', '超跑']
const EVENT_ORDER = ['上市发布会', '预售发布会', '技术发布会', '新车发布会']
const DEFAULT_FILTERS = { brand: '全部', type: '全部', event: '全部', query: '' }

// 把单条事件的 date 解析为一个可供比较（距今多少天）的估值。
// 精确到日：返回真实天数；模糊到月/季/半年：按该时间段起始日作为近似天数。
function daysAway(e) {
  const p = parseDate(e.date)
  if (p.kind === 'day') return diffDays(p.date)
  if (p.kind === 'month') return diffDays(new Date(p.year, p.month - 1, 1))
  if (p.kind === 'quarter') return diffDays(new Date(p.year, (p.quarter - 1) * 3, 1))
  if (p.kind === 'half') return diffDays(new Date(p.year, (p.half - 1) * 6, 1))
  return 9999
}

export default function App({ data }) {
  const { events, updatedAt, dataSource } = data
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [q, setQ] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setQ(filters.query.trim().toLowerCase()), 120)
    return () => clearTimeout(t)
  }, [filters.query])

  // 仅保留未过期（含今天及未来）的发布会事件；过期事件不显示、不可搜索、不进筛选项
  const activeEvents = useMemo(() => events.filter((e) => daysAway(e) >= 0), [events])

  const { brandOptions, typeOptions, eventOptions } = useMemo(() => {
    const brandCounts = new Map()
    activeEvents.forEach((e) => brandCounts.set(e.brand, (brandCounts.get(e.brand) || 0) + 1))
    const brandOptions = [...brandCounts.keys()].sort(
      (a, b) => brandCounts.get(b) - brandCounts.get(a) || a.localeCompare(b, 'zh'),
    )

    const present = (field) => {
      const counts = new Set()
      activeEvents.forEach((e) => counts.add(e[field]))
      return counts
    }
    const typeOptions = TYPE_ORDER.filter((t) => present('type').has(t))
    const eventOptions = EVENT_ORDER.filter((t) => present('eventType').has(t))
    return { brandOptions, typeOptions, eventOptions }
  }, [activeEvents])

  // 动态分桶：week7 = 未来7天内；month30 = 未来8~30天；future = 30天以外
  const { week7, month30, future } = useMemo(() => {
    const w7 = []
    const m30 = []
    const fut = []
    activeEvents.forEach((e) => {
      if (filters.brand !== '全部' && e.brand !== filters.brand) return
      if (filters.type !== '全部' && e.type !== filters.type) return
      if (filters.event !== '全部' && e.eventType !== filters.event) return
      if (q) {
        const hay = (e.brand + ' ' + e.model + ' ' + e.desc).toLowerCase()
        if (!hay.includes(q)) return
      }
      const d = daysAway(e)
      if (d >= 0 && d <= 7) w7.push(e)
      else if (d >= 8 && d <= 30) m30.push(e)
      else fut.push(e)
    })
    return { week7: w7, month30: m30, future: fut }
  }, [activeEvents, filters.brand, filters.type, filters.event, q])

  const week7Total = activeEvents.filter((e) => {
    const d = daysAway(e)
    return d >= 0 && d <= 7
  }).length
  const month30Total = activeEvents.filter((e) => {
    const d = daysAway(e)
    return d >= 0 && d <= 30
  }).length

  const filtersActive =
    filters.brand !== '全部' || filters.type !== '全部' || filters.event !== '全部' || q !== ''

  const setFilter = useCallback(
    (patch) => setFilters((f) => ({ ...f, ...patch })),
    [],
  )

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      <Nav updatedAt={updatedAt} />
      <Hero week7={week7Total} month30={month30Total} future={future.length} />
      <div className="filters">
        <div className="filters-card">
          <Filters
            filters={filters}
            brandOptions={brandOptions}
            typeOptions={typeOptions}
            eventOptions={eventOptions}
            onChange={setFilter}
          />
        </div>
      </div>
      <main>
        <Section
          id="sec-week7"
          icon="★"
          title="未来 7 天"
          count={week7.length}
          sub="自今天起 7 天内即将上市的预售 / 上市 / 发布会"
        >
          <UpcomingList items={week7} filtersActive={filtersActive} onReset={resetFilters} />
        </Section>
        <Section
          id="sec-month30"
          icon="▲"
          title="未来 30 天"
          count={month30.length}
          sub="未来第 8 至 30 天内已公布日期或时间窗口的新车与事件"
        >
          <UpcomingList items={month30} filtersActive={filtersActive} onReset={resetFilters} />
        </Section>
        <Section
          id="sec-future"
          icon="◆"
          title="更远预告"
          count={future.length}
          sub="30 天以外的已官宣或媒体预计计划，先睹为快"
        >
          <FutureList items={future} filtersActive={filtersActive} onReset={resetFilters} />
        </Section>
      </main>
      <Footer updatedAt={updatedAt} dataSource={dataSource} />
    </>
  )
}
