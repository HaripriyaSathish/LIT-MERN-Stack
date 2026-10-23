import { useEffect, useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import api, { errorMessage } from "../../api/client";
import { useToast } from "./Toast";

/** My account: email for notifications / Forgot password, and password change */
export default function ChangePassword() {
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get("/auth/me").then((res) => { setAccount(res.data); setEmail(res.data.email); });
  }, []);

  const saveEmail = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      const { data } = await api.put("/auth/profile", { email });
      setAccount(data);
      toast.success("Email saved successfully",
        data.email ? `Reset links and notifications go to ${data.email}.` : "No email set - Forgot password will not work.");
    } catch (err) {
      toast.error("Could not save the email", errorMessage(err));
    } finally {
      setSavingEmail(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      setMessage({ type: "error", text: "The new passwords do not match." });
      return;
    }
    try {
      await api.put("/auth/password", form);
      setMessage(null);
      toast.success("Password changed successfully",
        account?.email ? `A confirmation email was sent to ${account.email}.` : "Use the new password next time you log in.");
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
      toast.error("Could not change password", errorMessage(err));
    }
  };

  const field = (name, label, autoComplete) => (
    <div className="admin-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} type="password" autoComplete={autoComplete} value={form[name]} required
             onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
    </div>
  );

  return (
    <>
      <h1 className="admin-title">My account</h1>
      <div className="admin-account">
        <form className="admin-card" onSubmit={saveEmail}>
          <h2 className="admin-card__title admin-card__title--icon"><Mail /> Email for notifications</h2>
          <p className="admin-muted admin-small">
            Logged in as <strong>{account?.username || "…"}</strong>. This email receives <strong>Forgot password</strong> links
            and a security email whenever the password is changed or reset.
          </p>
          <div className="admin-field">
            <label htmlFor="account-email">Email address</label>
            <input id="account-email" type="email" value={email} placeholder="name@example.com"
                   onChange={(e) => setEmail(e.target.value)} />
          </div>
          {account && !account.email && (
            <p className="admin-alert admin-alert--error">No email is set yet, so "Forgot password" cannot send a reset link.</p>
          )}
          <div className="admin-actions">
            <button className="admin-btn admin-btn--primary" disabled={savingEmail}>{savingEmail ? "Saving…" : "Save email"}</button>
          </div>
        </form>

        <form className="admin-card" onSubmit={submit}>
          <h2 className="admin-card__title admin-card__title--icon"><KeyRound /> Change password</h2>
          {field("current_password", "Current password", "current-password")}
          {field("new_password", "New password (at least 8 characters)", "new-password")}
          {field("confirm", "New password again", "new-password")}
          {message && <p className={`admin-alert admin-alert--${message.type}`}>{message.text}</p>}
          <div className="admin-actions"><button className="admin-btn admin-btn--primary">Change password</button></div>
        </form>
      </div>
    </>
  );
}
