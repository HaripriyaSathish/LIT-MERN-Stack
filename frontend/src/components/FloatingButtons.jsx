import Icon from "./Icon";

/** Call / Email / Instagram (/ WhatsApp) buttons on the side of the page */
export default function FloatingButtons({ buttons }) {
  if (!buttons.length) return null;

  return (
    <div className="floating" id="floatingButtons" aria-label="Quick contact">
      {buttons.map((button, i) => (
        <a
          key={button.type}
          className={`floating__btn floating__btn--${button.type}`}
          href={button.url}
          {...(button.type === "instagram" || button.type === "whatsapp" ? { target: "_blank", rel: "noopener" } : {})}
          aria-label={button.label}
          style={{ "--i": i }}
        >
          <Icon name={button.icon} />
          <span className="floating__tip">{button.label}</span>
        </a>
      ))}
    </div>
  );
}
