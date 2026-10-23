/**
 * Every editable part of the website, in one place.
 *
 * Each resource becomes:
 *   - a MySQL table (models/index.js)
 *   - admin API routes  /api/admin/<key>      (routes/index.js)
 *   - an admin form in the React admin panel  (sent by /api/admin/schema)
 *
 * singleton: true  -> the table has exactly one row (a page section, e.g. Hero)
 * singleton: false -> a list of items with "Display order" and "Show on website"
 * parent           -> list items that belong to one row of another resource (event_id)
 *
 * Field types: text, textarea, url, email, image, bool, int, date, time, select, icon
 */

export const ICONS = [
  "users", "heart-handshake", "sparkles", "handshake", "heart", "star", "calendar",
  "briefcase", "store", "shopping-bag", "party-popper", "calendar-heart", "graduation-cap",
  "trophy", "music", "utensils", "globe", "map-pin", "home", "book-open", "camera",
  "message-circle", "phone", "mail",
];

const SHARED_BG = "Leave empty to use the same background as the About section.";
const JOIN_FORM = "Leave empty to open the Join LIT Google Form (set in Site Settings).";

const f = (name, type, label, extra = {}) => ({ name, type, label, ...extra });
const isActive = f("is_active", "bool", "Show this section", { default: true });
const label = (value) => f("section_label", "text", "Small label above heading", { default: value });
const heading = (value) => f("heading", "text", "Heading", { default: value, required: true });
const highlight = (value) => f("heading_highlight", "text", "Highlighted heading", { default: value });
const sectionBg = (help = SHARED_BG) => f("background_image", "image", "Section background image", { help });

export const resources = {
  siteSettings: {
    label: "Site Settings", group: "Website", singleton: true, table: "site_settings",
    fields: [
      f("site_title", "text", "Website title", { default: "London Indian Tamils (LIT) | Indian Tamil Community in the UK" }),
      f("meta_description", "textarea", "Search engine description"),
      f("favicon", "image", "Browser tab icon (favicon)", { help: "Square image, e.g. 64x64 PNG. Empty = logo." }),
      f("join_form_url", "url", "Join LIT Google Form link", { help: "Used by every JOIN button that has no link of its own." }),
      f("booking_url", "url", "Event booking link (Ticket Tailor)", { default: "https://buytickets.at/LIT" }),
      f("og_image", "image", "Sharing image (WhatsApp / Facebook preview)", { help: "1200x630 px. Empty = logo." }),
      f("google_analytics_id", "text", "Google Analytics ID", { help: "e.g. G-XXXXXXXXXX. Empty = no analytics and no cookie banner." }),
    ],
  },

  navbar: {
    label: "Navbar", group: "Header", singleton: true, table: "navbar",
    fields: [
      f("logo", "image", "Logo", { help: "Round logo shown at the top left." }),
      f("logo_alt_text", "text", "Logo description", { default: "London Indian Tamils (LIT) logo" }),
      f("brand_name", "text", "Organisation name", { default: "London Indian Tamils", required: true }),
      f("brand_highlight", "text", "Highlighted name", { default: "(LIT)" }),
      f("tagline", "text", "Tagline", { default: "CONNECT • SUPPORT • CELEBRATE" }),
      f("sub_tagline", "text", "Small text under tagline", { default: "India in our heart. London in our home. Tamil in our identity." }),
      f("show_button", "bool", "Show button", { default: true }),
      f("button_text", "text", "Button text", { default: "JOIN LIT" }),
      f("button_link", "url", "Button link", { help: JOIN_FORM }),
    ],
  },
  navLinks: {
    label: "Menu links", group: "Header", table: "nav_links", display: ["label", "link"],
    fields: [
      f("label", "text", "Menu text", { required: true }),
      f("link", "text", "Link", { required: true, help: "Section links start with #, e.g. #about" }),
      f("open_in_new_tab", "bool", "Open in new tab", { default: false }),
    ],
  },

  hero: {
    label: "Hero Section", group: "Hero", singleton: true, table: "hero_section",
    fields: [
      isActive,
      f("background_image", "image", "Background image", { help: "Large landscape photo, at least 1920x1080 px." }),
      f("background_image_alt_text", "text", "Background image description"),
      heading("Connecting Indian Tamils Across"),
      highlight("London & the UK"),
      f("description", "textarea", "Main description"),
      f("sub_description", "textarea", "Smaller description"),
      f("primary_button_text", "text", "Main button text", { default: "JOIN LIT" }),
      f("primary_button_link", "url", "Main button link", { help: JOIN_FORM }),
      f("secondary_button_text", "text", "Second button text", { default: "VIEW EVENTS" }),
      f("secondary_button_link", "text", "Second button link", { default: "#events" }),
    ],
  },
  heroTags: {
    label: "Hero badge words", group: "Hero", table: "hero_tags", display: ["text"],
    fields: [f("text", "text", "Text", { required: true })],
  },

  about: {
    label: "About Section", group: "About & Founder", singleton: true, table: "about_section",
    fields: [
      isActive,
      label("ABOUT LIT"),
      heading("More Than a WhatsApp Group."),
      highlight("A Community."),
      f("paragraph_1", "textarea", "First paragraph"),
      f("paragraph_2", "textarea", "Second paragraph"),
      f("background_image", "image", "Section background image", { help: "The patterned background, also used by the other sections." }),
      f("image", "image", "Photo", { help: "Portrait photo shown on the left, about 800x1000 px." }),
      f("image_alt_text", "text", "Photo description"),
      f("badge_title", "text", "Photo badge - big text", { default: "தமிழ்" }),
      f("badge_subtitle", "text", "Photo badge - small text", { default: "ONE COMMUNITY" }),
      f("show_founder", "bool", "Show founder block", { default: true }),
      f("founder_name", "text", "Founder name", { default: "Sathish Duraisamy" }),
      f("founder_photo", "image", "Founder photo"),
      f("founder_photo_alt_text", "text", "Founder photo description"),
      f("founder_role", "text", "Founder title"),
      f("founder_bio", "textarea", "Founder introduction", { help: "Leave an empty line between paragraphs.", rows: 10 }),
      f("founder_quote", "text", "Founder quote"),
      f("founder_button_text", "text", "Button text", { default: "ABOUT SATHISH" }),
      f("founder_button_link", "url", "Button link", { help: "While empty, the button scrolls to the Founder section." }),
    ],
  },
  aboutPillars: {
    label: "About cards", group: "About & Founder", table: "about_pillars", display: ["title"],
    fields: [
      f("icon", "icon", "Icon", { default: "users" }),
      f("title", "text", "Title", { required: true }),
      f("description", "textarea", "Description"),
      f("is_highlighted", "bool", "Highlight", { default: false }),
    ],
  },

  community: {
    label: "Community Section", group: "Community", singleton: true, table: "community_section",
    fields: [isActive, sectionBg(), label("OUR COMMUNITY"), heading("There's Something"), highlight("for Everyone")],
  },
  communityHighlights: {
    label: "Community highlight words", group: "Community", table: "community_highlights", display: ["text"],
    fields: [f("text", "text", "Text", { required: true })],
  },
  communityCards: {
    label: "Community cards", group: "Community", table: "community_cards", display: ["title"],
    fields: [
      f("icon", "icon", "Icon", { default: "users" }),
      f("title", "text", "Title", { required: true }),
      f("description", "textarea", "Description"),
    ],
  },

  eventsSection: {
    label: "Events Section", group: "Events", singleton: true, table: "events_section",
    fields: [
      isActive, sectionBg(), label("EVENTS"), heading("Meet. Celebrate."), highlight("Connect."),
      f("description", "textarea", "Description"),
    ],
  },
  eventsHighlights: {
    label: "Events highlight words", group: "Events", table: "events_highlights", display: ["text"],
    fields: [f("text", "text", "Text", { required: true })],
  },
  events: {
    label: "Events", group: "Events", table: "events", display: ["title", "title_highlight", "date"],
    fields: [
      f("badge_text", "text", "Badge", { default: "FEATURED EVENT" }),
      f("title", "text", "Event name", { required: true }),
      f("title_highlight", "text", "Highlighted part of name", { help: "e.g. 2026" }),
      f("background_image", "image", "Event background image", { help: "Landscape photo, at least 1600x800 px." }),
      f("background_image_alt_text", "text", "Image description"),
      f("featured_photo", "image", "Artist / featured photo (optional)"),
      f("featured_photo_alt_text", "text", "Featured photo description"),
      f("banner_icon", "icon", "Banner icon", { default: "music", allowEmpty: true }),
      f("banner_text", "text", "Banner text", { help: "e.g. LIVE WITH MJ SHRIRAM" }),
      f("date", "date", "Date", { required: true }),
      f("start_time", "time", "Start time"),
      f("end_time", "time", "End time"),
      f("venue", "text", "Venue / pick-up"),
      f("venue_map_link", "url", "Venue map link"),
      f("ticket_info", "text", "Ticket information"),
      f("ticket_note", "text", "Ticket note (small text)"),
      f("button_text", "text", "Button text", { default: "BOOK NOW" }),
      f("button_link", "url", "Booking link", { help: "Leave empty to use the event booking link in Site Settings." }),
      f("reels_heading", "text", "Video section heading", { help: "e.g. Experience MJ Shriram. Shown when the event has videos." }),
      f("reels_intro", "textarea", "Video section intro"),
      f("cta_heading", "text", "Booking strip heading"),
      f("cta_venue", "text", "Booking strip venue (short)", { help: "Leave empty to use the venue." }),
      f("reels_more_text", "text", "Watch more line - text"),
      f("reels_more_handle", "text", "Watch more line - Instagram name"),
      f("reels_more_link", "url", "Watch more line - link"),
    ],
  },
  eventFeatures: {
    label: "Event features", group: "Events", table: "event_features", parent: "events", display: ["text"],
    fields: [f("text", "text", "Text", { required: true })],
  },
  eventReels: {
    label: "Event videos (first 3 = cards)", group: "Events", table: "event_reels", parent: "events",
    display: ["link"],
    fields: [
      f("link", "url", "Instagram Reel link", { required: true }),
      f("cover", "image", "Cover image", { help: "Portrait (9:16), about 360x640 px." }),
      f("cover_alt_text", "text", "Cover description"),
      f("caption", "text", "Caption", { help: "Optional. Videos 4 onwards use it as the link text." }),
    ],
  },

  gallery: {
    label: "Gallery Section", group: "Gallery", singleton: true, table: "gallery_section",
    fields: [
      isActive, sectionBg(), label("FOLLOW US"),
      f("heading_highlight", "text", "Highlighted heading", { default: "LIT" }),
      heading("Community Moments"),
      f("instagram_handle", "text", "Instagram name", { default: "@LondonIndianTamils" }),
      f("instagram_link", "url", "Instagram link", { default: "https://www.instagram.com/londonindiantamils/" }),
    ],
  },
  galleryPhotos: {
    label: "Gallery photos", group: "Gallery", table: "gallery_photos", display: ["image", "size"],
    fields: [
      f("image", "image", "Photo", { required: true }),
      f("alt_text", "text", "Photo description"),
      f("size", "select", "Size", {
        default: "medium",
        options: [["small", "Small (square)"], ["medium", "Medium (square)"], ["large", "Large (tall, centre photo)"]],
      }),
      f("link", "url", "Link (optional)", { help: "Empty = the Instagram link of the Gallery section." }),
    ],
  },

  messagesSection: {
    label: "Messages Section", group: "Voices", singleton: true, table: "messages_section",
    fields: [
      isActive, sectionBg(), label("VOICES OF SUPPORT"), heading("Messages to the"), highlight("LIT Community"),
      f("description", "textarea", "Description"),
      f("follow_text_before", "text", "Follow line - text before", { default: "Follow" }),
      f("follow_handle", "text", "Follow line - Instagram name", { default: "@londonindiantamils" }),
      f("follow_text_after", "text", "Follow line - text after", { default: "for more community stories, messages and updates." }),
      f("follow_link", "url", "Instagram link", { default: "https://www.instagram.com/londonindiantamils/" }),
    ],
  },
  supportMessages: {
    label: "Message cards", group: "Voices", table: "support_messages", display: ["name", "role"],
    fields: [
      f("photo", "image", "Photo", { help: "Portrait photo, about 600x800 px." }),
      f("name", "text", "Name", { required: true }),
      f("role", "text", "Role / title"),
      f("status_text", "text", "Status text", { help: "Optional small gold text under the role." }),
      f("button_text", "text", "Button text", { default: "Watch Message" }),
      f("video_link", "url", "Video link", { help: "Empty = opens the Instagram page." }),
    ],
  },

  join: {
    label: "Join Section", group: "Join", singleton: true, table: "join_section",
    fields: [
      isActive, sectionBg(),
      f("banner_image", "image", "Banner photo", { help: "Wide photo inside the rounded banner, at least 1800x700 px." }),
      f("banner_image_alt_text", "text", "Banner photo description"),
      heading("Join"), highlight("London Indian Tamils"),
      f("subheading", "text", "Question line", { default: "Tamil-speaking Indian living in the UK?" }),
      f("description", "text", "Line under the question", { default: "Become part of our growing community." }),
      f("button_text", "text", "Button text", { default: "JOIN NOW" }),
      f("button_link", "url", "Button link", { help: JOIN_FORM }),
    ],
  },
  joinBenefits: {
    label: "Join benefits", group: "Join", table: "join_benefits", display: ["text"],
    fields: [f("text", "text", "Text", { required: true })],
  },

  social: {
    label: "Social Media Section", group: "Social & Contact", singleton: true, table: "social_section",
    fields: [
      isActive, sectionBg(), label("SOCIAL MEDIA"), heading("Stay Connected"), highlight("With LIT"),
      f("description", "textarea", "Description"),
    ],
  },
  socialLinks: {
    label: "Social accounts", group: "Social & Contact", table: "social_links", display: ["platform", "account_name"],
    fields: [
      f("platform", "select", "Platform", {
        default: "instagram",
        options: [
          ["instagram", "Instagram"], ["facebook", "Facebook"], ["youtube", "YouTube"], ["whatsapp", "WhatsApp"],
          ["x", "X (Twitter)"], ["linkedin", "LinkedIn"], ["tiktok", "TikTok"],
        ],
      }),
      f("label", "text", "Small label", { help: "e.g. INSTAGRAM" }),
      f("account_name", "text", "Account name", { required: true }),
      f("url", "url", "Link"),
      f("show_in_footer", "bool", "Show in footer", { default: true }),
      f("footer_order", "int", "Footer order", { default: 0 }),
    ],
  },
  contact: {
    label: "Contact Section", group: "Social & Contact", singleton: true, table: "contact_section",
    fields: [
      isActive, sectionBg(), label("CONTACT"), heading("London Indian Tamils"),
      f("location", "text", "Location", { default: "London, United Kingdom" }),
      f("location_link", "url", "Location map link", { help: "Empty = Google Maps search for the location." }),
      f("email", "email", "Email"),
      f("phone", "text", "Phone", { help: "UK format is fine, e.g. 07940 173183." }),
      f("person_name", "text", "Contact person"),
      f("person_role", "text", "Contact person role"),
    ],
  },
  contactButtons: {
    label: "Contact buttons", group: "Social & Contact", table: "contact_buttons", display: ["label", "kind"],
    fields: [
      f("kind", "select", "Type", {
        default: "call",
        options: [
          ["call", "Call"], ["email", "Email"], ["instagram", "Instagram"], ["facebook", "Facebook"],
          ["whatsapp", "WhatsApp"], ["youtube", "YouTube"], ["link", "Other link"],
        ],
      }),
      f("label", "text", "Button text", { required: true }),
      f("link", "text", "Link", { help: "Empty = Call/Email use the contact details, social buttons use the Social accounts." }),
    ],
  },
  floatingButtons: {
    label: "Floating Contact Buttons", group: "Social & Contact", singleton: true, table: "floating_buttons",
    fields: [
      f("is_active", "bool", "Show floating buttons", { default: true }),
      f("show_call", "bool", "Show call button", { default: true }),
      f("phone_number", "text", "Phone number", { help: "Empty = the Contact section phone." }),
      f("show_email", "bool", "Show email button", { default: true }),
      f("email", "email", "Email", { help: "Empty = the Contact section email." }),
      f("email_subject", "text", "Email subject", { default: "Enquiry from LIT website" }),
      f("show_instagram", "bool", "Show Instagram button", { default: true }),
      f("instagram_link", "url", "Instagram link", { help: "Empty = the Instagram account in Social accounts." }),
      f("show_whatsapp", "bool", "Show WhatsApp button", { default: false }),
      f("whatsapp_number", "text", "WhatsApp number", { help: "Empty = the Contact section phone." }),
      f("whatsapp_message", "text", "WhatsApp starting message", { default: "Hi LIT, I would like to know more about London Indian Tamils." }),
    ],
  },

  footer: {
    label: "Footer", group: "Footer & Pages", singleton: true, table: "footer",
    fields: [
      f("brand_name", "text", "Organisation name", { default: "LONDON INDIAN TAMILS" }),
      f("tagline", "text", "Tagline", { default: "CONNECT • SUPPORT • CELEBRATE" }),
      f("quote", "text", "Quote", { default: "India in our heart. London in our home. Tamil in our identity." }),
      f("show_social_icons", "bool", "Show social media icons", { default: true }),
      f("copyright_text", "text", "Copyright text", { default: "London Indian Tamils. All Rights Reserved." }),
      f("show_credit", "bool", "Show designer credit", { default: true }),
      f("credit_text", "text", "Credit text", { default: "Designed & Developed by Vetri IT Systems" }),
      f("credit_link", "url", "Credit link", { default: "https://vetriitsystems.com/" }),
    ],
  },
  infoPages: {
    label: "Pages (Privacy, Guidelines)", group: "Footer & Pages", table: "info_pages", display: ["title", "slug"],
    fields: [
      f("title", "text", "Title", { required: true }),
      f("slug", "text", "Web address", { required: true, unique: true, help: "e.g. privacy-policy -> /privacy-policy" }),
      f("content", "textarea", "Content", { rows: 18, help: "Empty line between paragraphs. Start a line with ## for a heading." }),
      f("show_in_footer", "bool", "Link in footer", { default: true }),
    ],
  },
};
