import { useRef } from 'react'
import { exportXLSX } from '../lib/excelIO.js'

export default function Header({
  syncStatus,
  onForceReload,
  onImport,
  showToast,
  carsData,
  theme,
  onToggleTheme,
}) {
  const fileRef = useRef(null)
  const today = (() => {
    const d = new Date()
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  })()

  const badgeClass =
    syncStatus === 'ok'
      ? 'sync-badge'
      : syncStatus === 'ok-blob'
        ? 'sync-badge'
        : syncStatus === 'error'
          ? 'sync-badge error'
          : syncStatus === 'loading'
            ? 'sync-badge'
            : 'sync-badge local'

  const badgeText =
    syncStatus === 'ok'
      ? '已同步云端'
      : syncStatus === 'ok-blob'
        ? '已同步云端(extendsclass)'
        : syncStatus === 'error'
          ? '同步失败'
          : syncStatus === 'loading'
            ? '正在拉取云端...'
            : '本地模式'

  async function handleExport() {
    try {
      const n = exportXLSX(carsData)
      showToast(`已导出 ${n} 款车型（多 sheet Excel）`, 'ok')
    } catch (e) {
      showToast('导出失败: ' + e.message, 'err')
    }
  }

  async function handleFile(e) {
    const file = e.target.files[0]
    if (file) await onImport(file)
    e.target.value = ''
  }

  return (
    <header className="app-header">
      <div>
        <div className="app-header-sub">
          <span className="app-header-date">{today}</span> · <span className="accent">5 维度 × 29 二级场景</span>
        </div>
      </div>
      <div className="app-header-right">
        <span className={badgeClass}>
          <span className="dot"></span>
          {badgeText}
        </span>
        <button
          className="theme-toggle-header"
          onClick={onToggleTheme}
          title={theme === 'dark' ? '当前暗色主题' : '当前亮色主题'}
        >
          <span className="theme-toggle-icon">{theme === 'dark' ? '🌙' : '☀'}</span>
        </button>
        <button className="btn-adminator" onClick={onForceReload} title="清除本地缓存，重新从Supabase拉取最新数据">
          ↻ 强制刷新
        </button>
        <button className="btn-adminator" onClick={handleExport}>
          ⬇ 导出数据
        </button>
        <button className="btn-adminator primary" onClick={() => fileRef.current?.click()}>
          ⬆ 导入数据
        </button>
        <input ref={fileRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={handleFile} />
        <button className="btn-adminator" onClick={() => (window.location.href = '/')} title="返回主页面">
          ← 退出
        </button>
      </div>
    </header>
  )
}
