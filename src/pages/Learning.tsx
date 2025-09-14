import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Shell from "@/layouts/Shell";

function useQS(){
  const q = new URLSearchParams(useLocation().search);
  const count = Math.max(1, Number(q.get("count")||"10"));
  const idx = Math.max(1, Number(q.get("q")||"1"));
  return { count, idx };
}

export default function Learning(){
  const nav = useNavigate();
  const { count, idx } = useQS();
  const [answered,setAnswered] = useState(false);
  const [selected,setSelected] = useState<string|null>(null);

  const qText = useMemo(()=> "Ktorá štruktúra je zodpovedná za produkciu inzulínu?", []);
  const answers = [
    {k:"A", t:"Hypofýza", ok:false},
    {k:"B", t:"Pankreas (Langerhansove ostrovčeky)", ok:true},
    {k:"C", t:"Pečeň", ok:false},
    {k:"D", t:"Štítna žľaza", ok:false},
  ];
  const correctKey = "B";

  const go = (to:number) => {
    const n = Math.max(1, Math.min(count, to));
    nav(`/learning?count=${count}&q=${n}`);
  };

  const pick = (k:string) => {
    if(answered) return;
    setSelected(k);
    setAnswered(true);
  };

  return (
    <Shell title="Učenie" rightLink={{to:"/mode", label:"Späť"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-700"><span className="font-semibold">Otázka</span> {idx}/{count}</div>
          <button className="rounded-full border border-gray-200 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 hover:bg-blue-100">Označiť</button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900">{qText}</h2>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {answers.map(a=>{
            const correct = answered && a.k===correctKey;
            return (
              <button key={a.k}
                onClick={()=> pick(a.k)}
                className={`answer-btn rounded-xl border border-gray-200 bg-white text-left px-4 py-3 ${correct?'answer-correct':''} ${answered?'answer-disabled':''}`}>
                {a.k}) {a.t}
              </button>
            );
          })}
        </div>

        <details className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3" open={answered}>
          <summary className="cursor-pointer text-sm font-semibold text-gray-900">Vysvetlenie</summary>
          <div className="mt-2 prose text-sm text-gray-700">
            Inzulín sa produkuje v β-bunkách Langerhansových ostrovčekov pankreasu. Hypofýza ani štítna žľaza ho neprodukujú.
          </div>
        </details>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={()=>go(idx-1)} disabled={idx===1}
            className={`rounded-full text-sm font-bold px-5 py-2 ${idx===1?'bg-blue-50 text-blue-700/60 cursor-not-allowed':'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
            Predošlá
          </button>
          <button onClick={()=>go(idx+1)}
            className="rounded-full bg-blue-500 text-white text-sm font-bold px-5 py-2 hover:bg-blue-600">
            Ďalšia otázka
          </button>
        </div>
      </section>
    </Shell>
  );
}
