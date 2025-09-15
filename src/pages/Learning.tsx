import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Shell from "@/layouts/Shell";
import { getQuestions, upsertSeen, type Question, letterFromIndex } from "@/lib/data";
import { supabase } from "@/lib/supabase";

function useQS(){
  const q = new URLSearchParams(useLocation().search);
  const count = Math.max(1, Number(q.get("count")||"10"));
  const idx = Math.max(1, Number(q.get("q")||"1"));
  const category = q.get("category") || "";
  return { count, idx, category };
}

export default function Learning(){
  const nav = useNavigate();
  const { count, idx, category } = useQS();
  const [items,setItems] = useState<Question[]>([]);
  const [answered,setAnswered] = useState(false);
  const [selected,setSelected] = useState<string|null>(null);

  useEffect(()=>{
    if (!category) return;
    getQuestions(category, count).then(setItems).catch(console.error);
  },[category, count]);

  const current = items[idx-1];

  const go = (to:number) => {
    const n = Math.max(1, Math.min(count, to));
    nav(`/learning?category=${category}&count=${count}&q=${n}`);
  };

  const pick = async (label: string) => {
    if(answered) return;
    setSelected(label);
    setAnswered(true);
    try {
      const { data: u } = await supabase!.auth.getUser();
      if (u?.user && current){
        await upsertSeen(current.id, u.user.id);
      }
    } catch(err){ console.error(err); }
  };

  const correct = current?.answers.find(a=>a.is_correct);
  const correctLabel = correct ? letterFromIndex(correct.order_index) : null;

  return (
    <Shell title="Učenie" rightLink={{to:"/mode", label:"Späť"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-700"><span className="font-semibold">Otázka</span> {idx}/{count}</div>
          <button className="rounded-full border border-gray-200 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 hover:bg-blue-100">Označiť</button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900">{current ? current.text : "Načítavam..."}</h2>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {current?.answers.map(a=>{
            const label = letterFromIndex(a.order_index);
            const showCorrect = answered && correctLabel === label;
            return (
              <button key={a.id}
                onClick={()=> pick(label)}
                className={`answer-btn rounded-xl border border-gray-200 bg-white text-left px-4 py-3 ${showCorrect?'answer-correct':''} ${answered?'answer-disabled':''}`}>
                {label}) {a.text}
              </button>
            );
          })}
        </div>

        <details className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3" open={answered}>
          <summary className="cursor-pointer text-sm font-semibold text-gray-900">Vysvetlenie</summary>
          <div className="mt-2 prose text-sm text-gray-700">{current?.explanation ?? "—"}</div>
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
