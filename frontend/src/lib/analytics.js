/**
 * Google Analytics 4 with cookie consent (UK PECR / UK GDPR) - same behaviour as the
 * original site's analytics.js. Nothing is loaded from Google and no analytics cookie
 * is set until the visitor clicks "Accept".
 */

const STORAGE_KEY = "lit_cookie_consent";
const OPEN_EVENT = "lit:cookie-settings";

let GA_ID = "";
let bookingUrl = "";
let joinUrl = "";
let consent = null; // 'granted' | 'denied' | null (not chosen yet)
let gaLoaded = false;
let started = false;

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); } // eslint-disable-line prefer-rest-params

// Remembering the choice is strictly necessary, so it does not itself need consent
export function readChoice() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(value) {
  try { window.localStorage.setItem(STORAGE_KEY, value); } catch { /* private mode */ }
}

function loadAnalytics() {
  window[`ga-disable-${GA_ID}`] = false;
  if (gaLoaded) {
    gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
  gaLoaded = true;
  // Analytics only - advertising signals stay off
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("js", new Date());
  gtag("config", GA_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

function removeAnalyticsCookies() {
  const names = document.cookie.split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.indexOf("_ga_") === 0);
  if (!names.length) return;

  // Google sets these on the top domain, so clear every level: www.example.com, example.com
  const parts = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`; domain=.${parts.slice(i).join(".")}`);
  names.forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    });
  });
}

function stopAnalytics() {
  window[`ga-disable-${GA_ID}`] = true;
  if (gaLoaded) gtag("consent", "update", { analytics_storage: "denied" });
  removeAnalyticsCookies();
}

/** Visitor clicked Accept ('granted') or Reject ('denied') */
export function choose(value) {
  consent = value;
  saveChoice(value);
  if (value === "granted") loadAnalytics(); else stopAnalytics();
}

/** "Cookie settings" link in the footer re-opens the banner */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
export const OPEN_COOKIE_SETTINGS = OPEN_EVENT;

// ---------- Click tracking ----------

const sameUrl = (a, b) => !!a && !!b && a.replace(/\/+$/, "") === b.replace(/\/+$/, "");
const hostIs = (host, domains) => domains.some((d) => host === d || host.slice(-d.length - 1) === `.${d}`);

// Which tracked action a link is, or null
function classify(link) {
  const raw = link.getAttribute("href") || "";
  const href = raw.toLowerCase();
  if (href.indexOf("tel:") === 0) return { name: "contact_click", method: "phone" };
  if (href.indexOf("mailto:") === 0) return { name: "contact_click", method: "email" };
  if (href === "#contact") return { name: "contact_click", method: "menu_link" };

  const host = (link.hostname || "").toLowerCase();
  if (hostIs(host, ["wa.me", "whatsapp.com"])) return { name: "whatsapp_click" };
  if (hostIs(host, ["instagram.com"])) return { name: "instagram_click" };
  if (hostIs(host, ["facebook.com", "fb.com", "fb.me"])) return { name: "facebook_click" };
  if (sameUrl(raw, joinUrl) || hostIs(host, ["forms.gle"]) ||
      (host === "docs.google.com" && link.pathname.indexOf("/forms") === 0)) {
    return { name: "join_lit_click" };
  }
  if (sameUrl(raw, bookingUrl) || link.classList.contains("btn--book") ||
      hostIs(host, ["buytickets.at", "tickettailor.com"])) {
    return { name: "buy_tickets_click" };
  }
  return null;
}

// Where on the page the link sits: header, floating_buttons, footer or the section id (hero is "home")
function locationOf(link) {
  if (link.closest(".site-header")) return "header";
  if (link.closest(".floating")) return "floating_buttons";
  if (link.closest(".site-footer")) return "footer";
  const section = link.closest("section[id]");
  return section ? section.id : "page";
}

function trackClick(event) {
  if (consent !== "granted") return;
  const link = event.target.closest("a[href]");
  if (!link) return;
  const action = classify(link);
  if (!action) return;

  const params = {
    link_location: locationOf(link),
    link_text: (link.getAttribute("aria-label") || link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100),
  };
  if (action.method) params.contact_method = action.method;
  else params.link_url = link.origin + link.pathname; // address only - no query string
  gtag("event", action.name, params);
}

/**
 * Start once per visit. Returns true when the cookie banner should be shown
 * (a valid GA ID is set and the visitor has not chosen yet).
 */
export function setupAnalytics(site) {
  const id = site?.google_analytics_id || "";
  if (!/^G-[A-Z0-9]+$/i.test(id)) return false;
  if (!started) {
    started = true;
    GA_ID = id;
    bookingUrl = site.booking_url || "";
    joinUrl = site.join_form_url || "";
    consent = readChoice();
    if (consent === "granted") loadAnalytics();
    document.addEventListener("click", trackClick);
  }
  return consent === null;
}
