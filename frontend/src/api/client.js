import axios from "axios";

export const TOKEN_KEY = "lit_admin_token";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

// Admin requests carry the login token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid token on an admin page -> back to the login page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith("/admin") &&
        !err.config.url.includes("/auth/login")) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

/** Readable error message from an API error */
export const errorMessage = (err) => err.response?.data?.message || err.message || "Something went wrong.";

export default api;
