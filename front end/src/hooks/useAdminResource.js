import { useState, useCallback } from "react";

export default function useAdminResource({
  getUrl,
  deleteUrl,
  listKey,
  deletePayloadKey = "id",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getUrl, { method: "GET" });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      const list = listKey && data[listKey] ? data[listKey] : data;
      setItems(Array.isArray(list) ? list : []);
      return list;
    } catch (err) {
      setError(err);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getUrl, listKey]);

  const remove = useCallback(
    async (identifier) => {
      try {
        const res = await fetch(deleteUrl, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [deletePayloadKey]: identifier }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || data.message || "Delete failed");
        // refresh list
        await fetchItems();
        return data;
      } catch (err) {
        console.error(err);
        setError(err);
        throw err;
      }
    },
    [deleteUrl, deletePayloadKey, fetchItems]
  );

  return { items, loading, error, fetchItems, remove, setItems };
}
