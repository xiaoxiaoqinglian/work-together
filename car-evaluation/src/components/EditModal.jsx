import { useState, useEffect, useRef } from 'react'
import { CAR_CATS, POWER_OPTIONS } from '../lib/constants.js'
import {
  carName,
  carDims,
  dimName,
  dimL2s,
  l2Name,
  l2L3s,
  l3Name,
  l3Score,
  l3HL,
  l3SL,
  completeL3Structure,
  recalcCarScores,
  cloneCarTemplate,
  getPriceSeg,
} from '../lib/carUtils.js'

function cleanText(v) {
  return v === '0' ? '' : v || ''
}

export default function EditModal({ editState, carsData, onClose, onSave, showToast }) {
  const [form, setForm] = useState(null)
  const draftRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (!editState) return
    let car
    if (editState.isAdding) {
      car = cloneCarTemplate(carsData[0])
    } else {
      const src = carsData.find((c) => carName(c) === editState.name)
      if (!src) {
        onClose()
        return
      }
      car = JSON.parse(JSON.stringify(src))
    }
    completeL3Structure(car)
    draftRef.current = car
    setForm({
      name: car[0] || '',
      brand: car[1] || '',
      price: car[2] === 0 ? '' : String(car[2]),
      cat: car[4] || 'SUV',
      pow: car[5] || '纯电',
    })
    return () => {
      draftRef.current = null
    }
  }, [editState])

  useEffect(() => {
    if (!editState) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editState, onClose])

  if (!editState || !form || !draftRef.current) return null
  const draft = draftRef.current

  function setL3(di, li, l3i, field, value) {
    draft[7][di][2][li][2][l3i][field] = value
  }

  function handleScoreInput(e, di, li, l3i) {
    const raw = e.target.value.trim()
    const input = e.target
    input.classList.remove('invalid')
    input.title = ''
    if (raw === '') {
      setL3(di, li, l3i, 1, -1)
      return
    }
    let v = parseFloat(raw)
    if (isNaN(v)) {
      setL3(di, li, l3i, 1, -1)
      return
    }
    if (v > 5) {
      input.classList.add('invalid')
      input.title = '得分必须在 0~5 之间'
    } else if (v < 0) {
      v = 0
    }
    setL3(di, li, l3i, 1, v)
  }

  function handleSave() {
    let firstInvalid = null
    carDims(draft).forEach((dim, di) => {
      dimL2s(dim).forEach((l2, li) => {
        l2L3s(l2).forEach((l3, l3i) => {
          const s = l3Score(l3)
          if (s !== -1 && (s < 0 || s > 5)) {
            const el = modalRef.current?.querySelector(`[data-idx="${di}-${li}-${l3i}"]`)
            if (el && !firstInvalid) firstInvalid = el
          }
        })
      })
    })
    if (firstInvalid) {
      showToast('请将所有三级场景得分填写在 0~5 分之间，当前存在超出范围的分数', 'err')
      firstInvalid.focus()
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const name = form.name.trim()
    const brand = form.brand.trim()
    const price = parseFloat(form.price)
    if (!name || !brand || isNaN(price)) {
      showToast('请填写车型名称、品牌和价格', 'err')
      return
    }

    const car = draft
    car[0] = name
    car[1] = brand
    car[2] = price
    car[3] = getPriceSeg(price)
    car[4] = form.cat
    car[5] = form.pow

    completeL3Structure(car)
    carDims(car).forEach((dim) => {
      dimL2s(dim).forEach((l2) => {
        l2L3s(l2).forEach((l3) => {
          if (l3[2] === '0') l3[2] = ''
          if (l3[3] === '0') l3[3] = ''
        })
      })
    })
    recalcCarScores(car)

    onSave(car, editState.isAdding, editState.name)
  }

  return (
    <div
      className="modal-overlay active"
      ref={modalRef}
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) onClose()
      }}
    >
      <div className="modal">
        <h2>{editState.isAdding ? '新增车型' : '编辑车型'}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>车型名称 *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>品牌 *</label>
            <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div className="form-group">
            <label>价格(万元) *</label>
            <input type="number" min="0" step="0.25" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="form-group">
            <label>类别</label>
            <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
              <option value="">请选择</option>
              {CAR_CATS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>动力</label>
            <select value={form.pow} onChange={(e) => setForm({ ...form, pow: e.target.value })}>
              {POWER_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>价位段</label>
            <input type="text" value={getPriceSeg(parseFloat(form.price) || 0)} readOnly placeholder="自动计算" />
          </div>
        </div>
        <div className="dim-scores">
          {carDims(draft).map((dim, di) => (
            <div className="edit-dim" key={dimName(dim)}>
              <div className="edit-dim-title">{dimName(dim)}</div>
              {dimL2s(dim).map((l2, li) => (
                <div className="edit-l2" key={l2Name(l2)}>
                  <div className="edit-l2-title">{l2Name(l2)}</div>
                  <div className="edit-l3-grid">
                    {l2L3s(l2).map((l3, l3i) => (
                      <div className="edit-l3-row" key={l3Name(l3)}>
                        <span className="edit-l3-name" title={l3Name(l3)}>{l3Name(l3)}</span>
                        <input
                          type="number"
                          className="edit-l3-score"
                          data-idx={`${di}-${li}-${l3i}`}
                          min="0"
                          max="5"
                          step="0.25"
                          placeholder="-"
                          defaultValue={l3Score(l3) === -1 ? '' : l3Score(l3)}
                          onChange={(e) => handleScoreInput(e, di, li, l3i)}
                        />
                        <input
                          type="text"
                          className="edit-l3-hl"
                          placeholder="亮点"
                          defaultValue={cleanText(l3HL(l3))}
                          onChange={(e) => setL3(di, li, l3i, 2, e.target.value)}
                        />
                        <input
                          type="text"
                          className="edit-l3-sl"
                          placeholder="槽点"
                          defaultValue={cleanText(l3SL(l3))}
                          onChange={(e) => setL3(di, li, l3i, 3, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
