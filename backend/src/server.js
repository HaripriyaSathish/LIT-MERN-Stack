import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/db.js";
import { upgradeTables } from "./models/index.js";
import { mailEnabled } from "./utils/mailer.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config({ quiet: true });

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in backend/.env");
  process.exit(1);
}

const app = express();
const allowed = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((s) => s.trim());

app.set("trust proxy", 1); // real visitor IP behind Render / Nginx (used by the rate limit)
app.use(cors({ origin: allowed }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", routes);

// ---------- React website (single Render Web Service) ----------
// After "npm run build" in frontend/, Express also serves the website and admin panel.
// In local development (no build) this is skipped and Vite serves the frontend on :5173.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist");
if (fs.existsSync(path.join(dist, "index.html"))) {
  // Built files have a hash in their name, so they can be cached for a long time
  app.use("/assets", express.static(path.join(dist, "assets"), { immutable: true, maxAge: "1y" }));
  app.use(express.static(dist, { index: false }));
  // Every other page (/, /admin, /privacy-policy/ ...) is handled by React Router
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.set("Cache-Control", "no-cache");
    res.sendFile(path.join(dist, "index.html"));
  });
  console.log("Serving the website from frontend/dist");
}

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

try {
  await sequelize.authenticate();
  await sequelize.sync(); // creates missing tables (run "npm run seed" once for the content)
  await upgradeTables(); // adds newer columns to existing tables
  app.listen(PORT, () => {
    console.log(`LIT API running on http://localhost:${PORT}`);
    if (!mailEnabled) console.log("Emails: SMTP not set up - emails are printed here instead of sent.");
  });
} catch (err) {
  console.error("Could not connect to the database:", err.message);
  process.exit(1);
}
