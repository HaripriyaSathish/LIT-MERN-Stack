import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { newTab } from "./common";

function Brand({ navbar, href = "#home", showSub = true }) {
  const content = (
    <>
      {navbar.logo && (
        <img className="brand__logo" src={navbar.logo} alt={navbar.logo_alt_text} width="72" height="72" />
      )}
      <span className="brand__text">
        <span className="brand__name">
          {navbar.brand_name}
          {navbar.brand_highlight && <> <span>{navbar.brand_highlight}</span></>}
        </span>
        {navbar.tagline && <span className="brand__tagline">{navbar.tagline}</span>}
        {showSub && navbar.sub_tagline && <span className="brand__sub">{navbar.sub_tagline}</span>}
      </span>
    </>
  );
  return href.startsWith("#")
    ? <a href={href} className="brand">{content}</a>
    : <Link to={href} className="brand">{content}</Link>;
}

/** Header of the home page with the section menu */
export default function Navbar({ navbar }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const button = navbar.button;

  // Close the mobile menu with Escape or a click outside the navbar
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => !navRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <header className="site-header" id="siteHeader">
      <nav className="navbar" aria-label="Main navigation" ref={navRef}>
        <Brand navbar={navbar} />

        <div className="navbar__mobile">
          {button && (
            <a className="btn btn--gold btn--nav-mobile" href={button.url} {...newTab(button.new_tab)}>{button.text}</a>
          )}
          <button
            className="nav-toggle" type="button" aria-controls="siteNav"
            aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen(!open)}
          >
            <Icon name="menu" className="nav-toggle__open" />
            <Icon name="x" className="nav-toggle__close" />
          </button>
        </div>

        <div className={`nav${open ? " is-open" : ""}`} id="siteNav" onClick={(e) => e.target.closest("a") && setOpen(false)}>
          <ul className="nav__links">
            {navbar.links.map((link) => (
              <li key={link.id}>
                <a href={link.link} {...newTab(link.open_in_new_tab)}>{link.label}</a>
              </li>
            ))}
          </ul>
          {button && (
            <a className="btn btn--gold btn--nav" href={button.url} {...newTab(button.new_tab)}>
              <span className="btn__label">{button.text}</span>
              <Icon name="arrow-right" />
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}

/** Header of the footer pages (Privacy Policy...) */
export function PageHeader({ navbar }) {
  return (
    <header className="site-header site-header--page">
      <nav className="navbar" aria-label="Main navigation">
        <Brand navbar={navbar} href="/" showSub={false} />
        <Link className="btn btn--gold btn--nav" to="/">
          <Icon name="arrow-left" /><span>Back to home</span>
        </Link>
      </nav>
    </header>
  );
}
