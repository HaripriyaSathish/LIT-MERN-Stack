import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/client";
import FieldInput from "./FieldInput";
import { useToast } from "./Toast";

/** Form for a one-row section (Hero, About, Footer...) */
export default function SectionForm({ resource }) {
  const [values, setValues] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/admin/${resource.key}`).then((res) => setValues(res.data));
  }, [resource.key]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await api.put(`/admin/${resource.key}`, values);
      setValues(data);
      toast.success("Saved successfully", `${resource.label} is updated on the website.`);
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
      toast.error("Could not save", errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!values) return <div className="admin-card">Loading…</div>;

  return (
    <form className="admin-card" onSubmit={save}>
      <h2 className="admin-card__title">{resource.label}</h2>
      {resource.fields.map((field) => (
        <FieldInput key={field.name} field={field} folder={resource.key}
                    value={values[field.name]} onChange={(v) => setValues({ ...values, [field.name]: v })} />
      ))}
      {message && <p className={`admin-alert admin-alert--${message.type}`}>{message.text}</p>}
      <div className="admin-actions">
        <button className="admin-btn admin-btn--primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
