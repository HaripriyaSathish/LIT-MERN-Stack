import Icon from "./Icon";
import { Title, bg, newTab } from "./common";

export default function Social({ social }) {
  if (!social.is_active) return null;

  return (
    <section className="social pattern-section" id="social" style={bg("--section-bg", social.background)}>
      <div className="container social__grid">
        <div className="social__intro">
          {social.section_label && <p className="eyebrow" data-reveal="">{social.section_label}</p>}
          <h2 className="section-title social__title" data-reveal="">
            <Title text={social.heading} highlight={social.heading_highlight} />
          </h2>
          {social.description && <p className="section-text social__text" data-reveal="">{social.description}</p>}
        </div>

        <div className="social__cards">
          {social.links.map((account) => (
            <a key={account.id} className="social-card" href={account.url || "#"} {...newTab(Boolean(account.url))} data-reveal="">
              <span className="social-card__icon"><Icon name={account.icon} /></span>
              <span className="social-card__text">
                {account.label && <span className="social-card__label">{account.label}</span>}
                <span className="social-card__name">{account.account_name}</span>
              </span>
              <Icon name="arrow-right" className="social-card__arrow" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
