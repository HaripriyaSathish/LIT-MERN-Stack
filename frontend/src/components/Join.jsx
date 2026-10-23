import Icon from "./Icon";
import { Title, bg, newTab } from "./common";

export default function Join({ join }) {
  if (!join.is_active) return null;
  const imageLabel = join.banner_image_alt_text ? { role: "img", "aria-label": join.banner_image_alt_text } : {};

  return (
    <section className="join pattern-section" id="join" style={bg("--section-bg", join.background)}>
      <div className="container container--xwide">
        <div className="join__banner" data-reveal="" style={bg("--join-bg", join.banner_image)} {...imageLabel}>
          <h2 className="join__title">
            <Title text={join.heading} highlight={join.heading_highlight} />
          </h2>
          {join.subheading && <p className="join__subheading">{join.subheading}</p>}
          {join.description && <p className="join__text">{join.description}</p>}

          {join.benefits.length > 0 && (
            <ul className="join__pills">
              {join.benefits.map((benefit) => <li key={benefit.id}>{benefit.text}</li>)}
            </ul>
          )}

          {join.button && (
            <a className="btn btn--gold btn--hero join__button" href={join.button.url} {...newTab(join.button.new_tab)}>
              <span>{join.button.text}</span><Icon name="arrow-right" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
