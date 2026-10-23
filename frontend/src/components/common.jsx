/** Small pieces shared by several sections. */
import { Fragment } from "react";

/** "Heading <em>Highlight</em>" */
export function Title({ text, highlight }) {
  return (
    <>
      {text}
      {highlight && <> <em>{highlight}</em></>}
    </>
  );
}

/** Words separated by gold dots: Social • Careers • Business */
export function HighlightWords({ items, className = "", reveal = true }) {
  return (
    <p className={`highlight-words ${className}`.trim()} {...(reveal ? { "data-reveal": "" } : {})}>
      {items.map((item, i) => (
        <Fragment key={item.id}>
          <span>{item.text}</span>
          {i < items.length - 1 && <span className="sep" aria-hidden="true">•</span>}
        </Fragment>
      ))}
    </p>
  );
}

/** Text with line breaks kept (Django's linebreaksbr) */
export function Lines({ text }) {
  const lines = String(text || "").split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

/** target/rel for links that open in a new tab */
export const newTab = (yes) => (yes ? { target: "_blank", rel: "noopener" } : {});

/** CSS background variable, e.g. bg("--section-bg", url) */
export const bg = (name, url) => (url ? { [name]: `url('${url}')` } : undefined);

/** "01", "02"... */
export const num = (i) => String(i + 1).padStart(2, "0");
