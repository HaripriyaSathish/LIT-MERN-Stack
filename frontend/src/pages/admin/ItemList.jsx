import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../../api/client";
import { useToast } from "./Toast";

const isImage = (value) => /^https?:\/\/.+\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value || "");

/** Table of list items (menu links, cards, photos...) with order, show/hide, edit and delete */
export default function ItemList({ resource, parentId }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const toast = useToast();
  const query = resource.parentKey ? `?${resource.parentKey}=${parentId}` : "";

  const load = useCallback(() => {
    api.get(`/admin/${resource.key}${query}`).then((res) => setItems(res.data)).catch((err) => setError(errorMessage(err)));
  }, [resource.key, query]);

  useEffect(load, [load]);

  const toggleShow = async (item, show) => {
    try {
      await api.put(`/admin/${resource.key}/${item.id}`, { is_active: show });
      toast.success(show ? "Now showing on the website" : "Hidden from the website", `${resource.label} updated.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
      toast.error("Could not update", errorMessage(err));
    }
  };

  // Move an item to another position (0-based), then number the whole list 1, 2, 3...
  const moveTo = async (index, target) => {
    target = Math.max(0, Math.min(items.length - 1, target));
    if (target === index) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setItems(next);
    try {
      await Promise.all(next.map((item, i) =>
        item.sort_order === i + 1 ? null : api.put(`/admin/${resource.key}/${item.id}`, { sort_order: i + 1 })
      ));
      toast.success("Order saved", `Moved to position ${target + 1}.`);
    } catch (err) {
      setError(errorMessage(err));
      toast.error("Could not change the order", errorMessage(err));
    }
    load();
  };

  // Position typed in the number box (1 = first)
  const onPositionChange = (index, e) => {
    const position = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(position)) {
      e.target.value = index + 1;
      return;
    }
    e.target.value = Math.max(1, Math.min(items.length, position));
    moveTo(index, position - 1);
  };

  const remove = async (item) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/${resource.key}/${item.id}`);
      toast.success("Deleted successfully", `Removed from ${resource.label}.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
      toast.error("Could not delete", errorMessage(err));
    }
  };

  const columns = resource.display.length ? resource.display : [resource.fields[0].name];
  const backQuery = parentId ? `?${resource.parentKey}=${parentId}` : "";

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2 className="admin-card__title">{resource.label}</h2>
        <Link className="admin-btn admin-btn--primary" to={`/admin/item/${resource.key}/new${backQuery}`}>+ Add</Link>
      </div>
      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {!items ? <p>Loading…</p> : items.length === 0 ? <p className="admin-muted">Nothing added yet.</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                {columns.map((c) => <th key={c}>{resource.fields.find((f) => f.name === c)?.label || c}</th>)}
                <th>Show</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className={item.is_active ? "" : "is-hidden-row"}>
                  <td className="admin-order">
                    <input
                      key={`${item.id}-${i}`}
                      className="admin-order__num" type="number" min="1" max={items.length}
                      defaultValue={i + 1} aria-label={`Position (1 to ${items.length})`}
                      title="Type a position and press Enter"
                      onBlur={(e) => onPositionChange(i, e)}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    />
                    <button type="button" onClick={() => moveTo(i, i - 1)} disabled={i === 0} aria-label="Move up" title="Move up">↑</button>
                    <button type="button" onClick={() => moveTo(i, i + 1)} disabled={i === items.length - 1} aria-label="Move down" title="Move down">↓</button>
                  </td>
                  {columns.map((c) => (
                    <td key={c}>
                      {isImage(item[c]) ? <img className="admin-thumb" src={item[c]} alt="" /> : String(item[c] ?? "")}
                    </td>
                  ))}
                  <td>
                    <input type="checkbox" checked={item.is_active} aria-label="Show on website"
                           onChange={(e) => toggleShow(item, e.target.checked)} />
                  </td>
                  <td className="admin-row-actions">
                    <Link className="admin-btn" to={`/admin/item/${resource.key}/${item.id}${backQuery}`}>Edit</Link>
                    <button type="button" className="admin-btn admin-btn--danger" onClick={() => remove(item)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
