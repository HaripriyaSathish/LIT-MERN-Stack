import { Fragment } from "react";
import Icon from "./Icon";
import { HighlightWords, Title, bg, newTab } from "./common";

function BookButton({ button, className }) {
  if (!button) return null;
  return (
    <a className={`btn btn--gold btn--book ${className}`} href={button.url} {...newTab(button.new_tab)}>
      <span>{button.text}</span><Icon name="arrow-right" />
    </a>
  );
}

function EventCard({ event }) {
  const label = event.background_image_alt_text ? { "aria-label": event.background_image_alt_text } : {};
  return (
    <article className="event-card" data-reveal="" style={bg("--event-bg", event.background_image)} {...label}>
      {event.background_image_alt_text && <span className="sr-only">{event.background_image_alt_text}</span>}
      <div className="event-card__main">
        {event.badge_text && <span className="event-card__badge">{event.badge_text}</span>}
        <h3 className="event-card__title">
          {event.title}
          {event.title_highlight && <> <span>{event.title_highlight}</span></>}
        </h3>
        {(event.banner_text || event.featured_photo) && (
          <div className="event-card__headline">
            {event.featured_photo && (
              <img className="event-card__artist" src={event.featured_photo} alt={event.featured_photo_alt_text || event.banner_text} loading="lazy" />
            )}
            {event.banner_text && (
              <p className="event-card__banner">
                {event.banner_icon && <Icon name={event.banner_icon} />}
                {" "}{event.banner_text}
              </p>
            )}
          </div>
        )}
        {event.features.length > 0 && (
          <p className="event-card__features">
            {event.features.map((feature, i) => (
              <Fragment key={feature.id}>
                <span>{feature.text}</span>
                {i < event.features.length - 1 && <span className="sep" aria-hidden="true">•</span>}
              </Fragment>
            ))}
          </p>
        )}
      </div>

      <div className="event-card__panel">
        <ul className="event-card__details">
          <li><Icon name="clock" /><span>{event.date_display}</span></li>
          {event.venue && (
            <li>
              <Icon name="map-pin" />
              {event.venue_map_link
                ? <a href={event.venue_map_link} target="_blank" rel="noopener">{event.venue}</a>
                : <span>{event.venue}</span>}
            </li>
          )}
          {(event.ticket_info || event.ticket_note) && (
            <li className="event-card__ticket">
              <Icon name="ticket" />
              <span>
                <strong>{event.ticket_info}</strong>
                {event.ticket_note && <> <small>{event.ticket_note}</small></>}
              </span>
            </li>
          )}
        </ul>
        <BookButton button={event.button} className="btn--block" />
      </div>
    </article>
  );
}

/** "Experience MJ Shriram" - Instagram Reel cards + booking strip under an event */
function EventReels({ event }) {
  const reels = event.featured_reels;
  if (!event.reels_heading || reels.length === 0) return null;
  const titleId = `event-reels-${event.id}`;

  return (
    <section className="event-reels" data-reveal="" aria-labelledby={titleId}>
      <div className="event-reels__head">
        <h3 className="event-reels__title" id={titleId}>{event.reels_heading}</h3>
        {event.reels_intro && <p className="event-reels__intro">{event.reels_intro}</p>}
      </div>

      <div className="event-reels__grid">
        {reels.map((reel) => (
          <a key={reel.id} className="reel-card" href={reel.link} target="_blank" rel="noopener"
             aria-label={`Watch ${reel.caption || event.reels_heading} on Instagram (opens in a new tab)`}>
            <span className="reel-card__media">
              {reel.cover && <img src={reel.cover} alt={reel.cover_alt_text} loading="lazy" width="360" height="640" />}
              <span className="reel-card__play" aria-hidden="true"><Icon name="play" /></span>
            </span>
            <span className="reel-card__foot">
              <Icon name="instagram" />
              <span>{reel.caption || "Watch on Instagram"}</span>
            </span>
          </a>
        ))}
      </div>

      {event.extra_reels.length > 0 && (
        <p className="event-reels__extra">
          {event.extra_reels.map((reel) => (
            <a key={reel.id} href={reel.link} target="_blank" rel="noopener">
              <Icon name="circle-play" />{reel.caption || "Watch another performance"}
            </a>
          ))}
        </p>
      )}

      <div className="event-cta">
        <div className="event-cta__text">
          {event.cta_heading && <p className="event-cta__title">{event.cta_heading}</p>}
          <ul className="event-cta__details">
            <li><Icon name="calendar" />{event.date_long}</li>
            {(event.cta_venue || event.venue) && <li><Icon name="map-pin" />{event.cta_venue || event.venue}</li>}
            {event.ticket_info && <li><Icon name="ticket" />{event.ticket_info}</li>}
          </ul>
        </div>
        <BookButton button={event.button} className="event-cta__btn" />
      </div>

      {event.reels_more_text && (
        <p className="event-reels__more">
          <Icon name="instagram" />{event.reels_more_text}
          {event.reels_more_handle && (
            <> <a href={event.reels_more_link || "#"} target="_blank" rel="noopener">{event.reels_more_handle}</a></>
          )}
        </p>
      )}
    </section>
  );
}

export default function Events({ section, events }) {
  if (!section.is_active) return null;

  return (
    <section className="events pattern-section" id="events" style={bg("--section-bg", section.background)}>
      <div className="container">
        <div className="section-head">
          {section.section_label && <p className="eyebrow" data-reveal="">{section.section_label}</p>}
          <h2 className="section-title" data-reveal="">
            <Title text={section.heading} highlight={section.heading_highlight} />
          </h2>
          {section.description && <p className="section-text" data-reveal="">{section.description}</p>}
          {section.highlights.length > 0 && <HighlightWords items={section.highlights} className="events__words" />}
        </div>

        <div className="events__list">
          {events.map((event) => (
            <div key={event.id} className="event-group">
              <EventCard event={event} />
              <EventReels event={event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
