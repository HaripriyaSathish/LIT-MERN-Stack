import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { errorMessage } from "../../api/client";
import { useSchema } from "./AdminApp";
import FieldInput from "./FieldInput";
import ItemList from "./ItemList";
import { useToast } from "./Toast";

const defaults = (resource) => {
  const values = { is_active: true };
  for (const f of resource.fields) values[f.name] = f.default ?? (f.type === "bool" ? false : f.type === "int" ? 0 : "");
  return values;
};

/** Add / edit one list item. Events also show their features and videos. */
export default function ItemPage() {
  const { resource: key, id } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { byKey, resources } = useSchema();
  const resource = byKey[key];
  const isNew = id === "new";

  const [values, setValues] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!resource) return;
    if (isNew) {
      const start = defaults(resource);
      if (resource.parentKey) start[resource.parentKey] = Number(search.get(resource.parentKey));
      setValues(start);
    } else {
      api.get(`/admin/${key}/${id}`).then((res) => setValues(res.data)).catch((err) => setMessage({ type: "error", text: errorMessage(err) }));
    }
  }, [key, id, isNew, resource, search]);

  if (!resource) return <p>Unknown section.</p>;

  // Where "Back" goes: the parent event, or the menu entry of this list
  const parentId = resource.parentKey && (values?.[resource.parentKey] || search.get(resource.parentKey));
  const groupSlug = resource.group.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");
  const back = resource.parent ? `/admin/item/${resource.parent}/${parentId}` : `/admin/section/${groupSlug}`;
  const children = resources.filter((r) => r.parent === key);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (isNew) {
        const { data } = await api.post(`/admin/${key}`, values);
        toast.success("Added successfully", `New item added to ${resource.label}.`);
        // Events stay open after adding so features and videos can be added next
        if (children.length) navigate(`/admin/item/${key}/${data.id}`, { replace: true });
        else navigate(back);
      } else {
        const { data } = await api.put(`/admin/${key}/${id}`, values);
        setValues(data);
        toast.success("Saved successfully", `${resource.label} is updated on the website.`);
      }
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
      toast.error("Could not save", errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p><Link to={back} className="admin-back">← Back</Link></p>
      <h1 className="admin-title">{isNew ? "Add" : "Edit"} — {resource.label}</h1>

      {!values ? <div className="admin-card">{message ? message.text : "Loading…"}</div> : (
        <form className="admin-card" onSubmit={save}>
          {resource.fields.map((field) => (
            <FieldInput key={field.name} field={field} folder={resource.parent || key}
                        value={values[field.name]} onChange={(v) => setValues({ ...values, [field.name]: v })} />
          ))}
          <FieldInput field={{ name: "is_active", type: "bool", label: "Show on website" }}
                      value={values.is_active} onChange={(v) => setValues({ ...values, is_active: v })} />
          {message && <p className={`admin-alert admin-alert--${message.type}`}>{message.text}</p>}
          <div className="admin-actions">
            <button className="admin-btn admin-btn--primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <Link className="admin-btn" to={back}>Cancel</Link>
          </div>
        </form>
      )}

      {!isNew && children.map((child) => <ItemList key={child.key} resource={child} parentId={Number(id)} />)}
    </>
  );
}
