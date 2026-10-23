import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight, CalendarDays, CalendarPlus, Clock, ExternalLink, ImagePlus, Images, Link2, ListOrdered,
  MapPin, MessageSquareQuote, Settings, Users,
} from "lucide-react";
import api from "../../api/client";
import { useSchema } from "./AdminApp";
import { groupStyle } from "./adminIcons";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

const today = () =>
  new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default function Dashboard() {
  const { groups } = useSchema();
  const { site, user } = useOutletContext();
  const [counts, setCounts] = useState({});

  useEffect(() => { api.get("/admin/stats").then((res) => setCounts(res.data)); }, []);

  const stats = [
    { label: "Events", value: counts.events, icon: CalendarDays, color: "#dc2626", to: "/admin/section/events" },
    { label: "Gallery photos", value: counts.galleryPhotos, icon: Images, color: "#0891b2", to: "/admin/section/gallery" },
    { label: "Message cards", value: counts.supportMessages, icon: MessageSquareQuote, color: "#9333ea", to: "/admin/section/voices" },
    { label: "Community cards", value: counts.communityCards, icon: Users, color: "#059669", to: "/admin/section/community" },
  ];

  const actions = [
    { label: "Add an event", icon: CalendarPlus, to: "/admin/item/events/new" },
    { label: "Add a gallery photo", icon: ImagePlus, to: "/admin/item/galleryPhotos/new" },
    { label: "Edit menu links", icon: ListOrdered, to: "/admin/section/header" },
    { label: "Google Form & booking links", icon: Link2, to: "/admin/section/website" },
    { label: "Site settings", icon: Settings, to: "/admin/section/website" },
  ];

  const events = site?.events || [];

  return (
    <div className="dash">
      {/* Welcome banner */}
      <section className="dash-hero">
        <div className="dash-hero__text">
          <p className="dash-hero__date">{today()}</p>
          <h1>{greeting()}, {user?.username || "admin"} 👋</h1>
          <p>Manage every section of the London Indian Tamils website. Changes go live as soon as you save.</p>
          <div className="dash-hero__actions">
            <a className="dash-btn dash-btn--gold" href="/" target="_blank" rel="noopener">
              <ExternalLink /><span>View website</span>
            </a>
            <Link className="dash-btn dash-btn--glass" to="/admin/item/events/new">
              <CalendarPlus /><span>Add event</span>
            </Link>
          </div>
        </div>
        {site?.navbar.logo && <img className="dash-hero__logo" src={site.navbar.logo} alt="" />}
      </section>

      {/* Numbers */}
      <section className="dash-stats">
        {stats.map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} className="dash-stat" style={{ "--accent": color }}>
            <span className="dash-stat__icon"><Icon /></span>
            <span className="dash-stat__value">{value ?? "–"}</span>
            <span className="dash-stat__label">{label}</span>
          </Link>
        ))}
      </section>

      {/* Upcoming events + quick actions */}
      <section className="dash-two">
        <div className="dash-panel">
          <div className="dash-panel__head">
            <h2><CalendarDays /> Events on the website</h2>
            <Link to="/admin/section/events" className="dash-link">Manage <ArrowRight /></Link>
          </div>
          {events.length === 0 ? (
            <p className="admin-muted">No events are shown on the website yet.</p>
          ) : (
            <ul className="dash-events">
              {events.map((event) => (
                <li key={event.id}>
                  <Link to={`/admin/item/events/${event.id}`} className="dash-event">
                    <span className="dash-event__thumb" style={event.background_image ? { backgroundImage: `url('${event.background_image}')` } : undefined} />
                    <span className="dash-event__body">
                      <strong>{event.title} {event.title_highlight && <em>{event.title_highlight}</em>}</strong>
                      <span><Clock /> {event.date_display}</span>
                      {event.venue && <span><MapPin /> {event.venue}</span>}
                    </span>
                    <ArrowRight className="dash-event__arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dash-panel">
          <div className="dash-panel__head"><h2>Quick actions</h2></div>
          <ul className="dash-actions">
            {actions.map(({ label, icon: Icon, to }) => (
              <li key={label}>
                <Link to={to}><span className="dash-actions__icon"><Icon /></span><span>{label}</span><ArrowRight className="dash-actions__arrow" /></Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* All sections */}
      <div className="dash-section-head">
        <h2>Website sections</h2>
        <p className="admin-muted">In the same order as the website, from top to bottom.</p>
      </div>
      <section className="dash-cards">
        {groups.map((g) => {
          const { icon: Icon, color, text } = groupStyle(g.name);
          const lists = g.resources.filter((r) => !r.parent && !r.singleton);
          return (
            <Link key={g.slug} to={`/admin/section/${g.slug}`} className="dash-card" style={{ "--accent": color }}>
              <span className="dash-card__icon"><Icon /></span>
              <h3>{g.name}</h3>
              <p>{text}</p>
              {lists.length > 0 && (
                <span className="dash-card__chips">
                  {lists.map((r) => (
                    <span key={r.key} className="dash-chip">
                      {r.label.replace(/ \(.*\)$/, "")} <b>{counts[r.key] ?? "–"}</b>
                    </span>
                  ))}
                </span>
              )}
              <span className="dash-card__go">Manage <ArrowRight /></span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
