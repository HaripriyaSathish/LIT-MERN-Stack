import { useParams } from "react-router-dom";
import { useSchema } from "./AdminApp";
import SectionForm from "./SectionForm";
import ItemList from "./ItemList";

/** One menu entry of the admin: its section form(s) and item lists */
export default function GroupPage() {
  const { group } = useParams();
  const { groups } = useSchema();
  const current = groups.find((g) => g.slug === group);
  if (!current) return <p>Unknown section.</p>;

  return (
    <>
      <h1 className="admin-title">{current.name}</h1>
      {current.resources.filter((r) => !r.parent).map((r) =>
        r.singleton
          ? <SectionForm key={r.key} resource={r} />
          : <ItemList key={r.key} resource={r} />
      )}
    </>
  );
}
