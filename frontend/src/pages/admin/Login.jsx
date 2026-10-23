import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { TOKEN_KEY, errorMessage } from "../../api/client";
import { useToast } from "./Toast";
import "../../styles/admin.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => { document.title = "Log in | LIT Admin"; }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem(TOKEN_KEY, data.token);
      toast.success(`Welcome back, ${data.admin.username}`, "You are logged in.");
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin admin-login">
      <form className="admin-card admin-login__card" onSubmit={submit}>
        <h1>LIT Admin</h1>
        <p className="admin-muted">London Indian Tamils website</p>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}
        <label className="admin-field">
          <span>Username</span>
          <input autoFocus autoComplete="username" value={form.username}
                 onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </label>
        <label className="admin-field">
          <span className="admin-field__row">
            Password
            <Link to="/admin/forgot-password" className="admin-auth-link">Forgot password?</Link>
          </span>
          <input type="password" autoComplete="current-password" value={form.password}
                 onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="admin-btn admin-btn--primary admin-btn--block" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
