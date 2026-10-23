import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import InfoPage from "./pages/InfoPage";

// The admin panel is loaded only when /admin is opened
const AdminApp = lazy(() => import("./pages/admin/AdminApp"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
      <Route path="/:slug" element={<InfoPage />} />
    </Routes>
  );
}
