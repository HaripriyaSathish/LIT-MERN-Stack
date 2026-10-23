import {
  CalendarDays, FileText, Globe, Image, Images, LayoutDashboard, MessageSquareQuote, PanelTop,
  Share2, UserPlus, UserRound, Users,
} from "lucide-react";

/** Icon and accent colour for each admin menu entry (group name from schema.js) */
export const GROUP_STYLE = {
  Website: { icon: Globe, color: "#2563eb", text: "Title, Google Form & booking links" },
  Header: { icon: PanelTop, color: "#7c3aed", text: "Logo, tagline & menu" },
  Hero: { icon: Image, color: "#db2777", text: "Top banner, heading & buttons" },
  "About & Founder": { icon: UserRound, color: "#b45309", text: "About text, cards & founder" },
  Community: { icon: Users, color: "#059669", text: "Highlight words & 8 cards" },
  Events: { icon: CalendarDays, color: "#dc2626", text: "Events, features & videos" },
  Gallery: { icon: Images, color: "#0891b2", text: "Instagram photos" },
  Voices: { icon: MessageSquareQuote, color: "#9333ea", text: "Messages of support" },
  Join: { icon: UserPlus, color: "#ca8a04", text: "Join banner & benefits" },
  "Social & Contact": { icon: Share2, color: "#0d9488", text: "Social, contact & floating buttons" },
  "Footer & Pages": { icon: FileText, color: "#475569", text: "Footer, Privacy & Guidelines" },
};

export const DashboardIcon = LayoutDashboard;

export const groupStyle = (name) => GROUP_STYLE[name] || { icon: FileText, color: "#721022", text: "" };
