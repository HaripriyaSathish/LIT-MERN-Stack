import { getHomePage, getInfoPage } from "../services/content.js";

// GET /api/site - all content of the home page
export async function home(req, res) {
  res.json(await getHomePage());
}

// GET /api/pages/:slug - Privacy Policy, Community Guidelines...
export async function page(req, res) {
  const data = await getInfoPage(req.params.slug);
  if (!data) return res.status(404).json({ message: "Page not found." });
  res.json(data);
}
