/**
 * Builds the data the public website shows, with the same rules as the original
 * Django site (join-form fallback, phone links, event date text, shared backgrounds...).
 * The React frontend only renders what it gets from here.
 */
import { models, loadSingleton, ORDER } from "../models/index.js";

const isExternal = (url) => /^https?:\/\//i.test(url || "");

/**
 * Cloudinary images are served with automatic format/quality (WebP/AVIF, smaller files),
 * like the original site: .../image/upload/v123/x.jpg -> .../image/upload/f_auto,q_auto/v123/x.jpg
 */
function optimiseImages(value) {
  if (typeof value === "string") {
    return value.replace(/(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/)/g, "$1f_auto,q_auto/$2");
  }
  if (Array.isArray(value)) return value.map(optimiseImages);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, optimiseImages(v)]));
  }
  return value;
}

/** Empty link = the Join LIT Google Form from Site Settings. */
function resolveLink(link, site) {
  const url = link || site.join_form_url || "#";
  return { url, new_tab: isExternal(url) };
}

/** '07940 173183' -> '+447940173183' */
export function phoneLink(number, countryCode = "44") {
  const value = (number || "").trim();
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (value.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+${countryCode}${digits.slice(1)}`;
  return `+${digits}`;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];

/** '2026-10-31' -> 'Saturday 31 October 2026' */
function longDate(value) {
  if (!value) return "";
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return `${DAYS[date.getUTCDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
}

/** '18:30:00' -> '6:30 PM' */
function shortTime(value) {
  if (!value) return "";
  const [h, min] = String(value).split(":").map(Number);
  return `${h % 12 || 12}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** 'Saturday 31 October 2026 | 6:30 PM – 11:00 PM' */
function eventDateDisplay(event) {
  let text = longDate(event.date);
  if (event.start_time) {
    text += ` | ${shortTime(event.start_time)}`;
    if (event.end_time) text += ` – ${shortTime(event.end_time)}`;
  }
  return text;
}

const plain = (row) => (row ? row.get({ plain: true }) : null);
const activeList = async (key, where = {}) =>
  (await models[key].findAll({ where: { is_active: true, ...where }, order: ORDER })).map(plain);

const paragraphs = (text) =>
  (text || "").replace(/\r\n/g, "\n").split("\n\n").map((p) => p.trim()).filter(Boolean);

const SOCIAL_ICONS = {
  instagram: "instagram", facebook: "facebook", youtube: "youtube",
  whatsapp: "message-circle", x: "twitter", linkedin: "linkedin", tiktok: "music-2",
};
const SOCIAL_NAMES = {
  instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", whatsapp: "WhatsApp",
  x: "X (Twitter)", linkedin: "LinkedIn", tiktok: "TikTok",
};
const CONTACT_ICONS = {
  call: "phone", email: "mail", instagram: "instagram", facebook: "facebook",
  whatsapp: "message-circle", youtube: "youtube", link: "link",
};

/** Parts every page needs: settings, navbar and footer. */
export async function getCommon() {
  const site = plain(await loadSingleton("siteSettings"));
  const navbar = plain(await loadSingleton("navbar"));
  const footer = plain(await loadSingleton("footer"));

  navbar.links = await activeList("navLinks");
  navbar.button = navbar.show_button && navbar.button_text
    ? { text: navbar.button_text, ...resolveLink(navbar.button_link, site) }
    : null;

  const socialAccounts = (await activeList("socialLinks")).map((s) => ({
    ...s, icon: SOCIAL_ICONS[s.platform] || "link", platform_name: SOCIAL_NAMES[s.platform] || s.platform,
  }));
  footer.social_links = footer.show_social_icons
    ? socialAccounts.filter((s) => s.show_in_footer).sort((a, b) => a.footer_order - b.footer_order || a.id - b.id)
    : [];
  footer.page_links = (await activeList("infoPages", { show_in_footer: true })).map(({ title, slug }) => ({ title, slug }));
  footer.copyright = `© ${new Date().getFullYear()} ${footer.copyright_text}`;

  return {
    site: {
      site_title: site.site_title,
      meta_description: site.meta_description,
      favicon: site.favicon || navbar.logo,
      og_image: site.og_image || navbar.logo,
      join_form_url: site.join_form_url,
      booking_url: site.booking_url,
      google_analytics_id: site.google_analytics_id,
    },
    navbar,
    footer,
    _site: site,
    _socialAccounts: socialAccounts,
  };
}

/** Everything on the home page. */
export async function getHomePage() {
  const common = await getCommon();
  const site = common._site;
  const socialAccounts = common._socialAccounts;
  const socialUrl = (platform) => socialAccounts.find((s) => s.platform === platform && s.url)?.url || "";

  // ---- About (its background is shared by the sections that have none) ----
  const about = plain(await loadSingleton("about"));
  about.pillars = await activeList("aboutPillars");
  about.founder_paragraphs = paragraphs(about.founder_bio);
  const background = (section) => section.background_image || about.background_image || "";

  // ---- Hero ----
  const hero = plain(await loadSingleton("hero"));
  hero.tags = await activeList("heroTags");
  hero.buttons = [];
  if (hero.primary_button_text) {
    hero.buttons.push({ text: hero.primary_button_text, style: "primary", ...resolveLink(hero.primary_button_link, site) });
  }
  if (hero.secondary_button_text) {
    const url = hero.secondary_button_link || "#";
    hero.buttons.push({ text: hero.secondary_button_text, style: "secondary", url, new_tab: url.startsWith("http") });
  }

  // ---- Community ----
  const community = plain(await loadSingleton("community"));
  community.background = background(community);
  community.highlights = await activeList("communityHighlights");
  community.cards = await activeList("communityCards");

  // ---- Events ----
  const eventsSection = plain(await loadSingleton("eventsSection"));
  eventsSection.background = background(eventsSection);
  eventsSection.highlights = await activeList("eventsHighlights");
  const events = await activeList("events");
  for (const event of events) {
    event.date_display = eventDateDisplay(event);
    event.date_long = longDate(event.date);
    const url = event.button_link || site.booking_url || "#";
    event.button = event.button_text ? { text: event.button_text, url, new_tab: isExternal(url) } : null;
    event.features = await activeList("eventFeatures", { event_id: event.id });
    const reels = await activeList("eventReels", { event_id: event.id });
    event.featured_reels = reels.slice(0, 3);
    event.extra_reels = reels.slice(3);
  }

  // ---- Gallery ----
  const gallery = plain(await loadSingleton("gallery"));
  gallery.background = background(gallery);
  gallery.photos = (await activeList("galleryPhotos"))
    .filter((p) => p.image)
    .map((p) => ({ ...p, url: p.link || gallery.instagram_link }));

  // ---- Messages ----
  const messagesSection = plain(await loadSingleton("messagesSection"));
  messagesSection.background = background(messagesSection);
  messagesSection.messages = (await activeList("supportMessages")).map((m) => ({
    ...m, button_url: m.video_link || messagesSection.follow_link,
  }));

  // ---- Join ----
  const join = plain(await loadSingleton("join"));
  join.background = background(join);
  join.benefits = await activeList("joinBenefits");
  join.button = join.button_text ? { text: join.button_text, ...resolveLink(join.button_link, site) } : null;

  // ---- Social ----
  const social = plain(await loadSingleton("social"));
  social.background = background(social);
  social.links = socialAccounts;

  // ---- Contact ----
  const contact = plain(await loadSingleton("contact"));
  contact.background = background(contact);
  contact.location_url = contact.location_link
    || (contact.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location).replace(/%20/g, "+")}` : "");
  contact.phone_url = contact.phone ? `tel:${phoneLink(contact.phone)}` : "";
  contact.email_url = contact.email ? `mailto:${contact.email}` : "";
  contact.buttons = (await activeList("contactButtons")).map((b) => {
    let url = b.link;
    if (!url) url = b.kind === "call" ? contact.phone_url : b.kind === "email" ? contact.email_url : socialUrl(b.kind);
    return { ...b, url, icon: CONTACT_ICONS[b.kind] || "link", new_tab: Boolean(url) && b.kind !== "call" && b.kind !== "email" };
  });

  // ---- Floating buttons ----
  const fb = plain(await loadSingleton("floatingButtons"));
  const floating = [];
  if (fb.is_active) {
    const phone = fb.phone_number || contact.phone;
    const email = fb.email || contact.email;
    const whatsapp = fb.whatsapp_number || contact.phone;
    const items = [
      ["call", "Call us", "phone", fb.show_call && phone ? `tel:${phoneLink(phone)}` : ""],
      ["email", "Email us", "mail", fb.show_email && email
        ? `mailto:${email}${fb.email_subject ? `?subject=${encodeURIComponent(fb.email_subject)}` : ""}` : ""],
      ["instagram", "Instagram", "instagram", fb.show_instagram ? fb.instagram_link || socialUrl("instagram") : ""],
      ["whatsapp", "WhatsApp us", "message-circle", fb.show_whatsapp && whatsapp
        ? `https://wa.me/${phoneLink(whatsapp).replace("+", "")}${fb.whatsapp_message ? `?text=${encodeURIComponent(fb.whatsapp_message)}` : ""}` : ""],
    ];
    for (const [type, label, icon, url] of items) if (url) floating.push({ type, label, icon, url });
  }

  const { _site, _socialAccounts, ...rest } = common;
  return optimiseImages({
    ...rest,
    hero, about, community,
    events_section: eventsSection, events,
    gallery, messages_section: messagesSection,
    join, social, contact, floating,
  });
}

/** A footer page (Privacy Policy, Community Guidelines) split into headings and paragraphs. */
export async function getInfoPage(slug) {
  const page = await models.infoPages.findOne({ where: { slug, is_active: true } });
  if (!page) return null;
  const data = plain(page);
  data.blocks = paragraphs(data.content).map((chunk) =>
    chunk.startsWith("## ") ? { type: "heading", text: chunk.slice(3).trim() } : { type: "paragraph", text: chunk }
  );
  const updated = new Date(data.updatedAt);
  data.updated_display = `${updated.getDate()} ${MONTHS[updated.getMonth()]} ${updated.getFullYear()}`;

  const { _site, _socialAccounts, ...common } = await getCommon();
  return optimiseImages({ ...common, page: data });
}
