/**
 * One generic controller for every section and list in config/schema.js
 * (the same idea as the Django admin).
 */
import { resources, ICONS } from "../config/schema.js";
import { models, loadSingleton, ORDER } from "../models/index.js";
import { saveImage } from "../config/cloudinary.js";

function getResource(req) {
  const resource = resources[req.params.resource];
  if (!resource) throw Object.assign(new Error("Unknown section."), { status: 404 });
  return { key: req.params.resource, resource, Model: models[req.params.resource] };
}

/** Keep only the fields of this resource and convert form values to column values. */
function clean(resource, body) {
  const data = {};
  for (const field of resource.fields) {
    if (!(field.name in body)) continue;
    let value = body[field.name];
    if (field.type === "bool") value = value === true || value === "true" || value === 1 || value === "1";
    else if (field.type === "int") value = Number.parseInt(value, 10) || 0;
    else if (field.type === "date" || field.type === "time") value = value || null;
    else value = value == null ? "" : String(value).trim();
    if (field.required && (value === "" || value === null)) {
      throw Object.assign(new Error(`${field.label} is required.`), { status: 400 });
    }
    data[field.name] = value;
  }
  if (!resource.singleton) {
    if ("sort_order" in body) data.sort_order = Number.parseInt(body.sort_order, 10) || 0;
    if ("is_active" in body) data.is_active = body.is_active === true || body.is_active === "true";
    if (resource.parentKey && body[resource.parentKey]) data[resource.parentKey] = Number(body[resource.parentKey]);
  }
  return data;
}

// GET /api/admin/schema
export function schema(req, res) {
  const list = Object.entries(resources).map(([key, r]) => ({
    key, label: r.label, group: r.group, singleton: Boolean(r.singleton),
    parent: r.parent || null, parentKey: r.parentKey || null, display: r.display || [], fields: r.fields,
  }));
  res.json({ resources: list, icons: ICONS });
}

// GET /api/admin/stats - counts for the dashboard
export async function stats(req, res) {
  const counts = {};
  for (const [key, r] of Object.entries(resources)) {
    if (!r.singleton) counts[key] = await models[key].count();
  }
  res.json(counts);
}

// GET /api/admin/:resource   (?event_id=1 for event features / videos)
export async function list(req, res) {
  const { key, resource, Model } = getResource(req);
  if (resource.singleton) return res.json(await loadSingleton(key));
  const where = {};
  if (resource.parentKey && req.query[resource.parentKey]) where[resource.parentKey] = Number(req.query[resource.parentKey]);
  res.json(await Model.findAll({ where, order: ORDER }));
}

// GET /api/admin/:resource/:id
export async function getOne(req, res) {
  const { Model } = getResource(req);
  const row = await Model.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Item not found." });
  res.json(row);
}

// PUT /api/admin/:resource  (sections)
export async function updateSingleton(req, res) {
  const { key, resource } = getResource(req);
  if (!resource.singleton) return res.status(400).json({ message: "Use /:id to update a list item." });
  const row = await loadSingleton(key);
  await row.update(clean(resource, req.body || {}));
  res.json(row);
}

// POST /api/admin/:resource  (list items)
export async function create(req, res) {
  const { resource, Model } = getResource(req);
  if (resource.singleton) return res.status(400).json({ message: "This section cannot have more rows." });
  const data = clean(resource, req.body || {});
  if (resource.parentKey && !data[resource.parentKey]) {
    return res.status(400).json({ message: "Choose the event first." });
  }
  for (const field of resource.fields) {
    if (field.required && !(field.name in data)) return res.status(400).json({ message: `${field.label} is required.` });
  }
  if (!("sort_order" in data)) data.sort_order = ((await Model.max("sort_order")) || 0) + 1;
  res.status(201).json(await Model.create(data));
}

// PUT /api/admin/:resource/:id
export async function update(req, res) {
  const { resource, Model } = getResource(req);
  const row = await Model.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Item not found." });
  await row.update(clean(resource, req.body || {}));
  res.json(row);
}

// DELETE /api/admin/:resource/:id
export async function remove(req, res) {
  const { resource, Model } = getResource(req);
  if (resource.singleton) return res.status(400).json({ message: "Sections cannot be deleted. Untick 'Show this section' instead." });
  const deleted = await Model.destroy({ where: { id: req.params.id } });
  if (!deleted) return res.status(404).json({ message: "Item not found." });
  res.json({ message: "Deleted." });
}

// POST /api/admin/upload  (multipart: image, folder)
export async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ message: "Choose an image to upload." });
  const folder = String(req.body.folder || "misc").replace(/[^a-z0-9_-]/gi, "") || "misc";
  res.status(201).json({ url: await saveImage(req.file, folder) });
}
