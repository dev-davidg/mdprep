import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Item { id: string; stem: string; mark_type: "flag" | "hard"; }

export default function Lists() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("user_marks")
        .select("id, mark_type, question:questions(id, stem)")
        .order("created_at", { ascending: false });
      const mapped = (data ?? []).map((r: any) => ({ id: r.question.id, stem: r.question.stem, mark_type: r.mark_type }));
      setItems(mapped);
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-3">Flagged & Hard</h1>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div>{it.stem}</div>
              <span className="text-xs text-muted-foreground uppercase">{it.mark_type}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
