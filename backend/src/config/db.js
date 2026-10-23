import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

/**
 * Database connection.
 *  - Local:      MySQL (MySQL Workbench) with DB_HOST / DB_USER / DB_PASS / DB_NAME
 *  - Production: DATABASE_URL, e.g. Neon PostgreSQL
 *                postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?sslmode=require
 * The database type is taken from the start of DATABASE_URL (postgres:// or mysql://).
 */
const url = process.env.DATABASE_URL || "";
export const dialect = /^postgres(ql)?:\/\//i.test(url) ? "postgres" : "mysql";

// Neon (and most hosted databases) need SSL
const useSsl = dialect === "postgres" ? process.env.DB_SSL !== "false" : process.env.DB_SSL === "true";

const options = {
  dialect,
  logging: false,
  define: { underscored: true },
  dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  pool: { max: 5, idle: 10000 },
};

export const sequelize = url
  ? new Sequelize(url, options)
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      ...options,
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
    });
