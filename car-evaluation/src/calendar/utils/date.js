const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const DAY_MS = 86400000

const now = new Date()
const T = new Date(now.getFullYear(), now.getMonth(), now.getDate())

export const WEEK_LABELS = WEEK

export function parseDate(str) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return { kind: 'day', date: new Date(str + 'T00:00:00') }
  }
  if (/^\d{4}-\d{2}$/.test(str)) {
    return { kind: 'month', year: +str.slice(0, 4), month: +str.slice(5, 7) }
  }
  if (/^\d{4}-Q[1-4]$/.test(str)) {
    return { kind: 'quarter', year: +str.slice(0, 4), quarter: +str.slice(6, 7) }
  }
  if (/^\d{4}-H[1-2]$/.test(str)) {
    return { kind: 'half', year: +str.slice(0, 4), half: +str.slice(6, 7) }
  }
  return { kind: 'unknown' }
}

export function looseKey(str) {
  const p = parseDate(str)
  if (p.kind === 'month') return p.year * 100 + p.month
  if (p.kind === 'quarter') return p.year * 100 + p.quarter * 3
  if (p.kind === 'half') return p.year * 100 + p.half * 6
  return 999999
}

export function fmtLoose(str) {
  const p = parseDate(str)
  if (p.kind === 'month') return `${p.year} 年 ${p.month} 月`
  if (p.kind === 'quarter') return `${p.year} 年第${'一二三四'[p.quarter - 1]}季度`
  if (p.kind === 'half') return `${p.year} 下半年`
  return str
}

export function fmtDay(d) {
  const y = d.getFullYear() === now.getFullYear() ? '' : d.getFullYear() + '年'
  return y + (d.getMonth() + 1) + '月' + d.getDate() + '日'
}

export function diffDays(d) {
  return Math.round((d - T) / DAY_MS)
}
