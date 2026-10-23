import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { resources } from "../config/schema.js";

// Schema field type -> MySQL column
function column(field) {
  const types = {
    text: DataTypes.STRING(255),
    textarea: DataTypes.TEXT,
    url: DataTypes.STRING(500),
    image: DataTypes.STRING(500),
    email: DataTypes.STRING(254),
    select: DataTypes.STRING(50),
    icon: DataTypes.STRING(50),
    bool: DataTypes.BOOLEAN,
    int: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    time: DataTypes.TIME,
  };
  const col = { type: types[field.type] };

  if (field.type === "bool") {
    col.allowNull = false;
    col.defaultValue = field.default ?? false;
  } else if (field.type === "int") {
    col.allowNull = false;
    col.defaultValue = field.default ?? 0;
  } else if (field.type === "date" || field.type === "time") {
    col.allowNull = !field.required;
  } else if (field.type !== "textarea") {
    // MySQL TEXT columns cannot have a default, so only short strings get one
    col.allowNull = false;
    col.defaultValue = field.default ?? "";
  }
  if (field.unique) col.unique = true;
  return col;
}

export const models = {};

for (const [key, resource] of Object.entries(resources)) {
  const attributes = {};
  for (const field of resource.fields) attributes[field.name] = column(field);

  if (!resource.singleton) {
    attributes.sort_order = { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 };
    attributes.is_active = { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true };
  }

  models[key] = sequelize.define(key, attributes, { tableName: resource.table });
}

// Child lists of an event (features, videos) are removed together with their event
for (const [key, resource] of Object.entries(resources)) {
  if (!resource.parent) continue;
  const fk = `${resource.parent.replace(/s$/, "")}_id`; // events -> event_id
  models[resource.parent].hasMany(models[key], { foreignKey: { name: fk, allowNull: false }, as: key, onDelete: "CASCADE" });
  models[key].belongsTo(models[resource.parent], { foreignKey: fk });
  resource.parentKey = fk;
}

export const Admin = sequelize.define(
  "admin",
  {
    username: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // bcrypt hash
    email: { type: DataTypes.STRING(254), allowNull: true }, // for "Forgot password" and notifications
    reset_token_hash: { type: DataTypes.STRING(64), allowNull: true }, // sha256 of the emailed token
    reset_token_expires: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "admins" }
);

/**
 * Adds columns that were introduced after a table was first created
 * (sequelize.sync() only creates missing tables, never missing columns).
 */
export async function upgradeTables() {
  const qi = sequelize.getQueryInterface();
  const table = await qi.describeTable("admins");
  for (const name of ["email", "reset_token_hash", "reset_token_expires"]) {
    if (!table[name]) await qi.addColumn("admins", name, Admin.getAttributes()[name]);
  }
}

/** Order used for every list: display order, then id (same as the Django site). */
export const ORDER = [["sort_order", "ASC"], ["id", "ASC"]];

/** The single row of a section table, created with its defaults the first time. */
export async function loadSingleton(key) {
  const [row] = await models[key].findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  return row;
}
