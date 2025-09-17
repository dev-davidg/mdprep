import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Shell from "@/layouts/Shell";
import { getQuestions, type Question, letterFromIndex } from "@/lib/data";

function useQS(){
  const q = new URLSearchParams(useLocation().search);
  const count = Math.max(1, Number(q.get("count")||"10"));
  const idx = Math.max(1, Number(q.get("q")||"1"));
  const category = q.get("category") || "";
  return { count, idx, category };
}

export default function Learning(){
  const { count, idx: initialIdx, category } = useQS();
  const nav = useNavigate();

  const [idx,setIdx] = useState(initialIdx);
  const [items,setItems] = useState<Question[]>([]);
  const [selected,setSelected] = useState<Record<number,string>>({});
  const [expanded,setExpanded] = useState<Record<number,boolean>>({});
  const [flags,setFlags] = useState<Set<number>>(new Set());

  useEffect(()=>{
    if (!category) return;
    getQuestions(category, count).then(qs=>{
      setItems(qs);
    }).catch(console.error);
  },[category, count]);

  // Keep q=? in URL in sync
  const goto = (n:number) => {
    const clamped = Math.max(1, Math.min(count, n));
    setIdx(clamped);
    const u = new URL(location.href);
    u.searchParams.set("q", String(clamped));
    history.replaceState(null, "", u.toString());
  };
  const prev = () => goto(idx-1);
  const next = () => goto(idx+1);

  const current = items[idx-1];
  const correctLabel = current?.answers.find(a=>a.is_correct)
    ? letterFromIndex(current!.answers.find(a=>a.is_correct)!.order_index)
    : undefined;
  const picked = selected[idx];
  const showReveal = !!picked; // reveal ONLY after user has picked

  const pick = (label:string) => {
    // store selection; do NOT reveal before pick — handled by showReveal
    setSelected(s=> ({...s, [idx]:label}));
    // auto-open explanation on first reveal
    setExpanded(e=> ({...e, [idx]: true}));
  };

  const toggleFlag = () => {
    setFlags(f=>{ const nf=new Set(f); nf.has(idx)?nf.delete(idx):nf.add(idx); return nf; });
  };

  return (
    <Shell title="Učiaci režim" rightLink={{to:"/mode", label:"Späť na výber"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Otázka</span> {idx}/{count}
          </div>
          <button
            onClick={toggleFlag}
            className={`rounded-full border text-xs font-bold px-3 py-1.5 ${flags.has(idx)?'bg-amber-50 text-amber-700 border-amber-300':'bg-blue-50 text-blue-700 border-gray-200 hover:bg-blue-100'}`}>
            {flags.has(idx)?'Označené':'Označiť'}
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-base font-bold text-gray-900">
            {current ? current.text : "Načítavam..."}
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {current?.answers.map(o=>{
            const label = letterFromIndex(o.order_index);
            const isCorrect = o.is_correct === true;
            // Only after a pick: highlight the correct option.
            // If user picked a wrong answer, we do NOT highlight it red (requirement).
            const revealCorrect = showReveal && isCorrect;
            const pickedWrongButThis = showReveal && picked === label && !isCorrect;

            return (
              <button
                key={o.id}
                onClick={()=>pick(label)}
                className={[
                  "rounded-xl border text-left px-4 py-3 transition",
                  "bg-white border-gray-200 hover:bg-gray-50",
                  // show green only for correct after pick
                  revealCorrect ? "bg-green-50 border-green-400" : "",
                  // indicate wrong pick just with a subtle ring (no red highlight)
                  pickedWrongButThis ? "ring-4 ring-blue-600 ring-offset-2" : "",
                ].join(" ").trim()}
              >
                <span className="font-bold mr-2">{label})</span>{o.text}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          <details
            open={!!expanded[idx]}
            onToggle={(e)=> setExpanded(ex => ({...ex, [idx]: (e.target as HTMLDetailsElement).open }))}
            className="rounded-xl border border-gray-200 bg-white p-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-900">
              Vysvetlenie
            </summary>
            <div className="mt-2 text-sm text-gray-700">
              {showReveal ? (current?.explanation || "Bez vysvetlenia.") : "Zobrazí sa po zodpovedaní otázky."}
            </div>
          </details>
          {/* Komentáre – miesto pre budúce použitie */}
          <details className="rounded-xl border border-gray-200 bg-white p-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-900">
              Komentáre (čoskoro)
            </summary>
            <div className="mt-2 text-sm text-gray-600">
              Funkcia bude dostupná neskôr.
            </div>
          </details>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={prev} disabled={idx===1}
            className={`rounded-full text-sm font-bold px-5 py-2 ${idx===1?'bg-blue-50 text-blue-700/60 cursor-not-allowed':'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
            Predošlá
          </button>
          <button onClick={next}
            className="rounded-full bg-blue-500 text-white text-sm font-bold px-5 py-2 hover:bg-blue-600">
            Ďalej
          </button>
        </div>
      </section>
    </Shell>
  );
}
