import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { errorMessage } from "../../api/client";
import { useToast } from "./Toast";
import "../../styles/admin.css";

/** Step 2: the link from the email opens this page -> choose a new password */
export default function ResetPassword() {
  const [search] = useSearchParams();
  const token = search.get("token") || "";
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Reset password | LIT Admin"; }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/reset-password", { token, password: form.password });
      toast.success("Password reset successfully", data.message);
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin admin-login">
      <div className="admin-card admin-login__card">
        <h1>New password</h1>
        {!token ? (
          <p className="admin-alert admin-alert--error">This link is not complete. Please open the link from the email again, or ask for a new one.</p>
        ) : (
          <form onSubmit={submit}>
            <p className="admin-muted">Choose a new password for the admin panel (at least 8 characters).</p>
            {error && <p className="admin-alert admin-alert--error">{error}</p>}
            <label className="admin-field">
              <span>New password</span>
              <input type="password" autoFocus autoComplete="new-password" minLength={8} value={form.password}
                     onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <label className="admin-field">
              <span>New password again</span>
              <input type="password" autoComplete="new-password" minLength={8} value={form.confirm}
                     onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </label>
            <button className="admin-btn admin-btn--primary admin-btn--block" disabled={busy}>
              {busy ? "Saving…" : "Reset password"}
            </button>
          </form>
        )}
        <p className="admin-auth-foot">
          <Link to="/admin/forgot-password" className="admin-auth-link">Ask for a new link</Link>
          {" · "}
          <Link to="/admin/login" className="admin-auth-link">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
