import Icon from "./Icon";
import { HighlightWords, Title, bg, num } from "./common";

export default function Community({ community }) {
  if (!community.is_active) return null;

  return (
    <section className="community pattern-section" id="community" style={bg("--section-bg", community.background)}>
      <div className="container">
        {community.highlights.length > 0 && (
          <div className="community__strip" data-reveal="">
            <span className="community__line" aria-hidden="true"></span>
            <HighlightWords items={community.highlights} className="highlight-words--spaced" reveal={false} />
          </div>
        )}

        <div className="section-head">
          {community.section_label && <p className="eyebrow" data-reveal="">{community.section_label}</p>}
          <h2 className="section-title" data-reveal="">
            <Title text={community.heading} highlight={community.heading_highlight} />
          </h2>
        </div>

        <div className="community__grid">
          {community.cards.map((card, i) => (
            <article key={card.id} className="community-card" data-reveal="">
              <div className="community-card__top">
                <span className="community-card__icon"><Icon name={card.icon} /></span>
                <span className="community-card__num" aria-hidden="true">{num(i)}</span>
              </div>
              <h3 className="community-card__title">{card.title}</h3>
              {card.description && <p className="community-card__text">{card.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
