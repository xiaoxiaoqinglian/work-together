import { useState, useEffect, useMemo, useCallback } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Filters from './components/Filters.jsx'
import Section from './components/Section.jsx'
import UpcomingList from './components/UpcomingList.jsx'
import RecentList from './components/RecentList.jsx'
import FutureList from './components/FutureList.jsx'
import Footer from './components/Footer.jsx'

const TYPE_ORDER = ['轿车', 'SUV', 'MPV', '超跑', '品牌']
const EVENT_ORDER = ['上市', '预售', '首秀', '发布会']
const DEFAULT_FILTERS = { brand: '全部', type: '全部', event: '全部', query: '' }

export default function App({ data }) {
  const { events, updatedAt, dataSource } = data
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [q, setQ] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setQ(filters.query.trim().toLowerCase()), 120)
    return () => clearTimeout(t)
  }, [filters.query])

  const stats = useMemo(() => {
    const brands = new Set()
    let upcoming = 0
    let recent = 0
    events.forEach((e) => {
      if (e.section === 'upcoming') upcoming++
      if (e.section === 'recent') recent++
      if (e.section !== 'future') brands.add(e.brand)
    })
    return { upcoming, recent, brands: brands.size }
  }, [events])

  const { brandOptions, typeOptions, eventOptions } = useMemo(() => {
    const brandCounts = new Map()
    events.forEach((e) => brandCounts.set(e.brand, (brandCounts.get(e.brand) || 0) + 1))
    const brandOptions = [...brandCounts.keys()].sort(
      (a, b) => brandCounts.get(b) - brandCounts.get(a) || a.localeCompare(b, 'zh'),
    )

    const present = (field) => {
      const counts = new Set()
      events.forEach((e) => counts.add(e[field]))
      return counts
    }
    const typeOptions = TYPE_ORDER.filter((t) => present('type').has(t))
    const eventOptions = EVENT_ORDER.filter((t) => present('eventType').has(t))
    return { brandOptions, typeOptions, eventOptions }
  }, [events])

  const sections = useMemo(() => {
    const result = { upcoming: [], recent: [], future: [] }
    events.forEach((e) => {
      if (filters.brand !== '全部' && e.brand !== filters.brand) return
      if (filters.type !== '全部' && e.type !== filters.type) return
      if (filters.event !== '全部' && e.eventType !== filters.event) return
      if (q) {
        const hay = (e.brand + ' ' + e.model + ' ' + e.desc).toLowerCase()
        if (!hay.includes(q)) return
      }
      if (result[e.section]) result[e.section].push(e)
    })
    return result
  }, [events, filters.brand, filters.type, filters.event, q])

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
      <Hero stats={stats} />
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
          id="sec-upcoming"
          icon="▲"
          title="即将上市新车"
          count={sections.upcoming.length}
          sub="未来 30 天内已公布日期或时间窗口的预售 / 上市 / 发布会"
        >
          <UpcomingList items={sections.upcoming} filtersActive={filtersActive} onReset={resetFilters} />
        </Section>
        <Section
          id="sec-recent"
          icon="★"
          title="最近上市新车"
          count={sections.recent.length}
          sub="近 7 天内正式上市 / 发布 / 开启预售的新车与事件"
        >
          <RecentList items={sections.recent} filtersActive={filtersActive} onReset={resetFilters} />
        </Section>
        <Section
          id="sec-future"
          icon="◆"
          title="更远预告"
          count={sections.future.length}
          sub="30 天以外的已官宣或媒体预计计划，先睹为快"
        >
          <FutureList items={sections.future} filtersActive={filtersActive} onReset={resetFilters} />
        </Section>
      </main>
      <Footer updatedAt={updatedAt} dataSource={dataSource} />
    </>
  )
}
