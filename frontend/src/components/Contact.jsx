import Icon from "./Icon";
import { bg, newTab } from "./common";

export default function Contact({ contact }) {
  if (!contact.is_active) return null;

  return (
    <section className="contact pattern-section" id="contact" style={bg("--section-bg", contact.background)}>
      <div className="container">
        <div className="contact__card" data-reveal="">
          {contact.section_label && <p className="eyebrow">{contact.section_label}</p>}
          <h2 className="contact__title">{contact.heading}</h2>

          <div className="contact__details">
            {contact.location && (
              <p className="contact__item">
                <Icon name="map-pin" />
                <a href={contact.location_url} target="_blank" rel="noopener">{contact.location}</a>
              </p>
            )}
            <div className="contact__group">
              {contact.email && <p className="contact__item"><Icon name="mail" /><a href={contact.email_url}>{contact.email}</a></p>}
              {contact.phone && <p className="contact__item"><Icon name="phone" /><a href={contact.phone_url}>{contact.phone}</a></p>}
            </div>
          </div>

          {contact.person_name && (
            <>
              <hr className="contact__divider" />
              <p className="contact__person">
                {contact.person_name}
                {contact.person_role && <> <span>— {contact.person_role}</span></>}
              </p>
            </>
          )}

          {contact.buttons.length > 0 && (
            <div className="contact__buttons">
              {contact.buttons.map((button) => (
                <a key={button.id} className="btn btn--maroon" href={button.url || "#"} {...newTab(button.new_tab)}>
                  <Icon name={button.icon} /><span>{button.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
