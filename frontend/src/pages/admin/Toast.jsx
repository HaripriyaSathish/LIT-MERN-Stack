import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

/**
 * Pop-up messages for the admin panel ("Saved successfully" ...).
 *   const toast = useToast();
 *   toast.success("Hero Section saved");
 *   toast.error("Something went wrong");
 */
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const DURATION = 3500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const close = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 250);
  }, []);

  const show = useCallback((type, title, text = "") => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-3), { id, type, title, text }]);
    setTimeout(() => close(id), type === "error" ? DURATION + 2000 : DURATION);
  }, [close]);

  const toast = useMemo(() => ({
    success: (title, text) => show("success", title, text),
    error: (title, text) => show("error", title, text),
  }), [show]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}${t.leaving ? " is-leaving" : ""}`} role="status">
            <span className="toast__icon">{t.type === "success" ? <CircleCheck /> : <CircleAlert />}</span>
            <span className="toast__body">
              <strong>{t.title}</strong>
              {t.text && <span>{t.text}</span>}
            </span>
            <button type="button" className="toast__close" onClick={() => close(t.id)} aria-label="Close"><X /></button>
            <span className="toast__bar" style={{ animationDuration: `${t.type === "error" ? DURATION + 2000 : DURATION}ms` }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
