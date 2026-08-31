import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Header from './components/Header.jsx'
import Toast from './components/Toast.jsx'
import ConfirmModal from './components/ConfirmModal.jsx'
import StatsRow from './components/StatsRow.jsx'
import FilterBar from './components/FilterBar.jsx'
import ChartsGrid from './components/ChartsGrid.jsx'
import TableView from './components/TableView.jsx'
import EditModal from './components/EditModal.jsx'
import DrillDetailModal from './components/DrillDetailModal.jsx'
import L3RankView from './components/L3RankView.jsx'
import FullscreenModal from './components/FullscreenModal.jsx'
import {
  loadCars,
  saveCars,
  saveCarsLocal,
  deleteCarCloud,
  forceReloadFromCloud,
} from './lib/supabase.js'
import { importFile } from './lib/excelIO.js'
import {
  carName,
  carBrand,
  carPriceSeg,
  priceSegOrder,
  completeL3Structure,
} from './lib/carUtils.js'
import { CAR_CATS, POWER_OPTIONS } from './lib/constants.js'

const THEME_KEY = 'car_eval_theme'

const EMPTY_FILTERS = { price: '', pow: '', brand: '', cat: '', minS: '', maxS: '', search: '' }

export default function App() {
  const [booting, setBooting] = useState(true)
  const [carsData, setCarsData] = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')

  const [view, setView] = useState('board')
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'light'
    } catch (e) {
      return 'light'
    }
  })

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedCars, setSelectedCars] = useState(() => new Set())
  const [drill, setDrillState] = useState(() => ({ level: 0, dim: null, l2: null, selCars: new Set() }))
  const [chartsCollapsed, setChartsCollapsed] = useState(false)

  const [toast, setToast] = useState(null)
  const [confirm, setConfirmState] = useState(null)
  const [editState, setEditState] = useState(null)
  const [drillDetail, setDrillDetail] = useState(null)
  const [fs, setFs] = useState(null)

  const toastTimer = useRef(null)

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (e) {}
  }, [theme])

  const showToast = useCallback((msg, type = 'ok') => {
    clearTimeout(toastTimer.current)
    setToast({ msg, type, leaving: false })
    toastTimer.current = setTimeout(() => {
      setToast((t) => (t ? { ...t, leaving: true } : t))
      setTimeout(() => setToast(null), 300)
    }, 2400)
  }, [])

  const showConfirm = useCallback((msg, cb) => {
    setConfirmState({ msg, cb })
  }, [])

  const bootstrapData = useCallback(async () => {
    setSyncStatus('loading')
    try {
      const data = await loadCars()
      data.forEach(completeL3Structure)
      if (data.length > 0) saveCarsLocal(data)
      setCarsData(data)
      setSyncStatus(data.length > 0 ? 'ok' : 'error')
    } catch (e) {
      setSyncStatus('error')
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await bootstrapData()
      setBooting(false)
    })()
  }, [bootstrapData])

  const handleForceReload = useCallback(() => {
    showConfirm('确定要从云端恢复最新数据吗？本地未同步的修改将丢失。', async () => {
      try {
        const data = await forceReloadFromCloud(completeL3Structure)
        setCarsData(data)
        setSyncStatus('ok')
        setFilters(EMPTY_FILTERS)
        setDrillState((prev) => ({ ...prev, level: 0, dim: null, l2: null }))
        showToast('已恢复云端最新数据', 'ok')
      } catch (e) {
        setSyncStatus('error')
        showToast('从云端恢复失败，请重试', 'err')
      }
    })
  }, [showConfirm, showToast])

  const handleImport = useCallback(
    async (file) => {
      try {
        const working = JSON.parse(JSON.stringify(carsData))
        const res = await importFile(file, working)
        setCarsData(res.data)
        setSyncStatus('loading')
        const r = await saveCars(res.data)
        setSyncStatus(r)
        showToast(`导入完成：共 ${res.totalSheets} 个车型 sheet，新增 ${res.newCount} 款`, 'ok')
      } catch (e) {
        showToast('导入失败: ' + (e.message || e), 'err')
      }
    },
    [carsData, showToast],
  )

  const filtered = useMemo(() => {
    const minS = parseFloat(filters.minS)
    const minV = isNaN(minS) ? 0 : minS
    const maxS = parseFloat(filters.maxS)
    const maxV = isNaN(maxS) ? 999 : maxS
    const kw = (filters.search || '').trim().toLowerCase()
    return carsData.filter((c) => {
      if (filters.price && carPriceSeg(c) !== filters.price) return false
      if (filters.pow && c[5] !== filters.pow) return false
      if (filters.brand && carBrand(c) !== filters.brand) return false
      if (filters.cat && c[4] !== filters.cat) return false
      if (c[6] < minV || c[6] > maxV) return false
      if (kw && !c[0].toLowerCase().includes(kw) && !String(c[1] || '').toLowerCase().includes(kw)) return false
      return true
    })
  }, [carsData, filters])

  // 折线图默认选中第一辆车
  useEffect(() => {
    if (selectedCars.size === 0 && filtered.length > 0) {
      setSelectedCars(new Set([carName(filtered[0])]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered])

  const filterOptions = useMemo(() => {
    const segs = [...new Set(carsData.map(carPriceSeg))].sort((a, b) => priceSegOrder(a) - priceSegOrder(b))
    const brands = [...new Set(carsData.map(carBrand))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'zh-CN'))
    return { segs, pows: POWER_OPTIONS, brands, cats: CAR_CATS }
  }, [carsData])

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setDrillState((prev) => ({ ...prev, level: 0, dim: null, l2: null }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setDrillState((prev) => ({ ...prev, level: 0, dim: null, l2: null }))
  }, [])

  const toggleCar = useCallback((name) => {
    setSelectedCars((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  const setDrill = useCallback((patch) => {
    setDrillState((prev) => ({ ...prev, ...patch }))
  }, [])

  const toggleDrillCar = useCallback((name) => {
    setDrillState((prev) => {
      const selCars = new Set(prev.selCars)
      if (selCars.has(name)) selCars.delete(name)
      else selCars.add(name)
      return { ...prev, selCars }
    })
  }, [])

  const handleOpenL3Rank = useCallback(() => {
    setView('l3rank')
    window.scrollTo({ top: 0 })
  }, [])

  const handleBackFromL3Rank = useCallback(() => {
    setView('board')
    window.scrollTo({ top: 0 })
  }, [])

  const handleSaveCar = useCallback(
    async (car, isAdding, originalName) => {
      let next
      if (isAdding) {
        next = [...carsData, car]
      } else {
        next = carsData.map((c) => (carName(c) === originalName ? car : c))
        if (originalName !== carName(car)) {
          setSelectedCars((prev) => {
            const n = new Set(prev)
            if (n.delete(originalName)) n.add(carName(car))
            return n
          })
          setDrillState((prev) => {
            const n = new Set(prev.selCars)
            if (n.delete(originalName)) n.add(carName(car))
            return { ...prev, selCars: n }
          })
        }
      }
      setCarsData(next)
      setEditState(null)
      setSyncStatus('loading')
      const r = await saveCars(next)
      setSyncStatus(r)
      showToast(isAdding ? `已新增「${carName(car)}」` : `已更新「${carName(car)}」`, 'ok')
    },
    [carsData, showToast],
  )

  const handleDeleteCar = useCallback(
    (name) => {
      showConfirm(`确定要删除「${name}」吗？此操作不可撤销。`, async () => {
        const next = carsData.filter((c) => carName(c) !== name)
        setCarsData(next)
        saveCarsLocal(next)
        deleteCarCloud(name)
        setSelectedCars((prev) => {
          const n = new Set(prev)
          n.delete(name)
          return n
        })
        setDrillState((prev) => {
          const n = new Set(prev.selCars)
          n.delete(name)
          return { ...prev, selCars: n }
        })
        showToast(`已删除「${name}」`, 'ok')
      })
    },
    [carsData, showConfirm, showToast],
  )

  if (booting) {
    return <div className="boot-loading">正在加载...</div>
  }

  return (
    <>
      <div className="page-title-bar">
        <h1>多维度场景评分看板</h1>
      </div>
      <div className="layout-row">
        <div className="main-content">
          <Header
            syncStatus={syncStatus}
            onForceReload={handleForceReload}
            onImport={handleImport}
            showToast={showToast}
            carsData={carsData}
            theme={theme}
            onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          />
          {view === 'l3rank' ? (
            <L3RankView carsData={carsData} onBack={handleBackFromL3Rank} />
          ) : (
            <div className="container">
              <StatsRow data={filtered} totalCount={carsData.length} />
              <FilterBar
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                options={filterOptions}
                filteredCount={filtered.length}
                totalCount={carsData.length}
              />
              <ChartsGrid
                data={filtered}
                selectedCars={selectedCars}
                onToggleCar={toggleCar}
                drill={drill}
                setDrill={setDrill}
                onToggleDrillCar={toggleDrillCar}
                onOpenDrillDetail={(dim, l2, l3) => setDrillDetail({ dim, l2, l3 })}
                onOpenFullscreen={setFs}
                theme={theme}
                collapsed={chartsCollapsed}
                onToggleCollapsed={() => setChartsCollapsed((c) => !c)}
              />
              <TableView
                data={filtered}
                onEdit={(name) => setEditState({ isAdding: false, name })}
                onDelete={handleDeleteCar}
                onAdd={() => setEditState({ isAdding: true, name: null })}
                onOpenL3Rank={handleOpenL3Rank}
              />
            </div>
          )}
        </div>
      </div>

      <FullscreenModal
        fs={fs}
        onClose={() => setFs(null)}
        data={filtered}
        selectedCars={selectedCars}
        onToggleCar={toggleCar}
        drill={drill}
        setDrill={setDrill}
        onOpenDetail={(dim, l2, l3) => setDrillDetail({ dim, l2, l3 })}
        onToggleDrillCar={toggleDrillCar}
        theme={theme}
      />
      <DrillDetailModal
        detail={drillDetail}
        data={filtered}
        selNames={[...drill.selCars]}
        onClose={() => setDrillDetail(null)}
      />
      <EditModal
        editState={editState}
        carsData={carsData}
        onClose={() => setEditState(null)}
        onSave={handleSaveCar}
        showToast={showToast}
      />
      <ConfirmModal
        confirm={confirm ? confirm.msg : null}
        onCancel={() => setConfirmState(null)}
        onOk={() => {
          const cb = confirm && confirm.cb
          setConfirmState(null)
          if (cb) cb()
        }}
      />
      <Toast toast={toast} />
    </>
  )
}
