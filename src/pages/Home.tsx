import Shell from "@/layouts/Shell";
import { useEffect, useState } from "react";
import { listCategories, countQuestionsByCategory, countSeenByCategory, type Category } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export default function Home(){
  const [rows,setRows] = useState<{c:Category; total:number; seen:number}[]>([]);
  const [userId,setUserId] = useState<string | null>(null);

  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase!.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  },[]);

  useEffect(()=>{
    let alive = true;
    (async ()=>{
      const cats = await listCategories();
      const results: {c:Category; total:number; seen:number}[] = [];
      for(const c of cats){
        const total = await countQuestionsByCategory(c.id);
        const seen = (userId ? await countSeenByCategory(c.id, userId) : 0);
        results.push({ c, total, seen });
      }
      if (alive) setRows(results);
    })().catch(console.error);
    return ()=>{ alive = false; };
  },[userId]);

  return (
    <Shell title="Domov" rightLink={{to:"/settings", label:"Nastavenia"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-start gap-4">
          <img src="https://via.placeholder.com/80x80.png?text=JA" alt="Profil" className="h-20 w-20 rounded-full object-cover border border-gray-200"/>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Ahoj,</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">{userId ? "Prihlásený používateľ" : "Návštevník"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Postup učenia (podľa predmetov)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map(({c,total,seen})=>{
            const pct = total ? Math.round(seen*100/total) : 0;
            return (
              <div key={c.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  <span className="text-sm font-bold text-gray-900">{pct}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[var(--md-primary-blue)] h-2 rounded-full" style={{width:`${pct}%`}} />
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Videli ste <span className="font-semibold text-gray-900">{seen}</span> z <span className="font-semibold text-gray-900">{total}</span> otázok.
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}
