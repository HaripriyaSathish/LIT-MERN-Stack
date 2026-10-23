# LIT – London Indian Tamils (React + Node.js + Express + MySQL)

The londonindiantamils.com website rebuilt on a new tech stack, with the **same content, images,
design and animations** as the live site, plus an admin panel where **every section is editable**.

| Part | Tech |
|---|---|
| Frontend | React 19 + Vite, React Router, lucide-react icons |
| Backend | Node.js + Express 5, JWT login |
| Database | MySQL (Sequelize ORM) |
| Images | Cloudinary (or `backend/uploads` when Cloudinary is not set) |

```
lit-project/
├── backend/
│   └── src/
│       ├── config/schema.js      every section + its fields (tables, API and admin forms come from here)
│       ├── models/index.js       MySQL tables built from schema.js
│       ├── services/content.js   builds the website data (link fallbacks, dates, phone links...)
│       ├── controllers/          site, auth (username login), admin (generic CRUD + image upload)
│       ├── routes/index.js       all API routes
│       ├── data/content.js       the live website content (used by the seed)
│       ├── seed.js               creates database, tables, admin user and content
│       └── server.js
└── frontend/
    └── src/
        ├── components/           one component per section (same HTML classes as the original)
        ├── hooks/usePageEffects.js  scroll animations (fade-up, header shadow, active menu, floating buttons)
        ├── lib/analytics.js      Google Analytics + cookie banner (only after "Accept")
        ├── pages/                Home, Privacy/Guidelines pages, admin panel
        └── styles/style.css      the original website stylesheet (unchanged)
```

---

## 1. Requirements
- Node.js 18+
- MySQL 8 (MySQL Workbench is fine)

## 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # then set DB_PASS, JWT_SECRET, ADMIN_PASSWORD
npm run seed             # creates the database "lit_website_db", tables, admin login and all content
npm run dev              # API on http://localhost:5000
```
Check: http://localhost:5000/api/site returns the website content as JSON.

`npm run seed` never overwrites content you edited in the admin.
`npm run seed:reset` drops all tables and loads the original content again (also re-creates the admin).

## 3. Frontend (second terminal)
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```
- Website: http://localhost:5173
- Footer pages: http://localhost:5173/privacy-policy/ and /community-guidelines/
- Admin: http://localhost:5173/admin – log in with **`ADMIN_USERNAME` / `ADMIN_PASSWORD`** from `backend/.env`
  (default `admin` / `Admin@123` – change it from *My account* in the admin).

---

## Forgot password & email notifications

1. Log in → **My account** → enter the admin's email address → *Save email*
   (or set `ADMIN_EMAIL` in `backend/.env` before `npm run seed`).
2. On the login page, **Forgot password?** emails a reset link (valid 30 minutes, works once).
3. The admin also gets an email when the password is changed or reset, and when the email address is set.

To really send emails, fill in `backend/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=londonindiantamils@gmail.com
SMTP_PASS=<Gmail App Password>     # Google Account → Security → 2-Step Verification → App passwords
```
Until then, each email (with the reset link) is printed in the backend terminal instead.
Login and reset requests are limited per IP (10 tries / 15 minutes).

## Admin panel

Every part of the page is dynamic and comes from MySQL:

| Menu | What you can edit |
|---|---|
| Website | Site title, SEO description, favicon, sharing image, **Join LIT Google Form link**, **ticket booking link**, Google Analytics ID |
| Header | Logo, name, tagline, menu links, JOIN button |
| Hero | Background photo, heading, text, buttons, badge words (LONDON • தமிழ் • INDIA • UK) |
| About & Founder | Text, photo, badge, the 3 cards, founder block |
| Community | Highlight words and the 8 cards (icon, title, text) |
| Events | Section text, highlight words, **events** (each with its features and Instagram videos) |
| Gallery | Instagram link, photos (small / medium / large) |
| Voices | Message cards (photo, name, role, video link) |
| Join | Banner photo, text, benefits, button |
| Social & Contact | Social accounts, contact details, contact buttons, floating buttons |
| Footer & Pages | Footer text, credit, Privacy Policy / Community Guidelines pages |

Lists have ↑ ↓ ordering, a *Show* tick box (hide without deleting), Edit and Delete.
Sections cannot be deleted – untick *Show this section* to hide one.
Images can be uploaded (Cloudinary when configured) or pasted as a URL.

**Adding a field or section** – add it to `backend/src/config/schema.js`, restart the backend
(new tables are created automatically; for a new column on an existing table add it in MySQL Workbench
or run `npm run seed:reset`), then show it in the section component in `frontend/src/components/`.
The admin form appears automatically.

---

## API

| Method | URL | Who |
|---|---|---|
| GET | `/api/site` | public – all home page content |
| GET | `/api/pages/:slug` | public – Privacy Policy, Community Guidelines |
| POST | `/api/auth/login` `{ username, password }` | public |
| POST | `/api/auth/forgot-password` `{ login }` · `/api/auth/reset-password` `{ token, password }` | public |
| GET | `/api/auth/me` · PUT `/api/auth/profile` `{ email }` · PUT `/api/auth/password` | admin |
| GET | `/api/admin/schema`, `/api/admin/stats` | admin |
| GET / PUT | `/api/admin/<section>` (e.g. `hero`, `about`, `footer`) | admin |
| GET / POST | `/api/admin/<list>` (e.g. `navLinks`, `events`, `galleryPhotos`) | admin |
| GET / PUT / DELETE | `/api/admin/<list>/:id` | admin |
| POST | `/api/admin/upload` (multipart `image`, `folder`) | admin |

Admin requests need `Authorization: Bearer <token>` (the token from login).

---

## Deploy (e.g. Render)

**Database** – a hosted MySQL (Aiven, TiDB Cloud, Railway...). Set `DATABASE_URL=mysql://user:pass@host:port/db`
(and `DB_SSL=true` if the provider requires SSL).

**Backend → Web Service** – root `backend`, build `npm install`, start `npm start`.
Env: everything from `.env` + `DATABASE_URL`, `CLIENT_URL=https://<frontend-domain>`,
Cloudinary keys (server disks are wiped on redeploy), `GOOGLE_ANALYTICS_ID=G-CJ4EXSJEQD`.
Run `npm run seed` once from the service shell.

**Frontend → Static Site** – root `frontend`, build `npm install && npm run build`, publish `dist`.
Env: `VITE_API_URL=https://<backend-domain>/api`.
`public/_redirects` makes `/admin` and `/privacy-policy/` work on refresh.
