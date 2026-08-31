import { L3_MAP, KNOWN_IDS } from './constants.js'

// car 数组结构: [name, brand, price, seg, cat, pow, total, dims]
export const carName = (c) => c[0]
export const carBrand = (c) => c[1]
export const carPrice = (c) => c[2]
export const carCat = (c) => c[4]
export const carPow = (c) => c[5]
export const carTotal = (c) => c[6]
export const carDims = (c) => c[7]

export const dimName = (d) => d[0]
export const dimScore = (d) => d[1]
export const dimL2s = (d) => d[2]
export const l2Name = (l) => l[0]
export const l2Score = (l) => l[1]
export const l2L3s = (l) => l[2]
export const l3Name = (x) => x[0]
export const l3Score = (x) => x[1]
export const l3HL = (x) => x[2]
export const l3SL = (x) => x[3]

export function formatScore(v) {
  if (v === -1 || v === null || v === undefined || isNaN(v)) return '-'
  return Number.isInteger(Number(v)) ? v.toString() : Number(v).toFixed(2)
}

export const sf = formatScore

export function round2(v) {
  if (v === -1 || v === null || v === undefined || isNaN(v)) return -1
  return Math.round(Number(v) * 100) / 100
}

export function sc(v) {
  return v >= 250 ? 'sc-hi' : v >= 200 ? 'sc-md' : 'sc-lo'
}

export function isValidFormat(car) {
  return Array.isArray(car) && car.length >= 8 && typeof car[0] === 'string' && Array.isArray(car[7])
}

export function carPriceSeg(c) {
  const p = Number(carPrice(c)) || 0
  if (p >= 50) return '50万以上'
  if (p >= 40) return '40-50万'
  if (p >= 30) return '30-40万'
  if (p >= 25) return '25-30万'
  if (p >= 20) return '20-25万'
  if (p >= 15) return '15-20万'
  if (p >= 10) return '10-15万'
  if (p >= 5) return '5-10万'
  return '5万以下'
}

export function getPriceSeg(price) {
  if (price < 5) return '5万以下'
  if (price < 10) return '5-10万'
  if (price < 15) return '10-15万'
  if (price < 20) return '15-20万'
  if (price < 25) return '20-25万'
  if (price < 30) return '25-30万'
  if (price < 40) return '30-40万'
  if (price < 50) return '40-50万'
  return '50万以上'
}

export function priceSegOrder(seg) {
  if (seg === '5万以下') return 0
  if (seg === '50万以上') return 1000
  const m = seg.match(/^(\d+)-/)
  return m ? parseInt(m[1], 10) : 999
}

export function getDim(car, name) {
  return carDims(car).find((d) => dimName(d) === name)
}

export function median(arr) {
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function cloneCarTemplate(sampleCar) {
  const dims = carDims(sampleCar).map((dim) => [
    dimName(dim),
    -1,
    dimL2s(dim).map((l2) => [l2Name(l2), -1, l2L3s(l2).map((l3) => [l3Name(l3), -1, '', ''])]),
  ])
  return ['', '', 0, '', 'SUV', '纯电', 0, dims]
}

// 补齐/重排该车所有 L2 下的三级场景：物理去重 + 按 L3_MAP 全量对齐，缺失的补入（-1 分）
export function completeL3Structure(car) {
  carDims(car).forEach((dim) => {
    const seenL2 = new Set()
    const l2Uniq = []
    dimL2s(dim).forEach((l2) => {
      const n = l2Name(l2)
      if (seenL2.has(n)) return
      seenL2.add(n)
      l2Uniq.push(l2)
    })
    dim[2] = l2Uniq
    l2Uniq.forEach((l2) => {
      const seenL3 = new Set()
      const l3Dedup = []
      l2L3s(l2).forEach((l3) => {
        const n = l3Name(l3)
        if (seenL3.has(n)) return
        seenL3.add(n)
        l3Dedup.push(l3)
      })
      l2[2] = l3Dedup

      const canonical = L3_MAP[l2Name(l2)]
      if (!canonical || canonical.length === 0) return
      const seen = new Set()
      const canonicalUniq = canonical.filter((nm) => {
        if (seen.has(nm)) return false
        seen.add(nm)
        return true
      })
      const byName = {}
      l2L3s(l2).forEach((l3) => {
        byName[l3Name(l3)] = l3
      })
      const finalList = []
      canonicalUniq.forEach((nm) => {
        if (byName[nm]) finalList.push(byName[nm])
        else finalList.push([nm, -1, '', ''])
      })
      l2[2] = finalList
    })
  })
}

// 保存时根据 L3 得分重算 L2/维度/总分（保留权威 L2 值）
export function recalcCarScores(car) {
  carDims(car).forEach((dim) => {
    dimL2s(dim).forEach((l2) => {
      const isKnown = KNOWN_IDS[carName(car)]
      if (!isKnown) {
        const seenL3 = new Set()
        const l3Uniq = []
        l2L3s(l2).forEach((l3) => {
          const n = l3Name(l3)
          if (seenL3.has(n)) return
          seenL3.add(n)
          l3Uniq.push(l3)
        })
        const validScores = l3Uniq.map(l3 => l3Score(l3)).filter((s) => s !== -1)
        if (validScores.length > 0) {
          l2[1] = round2(validScores.reduce((a, b) => a + b, 0))
        }
      }
      const validL2 = dimL2s(dim).map(l2 => l2Score(l2)).filter((s) => s !== -1)
      if (validL2.length > 0) dim[1] = round2(validL2.reduce((a, b) => a + b, 0))
    })
  })
  const validDim = carDims(car).map((d) => dimScore(d)).filter((s) => s !== -1)
  if (validDim.length > 0) car[6] = round2(validDim.reduce((a, b) => a + b, 0))
}

export function themeTextColor() {
  return document.body.classList.contains('dark') ? '#9aa3b8' : '#475569'
}

export function themeGridColor() {
  return document.body.classList.contains('dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
}
