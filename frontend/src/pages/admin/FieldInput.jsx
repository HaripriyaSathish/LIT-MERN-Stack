import { useState } from "react";
import api, { errorMessage } from "../../api/client";
import Icon from "../../components/Icon";
import { useSchema } from "./AdminApp";
import { useToast } from "./Toast";

/** Image: paste a URL or upload a file (Cloudinary / backend uploads), with a preview */
function ImageInput({ value, onChange, folder, id }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    form.append("folder", folder);
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/admin/upload", form);
      onChange(data.url);
      toast.success("Image uploaded", "Click Save to show it on the website.");
    } catch (err) {
      setError(errorMessage(err));
      toast.error("Upload failed", errorMessage(err));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="admin-image">
      {value && <img className="admin-image__preview" src={value} alt="" />}
      <div className="admin-image__controls">
        <input id={id} type="url" value={value || ""} placeholder="https://… or upload" onChange={(e) => onChange(e.target.value)} />
        <div className="admin-image__buttons">
          <label className="admin-btn">
            {busy ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/*" hidden onChange={upload} disabled={busy} />
          </label>
          {value && <button type="button" className="admin-btn" onClick={() => onChange("")}>Remove</button>}
        </div>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}
      </div>
    </div>
  );
}

/** One form field, chosen by its schema type */
export default function FieldInput({ field, value, onChange, folder = "misc" }) {
  const { icons } = useSchema();
  const id = `f-${field.name}`;
  let input;

  switch (field.type) {
    case "bool":
      return (
        <label className="admin-check">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span>{field.label}</span>
          {field.help && <small className="admin-help">{field.help}</small>}
        </label>
      );
    case "textarea":
      input = <textarea id={id} rows={field.rows || 4} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "image":
      input = <ImageInput id={id} value={value} onChange={onChange} folder={folder} />;
      break;
    case "select":
      input = (
        <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)}>
          {field.options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
        </select>
      );
      break;
    case "icon":
      input = (
        <div className="admin-icon-select">
          <span className="admin-icon-preview">{value ? <Icon name={value} /> : "—"}</span>
          <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)}>
            {field.allowEmpty && <option value="">(no icon)</option>}
            {icons.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      );
      break;
    case "int":
      input = <input id={id} type="number" value={value ?? 0} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "date":
      input = <input id={id} type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;
      break;
    case "time":
      input = <input id={id} type="time" value={(value || "").slice(0, 5)} onChange={(e) => onChange(e.target.value)} />;
      break;
    default:
      input = (
        <input id={id} type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
               value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} />
      );
  }

  return (
    <div className="admin-field">
      <label htmlFor={id}>{field.label}{field.required && " *"}</label>
      {input}
      {field.help && <small className="admin-help">{field.help}</small>}
    </div>
  );
}
