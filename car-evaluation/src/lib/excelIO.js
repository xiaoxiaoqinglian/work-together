import * as XLSX from 'xlsx'
import { DIMS, CAR_CATS } from './constants.js'
import {
  carName,
  carBrand,
  carPrice,
  carPriceSeg,
  carCat,
  carPow,
  carTotal,
  carDims,
  dimName,
  dimL2s,
  l2Name,
  l2Score,
  l2L3s,
  l3Name,
  l3Score,
  l3HL,
  l3SL,
  getDim,
  cloneCarTemplate,
  completeL3Structure,
} from './carUtils.js'

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportXLSX(carsData) {
  const wb = XLSX.utils.book_new()

  const overviewData = [['车型', '品牌', '价格(万)', '类别', '动力', '价位段', '总分']]
  carsData.forEach((c) => {
    overviewData.push([
      carName(c),
      carBrand(c),
      carPrice(c),
      carCat(c),
      carPow(c),
      carPriceSeg(c),
      carTotal(c),
    ])
  })
  const ws0 = XLSX.utils.aoa_to_sheet(overviewData)
  ws0['!cols'] = overviewData[0].map((_, i) => ({ wch: i === 0 ? 16 : i === 1 ? 10 : i === 6 ? 8 : 12 }))
  XLSX.utils.book_append_sheet(wb, ws0, '00_车型总览')

  carsData.forEach((car) => {
    const name = carName(car)
    const sn = name.replace(/[/\\?*[\]:]/g, '_').slice(0, 25)
    const rows = [['维度', '二级场景', '三级场景', 'L2得分', 'L3得分', '亮点', '槽点']]
    carDims(car).forEach((dim) => {
      dimL2s(dim).forEach((l2) => {
        l2L3s(l2).forEach((l3) => {
          rows.push([
            dimName(dim),
            l2Name(l2),
            l3Name(l3),
            l2Score(l2) === -1 ? '' : l2Score(l2),
            l3Score(l3) === -1 ? '' : l3Score(l3),
            l3HL(l3) || '',
            l3SL(l3) || '',
          ])
        })
      })
    })
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, sn)
  })

  const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array', bookSST: false })
  const blob = new Blob([xlsxData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  download(blob, '场景评价结果_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.xlsx')
  return carsData.length
}

export function exportCSV(carsData) {
  const headers = ['车型名称', '品牌', '价格(万元)', '价位段', '车型类别', '动力类型', '总分']
  const colKeys = []
  DIMS.forEach((dn) => {
    const car0 = carsData[0]
    const dim = getDim(car0, dn)
    if (!dim) return
    dimL2s(dim).forEach((l2) => {
      l2L3s(l2).forEach((l3) => {
        colKeys.push([dn, l2Name(l2), l3Name(l3)])
      })
    })
  })
  colKeys.forEach(([dn, l2n, l3n]) => {
    headers.push(`${dn}>${l2n}>${l3n}_得分`, `${dn}>${l2n}>${l3n}_亮点`, `${dn}>${l2n}>${l3n}_槽点`)
  })

  const rows = [headers.join(',')]
  carsData.forEach((c) => {
    const r = [carName(c), carBrand(c), carPrice(c), carPriceSeg(c), carCat(c), carPow(c), carTotal(c)]
    colKeys.forEach(([dn, l2n, l3n]) => {
      const dim = getDim(c, dn)
      let score = '',
        hl = '',
        sl = ''
      if (dim) {
        const l2 = dimL2s(dim).find((l) => l2Name(l) === l2n)
        if (l2) {
          const l3 = l2L3s(l2).find((x) => l3Name(x) === l3n)
          if (l3) {
            score = l3Score(l3) === -1 ? '' : l3Score(l3)
            hl = l3HL(l3) || ''
            sl = l3SL(l3) || ''
          }
        }
      }
      r.push(score, hl, sl)
    })
    rows.push(
      r
        .map((v) => {
          const s = String(v)
          return s.includes(',') ? `"${s}"` : s
        })
        .join(','),
    )
  })

  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' })
  download(blob, '场景评价结果_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.csv')
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
}

function recalcImportedCar(car) {
  carDims(car).forEach((dim) => {
    dimL2s(dim).forEach((l2) => {
      if (l2[1] === -1) {
        const vs = l2L3s(l2).map(l3 => l3Score(l3)).filter((s) => s !== -1)
        if (vs.length > 0) l2[1] = Math.round(vs.reduce((a, b) => a + b, 0) * 100) / 100
      }
    })
    const vs = dimL2s(dim).map(l2 => l2Score(l2)).filter((s) => s !== -1)
    if (vs.length > 0) dim[1] = Math.round(vs.reduce((a, b) => a + b, 0) * 100) / 100
  })
  const vs = carDims(car).map((d) => d[1]).filter((s) => s !== -1)
  if (vs.length > 0) car[6] = Math.round(vs.reduce((a, b) => a + b, 0) * 100) / 100
}

// 返回 Promise<{data, totalSheets, newCount}>
export function importFile(file, carsData) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'xlsx' || ext === 'xls') {
    return importXLSX(file, carsData)
  }
  return importCSV(file, carsData)
}

function importXLSX(file, carsData) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        let newCount = 0
        wb.SheetNames.forEach((sn, si) => {
          if (si === 0) return // skip overview sheet
          const ws = wb.Sheets[sn]
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
          if (data.length < 2) return
          const carNameRaw = sn.replace(/^[0-9_]+/, '')
          let car = carsData.find((c) => carName(c) === carNameRaw)
          if (!car) {
            let brand = '',
              price = 0,
              seg = '',
              cat = 'SUV',
              pow = '插混'
            const ovData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 })
            for (let j = 1; j < ovData.length; j++) {
              if (String(ovData[j][0] || '').trim() === carNameRaw) {
                brand = String(ovData[j][1] || '').trim() || carNameRaw.slice(0, 2)
                price = parseFloat(ovData[j][2]) || 20
                seg = String(ovData[j][5] || '').trim() || '20-30万'
                cat = String(ovData[j][3] || '').trim() || 'SUV'
                pow = String(ovData[j][4] || '').trim() || '插混'
                break
              }
            }
            car = cloneCarTemplate(carsData[0])
            car[0] = carNameRaw
            car[1] = brand || carNameRaw.slice(0, 2)
            car[2] = price || 20
            car[3] = seg || '20-30万'
            car[4] = CAR_CATS.includes(cat) ? cat : 'SUV'
            car[5] = pow || '插混'
            car[6] = 0
            carsData.push(car)
            newCount++
          }
          completeL3Structure(car)

          let curDim = '',
            curL2 = ''
          const l2SetScores = {}
          for (let i = 1; i < data.length; i++) {
            const row = data[i]
            const dimV = String(row[0] || '').trim()
            const l2V = String(row[1] || '').trim()
            const l3N = String(row[2] || '').trim()
            if (dimV) curDim = dimV
            if (l2V) curL2 = l2V
            if (!curDim || !curL2) continue

            const l2ScoreVal = row[3]
            const l3ScoreVal = row[4]
            const hlVal = String(row[5] || '').trim()
            const slVal = String(row[6] || '').trim()

            const key = curDim + '>' + curL2
            if (l2ScoreVal !== '' && l2ScoreVal !== undefined && l2ScoreVal !== null && !(key in l2SetScores)) {
              const v = parseFloat(l2ScoreVal)
              if (!isNaN(v)) l2SetScores[key] = v
            }
            if (!l3N) continue

            const dim = getDim(car, curDim)
            if (!dim) continue
            const l2 = dimL2s(dim).find((l) => l2Name(l) === curL2)
            if (!l2) continue
            const l3 = l2L3s(l2).find((x) => l3Name(x) === l3N)
            if (!l3) continue

            if (l3ScoreVal !== '' && l3ScoreVal !== undefined && l3ScoreVal !== null) {
              const v = parseFloat(l3ScoreVal)
              if (!isNaN(v)) l3[1] = v
            }
            if (hlVal) l3[2] = hlVal
            if (slVal) l3[3] = slVal
          }
          // 仅当 L2 无权威值（-1，新增车型）时才用导入的 L2 值
          Object.entries(l2SetScores).forEach(([key, score]) => {
            const [d, l2n] = key.split('>')
            const dim = getDim(car, d)
            if (!dim) return
            const l2 = dimL2s(dim).find((l) => l2Name(l) === l2n)
            if (!l2) return
            if (l2[1] === -1) l2[1] = score
          })
          recalcImportedCar(car)
        })
        resolve({ data: carsData, totalSheets: wb.SheetNames.length - 1, newCount })
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

function importCSV(file, carsData) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result.replace(/^\uFEFF/, '')
        const lines = text.split(/\r?\n/).filter((l) => l.trim())
        const headers = lines[0].split(',')
        const colMap = []
        for (let i = 7; i < headers.length; i += 3) {
          const key = headers[i].replace(/_得分$/, '')
          const parts = key.split('>')
          if (parts.length === 3) colMap.push({ parts, idx: i })
        }

        for (let i = 1; i < lines.length; i++) {
          const vals = parseCSVLine(lines[i])
          const name = vals[0]?.trim()
          if (!name) continue
          const car = carsData.find((c) => carName(c) === name)
          if (!car) continue

          colMap.forEach(({ parts, idx }) => {
            const [dn, l2n, l3n] = parts
            const dim = getDim(car, dn)
            if (!dim) return
            const l2 = dimL2s(dim).find((l) => l2Name(l) === l2n)
            if (!l2) return
            const l3 = l2L3s(l2).find((x) => l3Name(x) === l3n)
            if (!l3) return

            const sv = vals[idx]?.trim()
            if (sv !== '' && sv !== undefined) l3[1] = parseFloat(sv)
            if (vals[idx + 1]) l3[2] = vals[idx + 1].trim()
            if (vals[idx + 2]) l3[3] = vals[idx + 2].trim()
          })

          carDims(car).forEach((dim) => {
            dimL2s(dim).forEach((l2) => {
              if (l2[1] === -1) {
                const vs = l2L3s(l2).map(l3 => l3Score(l3)).filter((s) => s !== -1)
                l2[1] = vs.length > 0 ? Math.round(vs.reduce((a, b) => a + b, 0) * 10) / 10 : -1
              }
            })
            const vs = dimL2s(dim).map(l2 => l2Score(l2)).filter((s) => s !== -1)
            dim[1] = vs.length > 0 ? Math.round(vs.reduce((a, b) => a + b, 0) * 10) / 10 : -1
          })
          const vs = carDims(car).map((d) => d[1]).filter((s) => s !== -1)
          car[6] = vs.length > 0 ? Math.round(vs.reduce((a, b) => a + b, 0) * 10) / 10 : 0
        }
        resolve({ data: carsData, totalSheets: 0, newCount: 0 })
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsText(file)
  })
}
