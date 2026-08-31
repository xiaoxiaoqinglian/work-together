export default function Section({ id, icon, title, count, sub, children }) {
  return (
    <section className="section" id={id}>
      <div className="sec-head">
        <span className="sec-icon" aria-hidden="true">{icon}</span>
        <h2 className="sec-title">{title}</h2>
        <span className="sec-count">{count} 款</span>
      </div>
      <p className="sec-sub">{sub}</p>
      {children}
    </section>
  )
}
