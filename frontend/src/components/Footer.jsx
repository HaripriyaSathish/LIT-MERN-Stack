import { Link } from "react-router-dom";
import Icon from "./Icon";
import { openCookieSettings } from "../lib/analytics";

export default function Footer({ footer, site }) {
  const showCookieLink = Boolean(site.google_analytics_id);

  return (
    <footer className="site-footer" id="siteFooter">
      <div className="container container--wide">
        <div className="footer__card">
          <p className="footer__brand">{footer.brand_name}</p>
          {footer.tagline && <p className="footer__tagline">{footer.tagline}</p>}
          {footer.quote && <p className="footer__quote">{footer.quote}</p>}

          {footer.social_links.length > 0 && (
            <ul className="footer__social">
              {footer.social_links.map((link) => (
                <li key={link.id}>
                  <a href={link.url || "#"} {...(link.url ? { target: "_blank", rel: "noopener" } : {})} aria-label={link.platform_name}>
                    <Icon name={link.icon} />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {(footer.page_links.length > 0 || showCookieLink) && (
            <ul className="footer__links">
              {footer.page_links.map((page) => (
                <li key={page.slug}><Link to={`/${page.slug}/`}>{page.title}</Link></li>
              ))}
              {showCookieLink && (
                <li>
                  <a href="#" data-cookie-settings="" onClick={(e) => { e.preventDefault(); openCookieSettings(); }}>
                    Cookie settings
                  </a>
                </li>
              )}
            </ul>
          )}

          <p className="footer__copy">{footer.copyright}</p>
          {footer.show_credit && footer.credit_text && (
            <p className="footer__credit">
              {footer.credit_link
                ? <a href={footer.credit_link} target="_blank" rel="noopener">{footer.credit_text}</a>
                : footer.credit_text}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
