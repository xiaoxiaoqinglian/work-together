export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div
      className={`toast ${toast.type}`}
      style={{
        opacity: toast.leaving ? 0 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      {toast.msg}
    </div>
  )
}
