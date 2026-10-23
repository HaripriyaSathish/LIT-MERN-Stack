/** Branded emails (maroon & gold, like the website) for the admin panel. */

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function layout({ title, intro, button, after = [] }) {
  const buttonHtml = button
    ? `<p style="margin:28px 0;text-align:center">
         <a href="${esc(button.url)}" style="display:inline-block;background:#c9a24a;color:#3d0812;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px">${esc(button.text)}</a>
       </p>
       <p style="font-size:12px;color:#8a7d80;word-break:break-all">If the button does not work, copy this link into your browser:<br>${esc(button.url)}</p>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;background:#f6f2ec;font-family:Arial,Helvetica,sans-serif;color:#2a1a1d">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e4dad2">
        <tr><td style="background:#721022;padding:22px 28px">
          <div style="font-family:Georgia,serif;font-size:22px;color:#e7c46b;font-weight:bold">London Indian Tamils (LIT)</div>
          <div style="font-size:11px;letter-spacing:2px;color:#f3e7e9;margin-top:4px">WEBSITE ADMIN</div>
        </td></tr>
        <tr><td style="padding:28px">
          <h1 style="font-family:Georgia,serif;font-size:24px;color:#721022;margin:0 0 14px">${esc(title)}</h1>
          ${intro.map((p) => `<p style="font-size:15px;line-height:1.6;margin:0 0 12px">${p}</p>`).join("")}
          ${buttonHtml}
          ${after.map((p) => `<p style="font-size:13px;line-height:1.6;color:#6f6265;margin:0 0 10px">${p}</p>`).join("")}
        </td></tr>
        <tr><td style="background:#faf6f0;padding:16px 28px;font-size:12px;color:#8a7d80">
          This is an automatic security email from the LIT website admin panel.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const when = () => new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/London" }) + " (UK time)";

export function resetPasswordEmail({ username, url, minutes }) {
  return {
    subject: "Reset your LIT admin password",
    html: layout({
      title: "Reset your password",
      intro: [
        `Hello <strong>${esc(username)}</strong>,`,
        "We received a request to reset the password of your LIT website admin account. Click the button below to choose a new password.",
      ],
      button: { text: "Reset password", url },
      after: [
        `This link works once and expires in <strong>${minutes} minutes</strong>.`,
        "If you did not ask for this, you can ignore this email - your password will not change.",
      ],
    }),
    text: `Hello ${username},\n\nReset your LIT admin password with this link (valid for ${minutes} minutes, works once):\n${url}\n\nIf you did not ask for this, ignore this email.`,
  };
}

export function passwordChangedEmail({ username, how, loginUrl }) {
  const action = how === "reset" ? "reset using the Forgot password link" : "changed from the admin panel";
  return {
    subject: "Your LIT admin password was changed",
    html: layout({
      title: "Password changed",
      intro: [
        `Hello <strong>${esc(username)}</strong>,`,
        `The password of your LIT website admin account was ${action} on ${esc(when())}.`,
      ],
      button: { text: "Log in to the admin", url: loginUrl },
      after: ["If this was not you, use <strong>Forgot password</strong> on the login page straight away to set a new password."],
    }),
    text: `Hello ${username},\n\nThe password of your LIT admin account was ${action} on ${when()}.\nIf this was not you, use "Forgot password" on the login page: ${loginUrl}`,
  };
}

export function emailUpdatedEmail({ username, loginUrl }) {
  return {
    subject: "Your LIT admin email address is set",
    html: layout({
      title: "Notifications are on",
      intro: [
        `Hello <strong>${esc(username)}</strong>,`,
        "This email address will now receive password reset links and security notifications for the LIT website admin panel.",
      ],
      button: { text: "Open the admin", url: loginUrl },
    }),
    text: `Hello ${username},\n\nThis email address will now receive password reset links and security notifications for the LIT admin panel.\n${loginUrl}`,
  };
}
