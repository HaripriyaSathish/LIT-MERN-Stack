import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

/**
 * Sends emails with the SMTP account from .env (e.g. Gmail + App Password).
 * When SMTP is not set up, the email is printed in the backend terminal instead,
 * so "Forgot password" can still be tested locally.
 */
export const mailEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = mailEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const from = () => {
  const address = process.env.MAIL_FROM || process.env.SMTP_USER;
  return `"${process.env.MAIL_FROM_NAME || "London Indian Tamils (LIT)"}" <${address}>`;
};

export async function sendMail({ to, subject, html, text }) {
  if (!to) return false;
  if (!mailEnabled) {
    console.log(`\n----- EMAIL (SMTP not set up, not sent) -----\nTo: ${to}\nSubject: ${subject}\n\n${text}\n---------------------------------------------\n`);
    return false;
  }
  try {
    await transporter.sendMail({ from: from(), to, subject, html, text });
    return true;
  } catch (err) {
    // A failed email must never break the admin action itself
    console.error("Email could not be sent:", err.message);
    return false;
  }
}
