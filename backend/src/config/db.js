import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const options = {
  dialect: "mysql",
  logging: false,
  define: { underscored: true },
  dialectOptions: process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {},
};

export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, options)
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      ...options,
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
    });
