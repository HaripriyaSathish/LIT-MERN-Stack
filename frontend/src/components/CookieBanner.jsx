import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { OPEN_COOKIE_SETTINGS, choose, setupAnalytics } from "../lib/analytics";

/** Shown until the visitor chooses. Google Analytics only loads after "Accept". */
export default function CookieBanner({ site }) {
  const [visible, setVisible] = useState(false);
  const firstButton = useRef(null);
  const enabled = /^G-[A-Z0-9]+$/i.test(site?.google_analytics_id || "");

  useEffect(() => {
    if (!enabled) return undefined;
    setVisible(setupAnalytics(site));
    const open = () => {
      setVisible(true);
      setTimeout(() => firstButton.current?.focus(), 0);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, open);
  }, [enabled, site]);

  if (!enabled) return null;

  const pick = (value) => {
    choose(value);
    setVisible(false);
  };

  return (
    <div className="cookie-banner" id="cookieBanner" role="region" aria-label="Cookie consent" hidden={!visible}>
      <div className="cookie-banner__text">
        <p className="cookie-banner__title">Cookies on this website</p>
        <p>
          We would like to use Google Analytics cookies to see how visitors use this website, so we can improve it.
          They are only set if you accept.{" "}
          <Link to="/privacy-policy/">Privacy Policy</Link>
        </p>
      </div>
      <div className="cookie-banner__actions">
        <button ref={firstButton} className="btn cookie-banner__btn cookie-banner__btn--reject" type="button" onClick={() => pick("denied")}>Reject</button>
        <button className="btn cookie-banner__btn cookie-banner__btn--accept" type="button" onClick={() => pick("granted")}>Accept</button>
      </div>
    </div>
  );
}
