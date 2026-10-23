/**
 * npm run seed        -> creates the database + tables, the admin login and the website content
 *                        (content is only added to empty tables, so admin edits are kept)
 * npm run seed:reset  -> drops all tables and loads the original content again
 */
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { dialect, sequelize } from "./config/db.js";
import { resources } from "./config/schema.js";
import { models, Admin, upgradeTables } from "./models/index.js";
import content from "./data/content.js";

dotenv.config({ quiet: true });
const reset = process.argv.includes("--reset");
const PAGE_DATES = { "privacy-policy": "2026-10-12 12:00:00", "community-guidelines": "2026-10-07 12:00:00" };

async function createDatabase() {
  if (process.env.DATABASE_URL) return; // hosted databases are created in their dashboard
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.end();
}

async function seed() {
  await createDatabase();
  // force: drop + re-create. Plain sync only creates missing tables
  // (alter: true is avoided - it adds a duplicate unique index on every run in MySQL)
  await sequelize.sync(reset ? { force: true } : {});
  console.log(reset ? "Tables re-created" : "Tables ready");

  await upgradeTables();

  // ---- Admin login ----
  const username = process.env.ADMIN_USERNAME || "admin";
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase() || null;
  const existing = await Admin.findOne({ where: { username } });
  if (!existing) {
    await Admin.create({ username, email, password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10) });
    console.log(`Admin created: ${username}${email ? ` (${email})` : ""}`);
  } else {
    if (email && !existing.email) await existing.update({ email });
    console.log(`Admin already exists: ${username}`);
  }

  // ---- Website content (parents before children: events before event features) ----
  const keys = Object.keys(resources).sort((a, b) => Boolean(resources[a].parent) - Boolean(resources[b].parent));
  for (const key of keys) {
    if ((await models[key].count()) > 0) continue;
    await models[key].bulkCreate(content[key]);
    console.log(`  ${resources[key].label}: ${content[key].length}`);

    // Keep the "Last updated" dates of the live pages
    if (key === "infoPages") {
      for (const [slug, date] of Object.entries(PAGE_DATES)) {
        await sequelize.query("UPDATE info_pages SET updated_at = ? WHERE slug = ?", { replacements: [date, slug] });
      }
    }
  }

  // PostgreSQL (Neon): rows were inserted with fixed ids, so move each id counter
  // past the highest id - otherwise the first "+ Add" in the admin fails with "duplicate key".
  if (dialect === "postgres") {
    for (const key of keys) {
      const table = resources[key].table;
      await sequelize.query(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`
      );
    }
  }

  if (process.env.GOOGLE_ANALYTICS_ID) {
    await models.siteSettings.update({ google_analytics_id: process.env.GOOGLE_ANALYTICS_ID }, { where: { id: 1 } });
  }

  console.log("Done.");
  await sequelize.close();
}

seed().catch(async (err) => {
  console.error(err.message || err);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
