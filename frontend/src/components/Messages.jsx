import Icon from "./Icon";
import { Title, bg } from "./common";

export default function Messages({ section }) {
  if (!section.is_active) return null;
  const hasFollowLine = section.follow_text_before || section.follow_handle || section.follow_text_after;

  return (
    <section className="messages pattern-section" id="messages" style={bg("--section-bg", section.background)}>
      <div className="container">
        <div className="section-head">
          {section.section_label && <p className="eyebrow" data-reveal="">{section.section_label}</p>}
          <h2 className="section-title" data-reveal="">
            <Title text={section.heading} highlight={section.heading_highlight} />
          </h2>
          {section.description && <p className="section-text messages__text" data-reveal="">{section.description}</p>}
        </div>

        <div className="messages__grid">
          {section.messages.map((message) => (
            <article key={message.id} className="message-card" data-reveal="">
              <div className="message-card__media">
                <a className="message-card__thumb" href={message.button_url} target="_blank" rel="noopener"
                   aria-label={`Watch the message from ${message.name}`}>
                  {message.photo ? (
                    <img src={message.photo} alt={`${message.name}${message.role ? `, ${message.role}` : ""}`} loading="lazy" />
                  ) : (
                    <span className="message-card__placeholder" aria-hidden="true">{message.name.slice(0, 1)}</span>
                  )}
                </a>
                {message.button_text && (
                  <a className="btn btn--gold btn--watch" href={message.button_url} target="_blank" rel="noopener">
                    <Icon name="play" /><span>{message.button_text}</span>
                  </a>
                )}
              </div>
              <div className="message-card__body">
                <h3 className="message-card__name">{message.name}</h3>
                {message.role && <p className="message-card__role">{message.role}</p>}
                {message.status_text && <p className="message-card__status">{message.status_text}</p>}
              </div>
            </article>
          ))}
        </div>

        {hasFollowLine && (
          <p className="follow-line" data-reveal="">
            <Icon name="instagram" />{section.follow_text_before}
            {section.follow_handle && (
              <> <a href={section.follow_link || "#"} target="_blank" rel="noopener">{section.follow_handle}</a></>
            )}
            {" "}{section.follow_text_after}
          </p>
        )}
      </div>
    </section>
  );
}
