import { useEffect, useState } from "react";
import { datasets } from "./content";
const key = "rd-ready:review-checklists:v1";
type Lists = Record<string, string[]>;
export function useChecklist() {
  const [lists, setLists] = useState<Lists>({});
  const [remember, setRemember] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storageNote, setStorageNote] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw && raw.length < 10000) {
        const value: unknown = JSON.parse(raw);
        if (
          value &&
          typeof value === "object" &&
          "version" in value &&
          value.version === 1 &&
          "lists" in value &&
          value.lists &&
          typeof value.lists === "object"
        ) {
          const saved = value.lists as Record<string, unknown>;
          const valid: Lists = {};
          for (const [dataset, items] of Object.entries(datasets)) {
            const ids = saved[dataset];
            if (Array.isArray(ids))
              valid[dataset] = [
                ...new Set(
                  ids.filter(
                    (id): id is string =>
                      typeof id === "string" &&
                      items.some((item) => item.id === id),
                  ),
                ),
              ];
          }
          setLists(valid);
          setRemember(true);
        }
      }
    } catch {
      setStorageNote(
        "ยังอ่านรายการที่บันทึกไม่ได้ คุณใช้เช็กลิสต์ในหน้านี้ต่อได้",
      );
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      if (remember)
        localStorage.setItem(key, JSON.stringify({ version: 1, lists }));
      else localStorage.removeItem(key);
    } catch {
      setStorageNote("เบราว์เซอร์ไม่อนุญาตให้บันทึก รายการยังใช้ได้ในหน้านี้");
      setRemember(false);
    }
  }, [loaded, remember, lists]);
  function toggle(dataset: string, id: string) {
    if (!datasets[dataset]?.some((item) => item.id === id)) return;
    setLists((previous) => {
      const current = previous[dataset] ?? [];
      return {
        ...previous,
        [dataset]: current.includes(id)
          ? current.filter((i) => i !== id)
          : [...current, id],
      };
    });
  }
  function clear(dataset: string) {
    setLists((previous) => ({ ...previous, [dataset]: [] }));
  }
  return { lists, remember, setRemember, storageNote, loaded, toggle, clear };
}
