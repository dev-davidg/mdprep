import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

type Cat = { id: string; label: string };

export default function CategoryPicker() {
  const [cats, setCats] = useState<Cat[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // Be schema-agnostic: fetch all cols and derive a display label
      const { data, error } = await supabase.from("categories").select("*").limit(100);
      if (error) {
        console.error(error);
        setCats([]);
        return;
      }
      const mapped =
        (data ?? []).map((r: any) => ({
          id: r.id,
          label:
            r.name ??
            r.title ??
            r.label ??
            r.slug ??
            r.code ??
            "Category",
        })) || [];
      // Sort by label for consistent ordering
      mapped.sort((a, b) => a.label.localeCompare(b.label));
      setCats(mapped);
    })();
  }, []);

  if (!cats.length) {
    return <p className="text-sm text-muted-foreground">No categories found. Add rows to <code>public.categories</code> in Supabase.</p>;
  }

  return (
    <section aria-labelledby="pickTitle" className="grid gap-4 md:grid-cols-3">
      <h1 id="pickTitle" className="sr-only">Pick a subject</h1>
      {cats.map((c) => (
        <Card
          key={c.id}
          className="relative cursor-pointer focus-visible:outline-2 focus-visible:outline focus-visible:outline-offset-2"
          onClick={() => navigate(`/subject/${c.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(`/subject/${c.id}`);
          }}
        >
          <CardHeader><CardTitle>{c.label}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Open to choose Learning or Test
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
