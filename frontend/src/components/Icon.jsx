import {
  ArrowLeft, ArrowRight, BookOpen, Briefcase, Calendar, CalendarHeart, Camera, CirclePlay, Clock,
  Facebook, Globe, GraduationCap, Handshake, Heart, HeartHandshake, Home, Instagram, Link, Linkedin,
  Mail, MapPin, Menu, MessageCircle, Music, Music2, PartyPopper, Phone, Play, ShoppingBag, Sparkles,
  Star, Store, Ticket, Trophy, Twitter, Users, Utensils, X, Youtube,
} from "lucide-react";

// Lucide icon names saved in the database -> icon components
const ICONS = {
  "arrow-left": ArrowLeft, "arrow-right": ArrowRight, "book-open": BookOpen, briefcase: Briefcase,
  calendar: Calendar, "calendar-heart": CalendarHeart, camera: Camera, "circle-play": CirclePlay,
  clock: Clock, facebook: Facebook, globe: Globe, "graduation-cap": GraduationCap, handshake: Handshake,
  heart: Heart, "heart-handshake": HeartHandshake, home: Home, instagram: Instagram, link: Link,
  linkedin: Linkedin, mail: Mail, "map-pin": MapPin, menu: Menu, "message-circle": MessageCircle,
  music: Music, "music-2": Music2, "party-popper": PartyPopper, phone: Phone, play: Play,
  "shopping-bag": ShoppingBag, sparkles: Sparkles, star: Star, store: Store, ticket: Ticket,
  trophy: Trophy, twitter: Twitter, users: Users, utensils: Utensils, x: X, youtube: Youtube,
};

/** <Icon name="arrow-right" /> renders <svg class="lucide lucide-arrow-right"> like the original site */
export default function Icon({ name, className }) {
  const Component = ICONS[name] || ICONS.link;
  return <Component className={className} aria-hidden="true" />;
}

export const ICON_NAMES = Object.keys(ICONS);
