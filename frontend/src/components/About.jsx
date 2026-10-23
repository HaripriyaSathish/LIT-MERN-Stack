import Icon from "./Icon";
import { Lines, Title, bg, newTab, num } from "./common";

export default function About({ about }) {
  if (!about.is_active) return null;

  return (
    <section className="about pattern-section" id="about" style={bg("--section-bg", about.background_image)}>
      <div className="container about__grid">
        <div className="about__media" data-reveal="">
          <div className="about__photo-wrap">
            {about.image ? (
              <img className="about__photo" src={about.image} alt={about.image_alt_text || "LIT community members in London"} loading="lazy" />
            ) : (
              <div className="about__photo about__photo--empty" aria-hidden="true"></div>
            )}
          </div>
          {(about.badge_title || about.badge_subtitle) && (
            <div className="about__badge">
              {about.badge_title && <span className="about__badge-title">{about.badge_title}</span>}
              {about.badge_subtitle && <span className="about__badge-sub">{about.badge_subtitle}</span>}
            </div>
          )}
        </div>

        <div className="about__content">
          {about.section_label && <p className="eyebrow eyebrow--line" data-reveal="">{about.section_label}</p>}
          <h2 className="section-title about__title" data-reveal="">
            <Title text={about.heading} highlight={about.heading_highlight} />
          </h2>
          {about.paragraph_1 && <p className="about__text" data-reveal=""><Lines text={about.paragraph_1} /></p>}
          {about.paragraph_2 && <p className="about__text" data-reveal=""><Lines text={about.paragraph_2} /></p>}

          {about.pillars.length > 0 && (
            <div className="pillars">
              {about.pillars.map((pillar, i) => (
                <article key={pillar.id} className={`pillar${pillar.is_highlighted ? " pillar--highlight" : ""}`} data-reveal="">
                  <span className="pillar__icon"><Icon name={pillar.icon} /></span>
                  <div>
                    <h3 className="pillar__title"><span className="pillar__num">{num(i)}</span>{pillar.title}</h3>
                    {pillar.description && <p className="pillar__text">{pillar.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {about.show_founder && about.founder_name && (
        <div className="container founder-anchor" id="founder">
          <article className={`founder${about.founder_photo ? " founder--with-photo" : ""}`} data-reveal="">
            {about.founder_photo && (
              <div className="founder__media">
                <img className="founder__photo" src={about.founder_photo} alt={about.founder_photo_alt_text || about.founder_name} loading="lazy" />
              </div>
            )}
            <div className="founder__content">
              <h3 className="founder__name">{about.founder_name}</h3>
              {about.founder_role && <p className="founder__role">{about.founder_role}</p>}

              {about.founder_paragraphs.map((paragraph, i) => (
                <p key={i} className="founder__text">{paragraph}</p>
              ))}

              {about.founder_quote && <blockquote className="founder__quote">“{about.founder_quote}”</blockquote>}

              {about.founder_button_text && (
                <a className="btn btn--gold founder__button" href={about.founder_button_link || "#founder"} {...newTab(Boolean(about.founder_button_link))}>
                  <span>{about.founder_button_text}</span><Icon name="arrow-right" />
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
