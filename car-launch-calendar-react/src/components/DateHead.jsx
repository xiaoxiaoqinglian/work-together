export default function DateHead({ main, sub, chipClass, chipText }) {
  return (
    <div className="date-head">
      <span className="date-line" />
      <span className="date-main">{main}</span>
      <span className="date-week">{sub}</span>
      <span className={`date-chip ${chipClass}`}>{chipText}</span>
    </div>
  )
}
