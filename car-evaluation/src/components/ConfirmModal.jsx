export default function ConfirmModal({ confirm, onCancel, onOk }) {
  return (
    <div className={`confirm-overlay${confirm ? ' active' : ''}`} onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p>{confirm}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button className="btn-save" onClick={onOk}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
