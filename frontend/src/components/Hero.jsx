import { Fragment } from "react";
import Icon from "./Icon";
import { Title, bg, newTab } from "./common";

export default function Hero({ hero }) {
  if (!hero.is_active) return null;
  const imageLabel = hero.background_image_alt_text
    ? { role: "img", "aria-label": hero.background_image_alt_text }
    : {};

  return (
    <section className="hero" id="home" style={bg("--hero-bg", hero.background_image)} {...imageLabel}>
      <div className="hero__inner">
        {hero.tags.length > 0 && (
          <div className="hero__badge" data-reveal="">
            {hero.tags.map((tag, i) => (
              <Fragment key={tag.id}>
                <span>{tag.text}</span>
                {i < hero.tags.length - 1 && <span className="dot" aria-hidden="true"></span>}
              </Fragment>
            ))}
          </div>
        )}

        <h1 className="hero__title" data-reveal="">
          <Title text={hero.heading} highlight={hero.heading_highlight} />
        </h1>

        {hero.description && <p className="hero__text" data-reveal="">{hero.description}</p>}
        {hero.sub_description && <p className="hero__subtext" data-reveal="">{hero.sub_description}</p>}

        {hero.buttons.length > 0 && (
          <div className="hero__actions" data-reveal="">
            {hero.buttons.map((button) =>
              button.style === "primary" ? (
                <a key="primary" className="btn btn--gold btn--hero" href={button.url} {...newTab(button.new_tab)}>
                  <span className="btn__label">{button.text}</span>
                  <Icon name="arrow-right" />
                </a>
              ) : (
                <a key="secondary" className="btn btn--glass" href={button.url} {...newTab(button.new_tab)}>
                  <Icon name="ticket" />
                  <span>{button.text}</span>
                </a>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
