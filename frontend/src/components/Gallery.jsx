import Icon from "./Icon";
import { bg } from "./common";

export default function Gallery({ gallery }) {
  if (!gallery.is_active) return null;

  return (
    <section className="gallery pattern-section" id="gallery" style={bg("--section-bg", gallery.background)}>
      <div className="container container--wide">
        <div className="gallery__head">
          <div>
            {gallery.section_label && <p className="eyebrow eyebrow--line" data-reveal="">{gallery.section_label}</p>}
            <h2 className="section-title gallery__title" data-reveal="">
              {gallery.heading_highlight && <><span className="text-gold">{gallery.heading_highlight}</span> </>}
              {gallery.heading}
            </h2>
          </div>
          {gallery.instagram_handle && gallery.instagram_link && (
            <a className="btn btn--outline" href={gallery.instagram_link} target="_blank" rel="noopener" data-reveal="">
              <Icon name="instagram" /><span>{gallery.instagram_handle}</span>
            </a>
          )}
        </div>

        {gallery.photos.length > 0 && (
          <div className="gallery__row">
            {gallery.photos.map((photo) => (
              <a key={photo.id} className={`gallery__photo gallery__photo--${photo.size}`} href={photo.url} target="_blank" rel="noopener" data-reveal="">
                <img src={photo.image} alt={photo.alt_text || "LIT community moment"} loading="lazy" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
