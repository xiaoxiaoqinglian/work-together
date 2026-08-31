export default function Footer({ updatedAt, dataSource }) {
  return (
    <footer>
      <div className="footer-inner">
        <strong>数据由 AI 联网搜索自动汇总，仅供参考，请以官方发布为准。</strong>
        <div className="footer-sources">
          信息来源：{dataSource || '汽车之家 · 新浪汽车 · 新华网 · 易车 · 太平洋汽车 · 凤凰网汽车 等公开报道'}
        </div>
        <div className="footer-updated">最后更新：{updatedAt || '—'} · 每周自动更新</div>
      </div>
    </footer>
  )
}
