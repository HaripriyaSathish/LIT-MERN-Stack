import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, KeyRound, LogOut, Menu, X } from "lucide-react";
import api, { TOKEN_KEY } from "../../api/client";
import { useSchema } from "./AdminApp";
import { DashboardIcon, groupStyle } from "./adminIcons";

export default function AdminLayout({ user }) {
  const { groups } = useSchema();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [site, setSite] = useState(null);

  // Website data (logo, events) for the sidebar and dashboard
  useEffect(() => {
    api.get("/site").then((res) => setSite(res.data)).catch(() => {});
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/admin/login", { replace: true });
  };

  const current = groups.find((g) => location.pathname.startsWith(`/admin/section/${g.slug}`));
  const pageTitle = location.pathname === "/admin" ? "Dashboard"
    : location.pathname.startsWith("/admin/password") ? "My account"
    : current?.name || "Edit";
  const name = user?.username || "admin";

  return (
    <div className="admin admin-shell">
      {menuOpen && <div className="admin-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`admin-sidebar${menuOpen ? " is-open" : ""}`} onClick={(e) => e.target.closest("a") && setMenuOpen(false)}>
        <Link to="/admin" className="admin-brand">
          {site?.navbar.logo
            ? <img src={site.navbar.logo} alt="" className="admin-brand__logo" />
            : <span className="admin-brand__logo admin-brand__logo--text">LIT</span>}
          <span>
            <span className="admin-brand__name">LIT Admin</span>
            <span className="admin-brand__sub">London Indian Tamils</span>
          </span>
        </Link>

        <nav className="admin-nav">
          <p className="admin-nav__label">Overview</p>
          <NavLink end to="/admin"><DashboardIcon className="admin-nav__icon" /><span>Dashboard</span></NavLink>

          <p className="admin-nav__label">Website sections</p>
          {groups.map((g) => {
            const { icon: Icon, color } = groupStyle(g.name);
            return (
              <NavLink key={g.slug} to={`/admin/section/${g.slug}`} style={{ "--accent": color }}>
                <Icon className="admin-nav__icon" /><span>{g.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar__foot">
          <a href="/" target="_blank" rel="noopener"><ExternalLink className="admin-nav__icon" /><span>View website</span></a>
          <NavLink to="/admin/password"><KeyRound className="admin-nav__icon" /><span>My account</span></NavLink>
          <div className="admin-user">
            <span className="admin-user__avatar">{name.slice(0, 1).toUpperCase()}</span>
            <span className="admin-user__text">
              <strong>{name}</strong>
              <small>Administrator</small>
            </span>
            <button type="button" className="admin-user__logout" onClick={logout} aria-label="Log out" title="Log out">
              <LogOut />
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
          <div className="admin-topbar__crumb">
            <span>LIT Admin</span>
            <span className="admin-topbar__sep">/</span>
            <strong>{pageTitle}</strong>
          </div>
          <a className="admin-btn admin-topbar__view" href="/" target="_blank" rel="noopener">
            <ExternalLink /><span>View website</span>
          </a>
        </header>
        <main className="admin-content">
          <Outlet context={{ site, user }} />
        </main>
      </div>
    </div>
  );
}
