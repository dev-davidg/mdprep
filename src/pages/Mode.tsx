import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "@/layouts/Shell";
import { listCategories, type Category } from "@/lib/data";

export default function Mode(){
  const nav = useNavigate();
  const [categories,setCategories] = useState<Category[]>([]);
  const [categoryId,setCategoryId] = useState<string>("");
  const [mode,setMode] = useState<"learn"|"test"|null>(null);
  const [count,setCount] = useState<number|null>(null);

  useEffect(()=>{
    listCategories().then(setCategories).catch(console.error);
  },[]);

  const go = () => {
    if(!mode || !count || !categoryId) return;
    const q = `?category=${encodeURIComponent(categoryId)}&count=${encodeURIComponent(count)}`;
    nav(mode === "test" ? `/test${q}` : `/learning${q}`);
  };

  return (
    <Shell title="Výber režimu">
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">0. Predmet</h2>
        <select className="rounded-xl border-gray-300 px-3 py-2 w-full max-w-sm"
          value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
          <option value="">— vyberte predmet —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">1. Vyberte režim</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {k:"learn", t:"Učiaci režim", d:"Okamžite vidíte správnu odpoveď a vysvetlenie."},
            {k:"test",  t:"Testovací režim", d:"Bez odhalenia správnych odpovedí, s časovačom."},
          ].map(x=>(
            <button key={x.k as string}
              onClick={()=>setMode(x.k as any)}
              className={`rounded-2xl border p-4 text-left hover:border-blue-300 ${mode===x.k?'border-blue-600 bg-blue-50 ring-2 ring-blue-500/40':''}`}>
              <p className="text-sm font-semibold text-gray-900">{x.t}</p>
              <p className="text-xs text-gray-600 mt-1">{x.d}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">2. Počet otázok</h2>
        <div className="flex flex-wrap gap-2">
          {[5,10,20,30,50].map(n=>(
            <button key={n} onClick={()=>setCount(n)}
              className={`px-4 py-2 rounded-full border text-sm font-semibold hover:border-blue-300 ${count===n?'border-blue-600 bg-blue-50':''}`}>
              {n}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input type="number" min={1} max={200} placeholder="Vlastné" className="w-28 rounded-full border-gray-300 text-sm px-3 py-2"
              onChange={e=> setCount(Math.max(1, Math.min(200, Number(e.target.value))))}/>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end">
        <button onClick={go} disabled={!mode || !count || !categoryId}
          className={`rounded-full text-white text-sm font-bold px-6 py-3 ${mode&&count&&categoryId?'bg-blue-500 hover:bg-blue-600':'bg-blue-500/50 cursor-not-allowed'}`}>
          Pokračovať
        </button>
      </div>
    </Shell>
  );
}
