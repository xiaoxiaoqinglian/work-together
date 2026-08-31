export default function EventCard({ event, when, delay }) {
  const tagClass = {
    上市发布会: 'tag-launch',
    预售发布会: 'tag-presale',
    技术发布会: 'tag-event',
    新车发布会: 'tag-reveal',
  }[event.eventType] || 'tag-type'

  return (
    <article className="card" style={delay ? { animationDelay: delay + 'ms' } : undefined}>
      <div className="card-top">
        <span className="card-brand">{event.brand}</span>
        {when && <span className="card-when">{when}</span>}
      </div>
      <h3 className="card-title">{event.model}</h3>
      <div className="card-tags">
        <span className="tag tag-type">{event.type}</span>
        <span className={`tag ${tagClass}`}>{event.eventType}</span>
        {!event.dateConfirmed && <span className="tag tag-tbd">预计</span>}
      </div>
      <p className="card-desc">{event.desc}</p>
      <div className="card-bottom">
        {event.price ? (
          <span className="price">
            {event.price}
            {event.priceNote && <span className="price-note">{event.priceNote}</span>}
          </span>
        ) : (
          <span className="price-null">价格未公布</span>
        )}
        <a className="source" href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
          {event.sourceName}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M3 9L9 3M9 3H4.5M9 3v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </article>
  )
}
