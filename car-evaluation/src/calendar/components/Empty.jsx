export default function Empty({ filtersActive, message, onReset }) {
  return (
    <div className="empty">
      <p className="empty-title">{filtersActive ? '没有符合当前筛选条件的车型' : '暂无收录'}</p>
      <p>{filtersActive ? '换个品牌、车型或关键词试试' : message}</p>
      {filtersActive && (
        <button className="reset-link" type="button" onClick={onReset}>
          重置全部筛选
        </button>
      )}
    </div>
  )
}
