import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import api, { TOKEN_KEY } from "../../api/client";
import Login from "./Login";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import GroupPage from "./GroupPage";
import ItemPage from "./ItemPage";
import ChangePassword from "./ChangePassword";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import { ToastProvider } from "./Toast";
import "../../styles/admin.css";

/** Schema of every section (from the backend) shared by all admin pages */
const SchemaContext = createContext(null);
export const useSchema = () => useContext(SchemaContext);

export const groupSlug = (group) => group.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");

function Protected() {
  const [schema, setSchema] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = "LIT Admin";
    if (!localStorage.getItem(TOKEN_KEY)) return;
    Promise.all([api.get("/auth/me"), api.get("/admin/schema")]).then(([me, s]) => {
      const byKey = Object.fromEntries(s.data.resources.map((r) => [r.key, r]));
      const groups = [];
      for (const r of s.data.resources) {
        let g = groups.find((x) => x.name === r.group);
        if (!g) groups.push((g = { name: r.group, slug: groupSlug(r.group), resources: [] }));
        g.resources.push(r);
      }
      setUser(me.data);
      setSchema({ ...s.data, byKey, groups });
    });
  }, []);

  if (!localStorage.getItem(TOKEN_KEY)) return <Navigate to="/admin/login" replace />;
  if (!schema) return <div className="admin-loading">Loading…</div>;

  return (
    <SchemaContext.Provider value={schema}>
      <Routes>
        <Route element={<AdminLayout user={user} />}>
          <Route index element={<Dashboard />} />
          <Route path="section/:group" element={<GroupPage />} />
          <Route path="item/:resource/:id" element={<ItemPage />} />
          <Route path="password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </SchemaContext.Provider>
  );
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Protected />} />
      </Routes>
    </ToastProvider>
  );
}
