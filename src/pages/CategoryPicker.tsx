import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface Category { id: string; name: string; is_active: boolean; }

export default function CategoryPicker() {
  const [cats, setCats] = useState<Category[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.from("categories").select("id,name,is_active").eq("is_active", true).order("sort_index", { ascending: true }).then(({ data }) => setCats(data ?? []));
  }, []);
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
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/subject/${c.id}`); }}
        >
          <CardHeader><CardTitle>{c.name}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Open to choose Learning or Test</CardContent>
        </Card>
      ))}
    </section>
  );
}
