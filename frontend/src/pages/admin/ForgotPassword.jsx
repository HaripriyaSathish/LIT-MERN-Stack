import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import api, { errorMessage } from "../../api/client";
import { useToast } from "./Toast";
import "../../styles/admin.css";

/** Step 1: enter username or email -> a reset link is emailed */
export default function ForgotPassword() {
  const [login, setLogin] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => { document.title = "Forgot password | LIT Admin"; }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { login });
      setSent(true);
      toast.success("Check your email", "If the account has an email address, a reset link is on its way.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin admin-login">
      <div className="admin-card admin-login__card">
        <h1>Forgot password</h1>
        {sent ? (
          <div className="admin-auth-done">
            <span className="admin-auth-done__icon"><MailCheck /></span>
            <p><strong>Check your email.</strong></p>
            <p className="admin-muted">
              If the account has an email address, we have sent a link to reset the password.
              The link works once and expires in 30 minutes. Remember to check the spam folder.
            </p>
            <button type="button" className="admin-btn admin-btn--block" onClick={() => setSent(false)}>Send again</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="admin-muted">Enter your username or the email address of the admin account. We will email you a link to set a new password.</p>
            {error && <p className="admin-alert admin-alert--error">{error}</p>}
            <label className="admin-field">
              <span>Username or email</span>
              <input autoFocus autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} required />
            </label>
            <button className="admin-btn admin-btn--primary admin-btn--block" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="admin-auth-foot"><Link to="/admin/login" className="admin-auth-link">← Back to log in</Link></p>
      </div>
    </div>
  );
}
