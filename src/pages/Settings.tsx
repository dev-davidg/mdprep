import Shell from "@/layouts/Shell";
import { useEffect, useState } from "react";
const PKEY = "mdprep_prefs";

export default function Settings(){
  const [autoExplain,setAutoExplain] = useState(false);
  const [autoAdvance,setAutoAdvance] = useState(false);

  useEffect(()=>{
    try{
      const x = JSON.parse(localStorage.getItem(PKEY) || "{}");
      setAutoExplain(!!x.autoExplain);
      setAutoAdvance(!!x.autoAdvance);
    }catch{}
  },[]);
  useEffect(()=>{
    try{
      localStorage.setItem(PKEY, JSON.stringify({ autoExplain, autoAdvance }));
    }catch{}
  },[autoExplain,autoAdvance]);

  return (
    <Shell title="Nastavenia">
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Preferencie</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-900 font-semibold">Automaticky rozbaliť vysvetlenie (Učenie)</span>
            <input type="checkbox" checked={autoExplain} onChange={e=>setAutoExplain(e.target.checked)} className="h-5 w-5"/>
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-900 font-semibold">Prejsť na ďalšiu otázku po výbere (Test)</span>
            <input type="checkbox" checked={autoAdvance} onChange={e=>setAutoAdvance(e.target.checked)} className="h-5 w-5"/>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Účet</h2>
        <p className="text-sm text-gray-600">Prihlásený ako: <span className="font-semibold">jan.novak@example.com</span></p>
      </section>
    </Shell>
  );
}
