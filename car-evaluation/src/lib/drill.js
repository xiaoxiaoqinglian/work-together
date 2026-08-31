import {
  carName,
  carDims,
  dimName,
  dimScore,
  dimL2s,
  l2Name,
  l2Score,
  l2L3s,
  l3Name,
  l3Score,
  getDim,
  round2,
} from './carUtils.js'
import { DIMS } from './constants.js'

const DRILL_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f97316', '#6366f1', '#22c55e', '#e11d48', '#06b6d4', '#a855f7',
  '#84cc16', '#ef4444', '#0ea5e9', '#d946ef', '#eab308', '#78716c',
]

export function getDimAvg(data) {
  return DIMS.map((dn) => {
    let total = 0,
      count = 0
    data.forEach((c) => {
      const dim = getDim(c, dn)
      if (dim && dimScore(dim) !== -1) {
        total += dimScore(dim)
        count++
      }
    })
    return { name: dn, avg: count > 0 ? total / count : 0, count }
  })
}

export function getL2Avg(data, dimNameStr) {
  const map = {}
  data.forEach((c) => {
    const dim = getDim(c, dimNameStr)
    if (!dim) return
    dimL2s(dim).forEach((l2) => {
      const n = l2Name(l2)
      if (!map[n]) map[n] = { total: 0, count: 0 }
      const sc = l2Score(l2)
      if (sc !== -1) {
        map[n].total += sc
        map[n].count++
      }
    })
  })
  return Object.entries(map).map(([name, v]) => ({ name, avg: v.count > 0 ? v.total / v.count : 0, count: v.count }))
}

export function getL3Avg(data, dimNameStr, l2NameStr) {
  const map = {}
  data.forEach((c) => {
    const dim = getDim(c, dimNameStr)
    if (!dim) return
    const l2 = dimL2s(dim).find((l) => l2Name(l) === l2NameStr)
    if (!l2) return
    l2L3s(l2).forEach((l3) => {
      const n = l3Name(l3)
      if (!map[n]) map[n] = { total: 0, count: 0 }
      const sc = l3Score(l3)
      if (sc !== -1) {
        map[n].total += sc
        map[n].count++
      }
    })
  })
  return Object.entries(map).map(([name, v]) => ({ name, avg: v.count > 0 ? v.total / v.count : 0, count: v.count }))
}

export function computeDrillData(data, drill) {
  const selNames = [...drill.selCars].filter((n) => data.some((c) => carName(c) === n))
  const labels = [],
    avgRow = [],
    counts = [],
    perCar = []
  let base
  if (drill.level === 0) {
    base = getDimAvg(data)
  } else if (drill.level === 1) {
    base = getL2Avg(data, drill.dim)
  } else {
    base = getL3Avg(data, drill.dim, drill.l2)
  }
  labels.push(...base.map((d) => d.name))
  avgRow.push(...base.map((d) => round2(d.avg)))
  counts.push(...base.map((d) => d.count))

  if (drill.level === 0) {
    selNames.forEach((name) => {
      const car = data.find((c) => carName(c) === name)
      perCar.push({
        label: name,
        data: labels.map((dn) => {
          const dim = getDim(car, dn)
          return dim ? round2(dimScore(dim)) : null
        }),
      })
    })
  } else if (drill.level === 1) {
    selNames.forEach((name) => {
      const car = data.find((c) => carName(c) === name)
      const dim = getDim(car, drill.dim)
      perCar.push({
        label: name,
        data: labels.map((l2n) => {
          if (!dim) return null
          const l2 = dimL2s(dim).find((l) => l2Name(l) === l2n)
          return l2 ? round2(l2Score(l2)) : null
        }),
      })
    })
  } else {
    selNames.forEach((name) => {
      const car = data.find((c) => carName(c) === name)
      const dim = getDim(car, drill.dim)
      const l2 = dim ? dimL2s(dim).find((l) => l2Name(l) === drill.l2) : null
      perCar.push({
        label: name,
        data: labels.map((l3n) => {
          if (!l2) return null
          const l3 = l2L3s(l2).find((x) => l3Name(x) === l3n)
          return l3 ? round2(l3Score(l3)) : null
        }),
      })
    })
  }
  return { labels, avgRow, counts, perCar, base, selNames }
}

export function buildDrillChartModel(computed, drill) {
  const { labels, avgRow, counts, perCar, base, selNames } = computed
  const mode = selNames.length === 0 ? 'avg' : selNames.length === 1 ? 'single' : 'multi'
  const totalCars = counts.length ? base.length : 0

  const datasets = []
  let skipped = []
  if (mode === 'avg' || mode === 'single') {
    datasets.push({
      label: mode === 'single' ? selNames[0] : '',
      data: mode === 'avg' ? avgRow : perCar[0].data,
      backgroundColor: labels.map((_, i) => DRILL_COLORS[i % DRILL_COLORS.length]),
      borderRadius: 6,
      borderSkipped: false,
    })
  } else {
    datasets.push({ label: '整体平均', data: avgRow, backgroundColor: '#1e293b', borderRadius: 4, borderSkipped: false })
    let colorIdx = 1
    perCar.forEach((pc) => {
      const hasAny = pc.data.some((v) => v !== null && v !== undefined)
      if (hasAny) {
        datasets.push({
          label: pc.label,
          data: pc.data,
          backgroundColor: DRILL_COLORS[colorIdx % DRILL_COLORS.length],
          borderRadius: 4,
          borderSkipped: false,
        })
        colorIdx++
      }
    })
    skipped = perCar.filter((pc) => !pc.data.some((v) => v !== null && v !== undefined)).map((pc) => pc.label)
  }

  const tooltipLabel = (c) => {
    if (c.raw === null || c.raw === undefined) return (c.dataset.label || '得分') + ': 无数据'
    const cn = counts[c.dataIndex]
    const scope = cn < totalCars ? `样本 ${cn}/${totalCars} 款` : `${cn} 款车型`
    if (mode === 'avg') return `平均 ${fmt(c.raw)} 分 (${scope})`
    if (mode === 'single') return c.dataset.label + ': ' + fmt(c.raw) + ' 分'
    return c.datasetIndex === 0 ? `整体平均 ${fmt(c.raw)} 分 (${scope})` : c.dataset.label + ': ' + fmt(c.raw) + ' 分'
  }

  return { labels, datasets, tooltipLabel, mode, selNames, skipped, base }
}

function fmt(v) {
  if (v === -1 || v === null || v === undefined || isNaN(v)) return '-'
  return Number.isInteger(Number(v)) ? v.toString() : Number(v).toFixed(2)
}

export function drillTitle(drill, mode, selNames) {
  if (drill.level === 0) {
    return mode === 'single'
      ? `「${selNames[0]}」各维度得分`
      : mode === 'multi'
        ? '整体平均与所选车型对比（各维度）'
        : '各维度平均得分'
  }
  if (drill.level === 1) {
    return mode === 'single'
      ? `「${selNames[0]}」${drill.dim} 二级场景得分`
      : mode === 'multi'
        ? `「${drill.dim}」整体平均与所选车型对比`
        : `「${drill.dim}」二级场景平均得分`
  }
  return mode === 'single'
    ? `「${selNames[0]}」${drill.l2} 三级场景得分`
    : mode === 'multi'
      ? `「${drill.dim} → ${drill.l2}」整体平均与所选车型对比`
      : `「${drill.dim} → ${drill.l2}」三级场景平均得分`
}
