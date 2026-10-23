import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { Admin } from "../models/index.js";
import { sendMail } from "../utils/mailer.js";
import { emailUpdatedEmail, passwordChangedEmail, resetPasswordEmail } from "../utils/emailTemplates.js";

const RESET_MINUTES = 30;
const MIN_PASSWORD = 8;

const makeToken = (admin) =>
  jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

// Admin panel address used in emails (first CLIENT_URL)
const adminUrl = (path = "") =>
  `${(process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "")}/admin${path}`;

const profile = (admin) => ({ id: admin.id, username: admin.username, email: admin.email || "" });

// POST /api/auth/login  { username, password }
export async function login(req, res) {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const admin = await Admin.findOne({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ message: "Invalid username or password." });
  }
  res.json({ token: makeToken(admin), admin: profile(admin) });
}

// GET /api/auth/me
export async function me(req, res) {
  const admin = await Admin.findByPk(req.admin.id);
  if (!admin) return res.status(401).json({ message: "Please log in." });
  res.json(profile(admin));
}

// PUT /api/auth/profile  { email }
export async function updateProfile(req, res) {
  const admin = await Admin.findByPk(req.admin.id);
  if (!admin) return res.status(401).json({ message: "Please log in." });

  const email = String(req.body?.email || "").trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  const changed = email !== (admin.email || "");
  admin.email = email || null;
  await admin.save();

  if (changed && email) {
    await sendMail({ to: email, ...emailUpdatedEmail({ username: admin.username, loginUrl: adminUrl() }) });
  }
  res.json(profile(admin));
}

// PUT /api/auth/password  { current_password, new_password }
export async function changePassword(req, res) {
  const { current_password: current = "", new_password: next = "" } = req.body || {};
  const admin = await Admin.findByPk(req.admin.id);
  if (!admin || !(await bcrypt.compare(String(current), admin.password))) {
    return res.status(400).json({ message: "Current password is wrong." });
  }
  if (String(next).length < MIN_PASSWORD) {
    return res.status(400).json({ message: `New password must be at least ${MIN_PASSWORD} characters.` });
  }
  admin.password = await bcrypt.hash(String(next), 10);
  await admin.save();

  await sendMail({ to: admin.email, ...passwordChangedEmail({ username: admin.username, how: "changed", loginUrl: adminUrl("/login") }) });
  res.json({ message: "Password changed." });
}

// POST /api/auth/forgot-password  { login }  (username or email)
export async function forgotPassword(req, res) {
  const value = String(req.body?.login || "").trim();
  // Same answer whether or not the account exists, so nobody can find usernames this way
  const answer = { message: "If that account has an email address, a reset link has been sent to it." };
  if (!value) return res.status(400).json({ message: "Enter your username or email." });

  const admin = await Admin.findOne({
    where: { [Op.or]: [{ username: value }, { email: value.toLowerCase() }] },
  });
  if (!admin || !admin.email) return res.json(answer);

  const token = crypto.randomBytes(32).toString("hex");
  admin.reset_token_hash = sha256(token);
  admin.reset_token_expires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
  await admin.save();

  const url = adminUrl(`/reset-password?token=${token}`);
  await sendMail({ to: admin.email, ...resetPasswordEmail({ username: admin.username, url, minutes: RESET_MINUTES }) });
  res.json(answer);
}

// POST /api/auth/reset-password  { token, password }
export async function resetPassword(req, res) {
  const token = String(req.body?.token || "");
  const password = String(req.body?.password || "");
  if (password.length < MIN_PASSWORD) {
    return res.status(400).json({ message: `New password must be at least ${MIN_PASSWORD} characters.` });
  }

  const admin = token && await Admin.findOne({
    where: { reset_token_hash: sha256(token), reset_token_expires: { [Op.gt]: new Date() } },
  });
  if (!admin) {
    return res.status(400).json({ message: "This reset link is invalid or has expired. Please ask for a new one." });
  }

  admin.password = await bcrypt.hash(password, 10);
  admin.reset_token_hash = null; // the link works only once
  admin.reset_token_expires = null;
  await admin.save();

  await sendMail({ to: admin.email, ...passwordChangedEmail({ username: admin.username, how: "reset", loginUrl: adminUrl("/login") }) });
  res.json({ message: "Your password has been reset. You can log in now." });
}
