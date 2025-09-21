import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Shell from "@/layouts/Shell";
import { getQuestions, type Question, letterFromIndex } from "@/lib/data";

function useQS(){
  const q = new URLSearchParams(useLocation().search);
  const count = Math.max(1, Number(q.get("count")||"10"));
  const idx = Math.max(1, Number(q.get("q")||"1"));
  const category = q.get("category") || "";
  return { count, idx, category };
}

const AKEY = "md_test_answers";
const FKEY = "md_test_flags";
const QKEY = "md_test_qids";
const TEST_PER_Q_SECONDS = 45;

export default function Test(){
  const { count, idx: initialIdx, category } = useQS();

  const [idx,setIdx] = useState(initialIdx);
  const [items,setItems] = useState<Question[]>([]);
  const [answers,setAnswers] = useState<Record<number,string>>(()=> {
    try{ return JSON.parse(localStorage.getItem(AKEY)||"{}"); }catch{return{}}
  });
  const [flags,setFlags] = useState<Set<number>>(()=> {
    try{ return new Set(JSON.parse(localStorage.getItem(FKEY)||"[]")); }catch{return new Set()}
  });

  useEffect(()=>{
    if (!category) return;
    getQuestions(category, count).then(qs=>{
      setItems(qs);
      try { localStorage.setItem(QKEY, JSON.stringify(qs.map(q=>q.id))); } catch {}
    }).catch(console.error);
  },[category, count]);

  useEffect(()=>{ try { localStorage.setItem(AKEY, JSON.stringify(answers)); } catch {} },[answers]);
  useEffect(()=>{ try { localStorage.setItem(FKEY, JSON.stringify(Array.from(flags))); } catch {} },[flags]);

  const totalSeconds = Math.max(1, count) * TEST_PER_Q_SECONDS;
  const startKey = `md_test_started_${category}_${count}`;
  const [remaining,setRemaining] = useState<number>(totalSeconds);
  const timerRef = useRef<number|undefined>();

  useEffect(()=>{
    let startMs = 0;
    try{
      const raw = localStorage.getItem(startKey);
      if (raw) startMs = Number(raw) || 0;
    }catch{}
    if (!startMs){
      startMs = Date.now();
      try{ localStorage.setItem(startKey, String(startMs)); }catch{}
    }

    const compute = () => {
      const elapsed = Math.floor((Date.now() - startMs)/1000);
      const left = Math.max(totalSeconds - elapsed, 0);
      setRemaining(left);
      if (left <= 0){
        finish();
      }
    };

    compute();
    timerRef.current = window.setInterval(compute, 1000);
    return ()=> { window.clearInterval(timerRef.current); };
  },[startKey, totalSeconds]);

  const finish = () => {
    location.assign(`/results?category=${category}&count=${count}`);
  };

  const pick = (label:string) => setAnswers(a=> ({...a, [idx]:label}));

  const goto = (n:number) => {
    const clamped = Math.max(1, Math.min(count, n));
    setIdx(clamped);
    const u = new URL(location.href);
    u.searchParams.set("q", String(clamped));
    history.replaceState(null,"",u.toString());
  };
  const prev = () => goto(idx-1);
  const next = () => goto(idx+1);

  const finishEnabled = Object.keys(answers).length >= count;

  const mm = (n:number)=> String(Math.floor(n/60)).padStart(2,"0");
  const ss = (n:number)=> String(n%60).padStart(2,"0");

  const current = items[idx-1];
  const selectedLabel = answers[idx];

  return (
    <Shell title="Test">
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Otázka</span> {idx}/{count}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 hidden sm:inline">Čas do konca</span>
            <span className="badge badge-blue" aria-live="polite">{mm(remaining)}:{ss(remaining)}</span>
            <button
              type="button"
              onClick={()=> setFlags(f=>{ const nf=new Set(f); nf.has(idx)?nf.delete(idx):nf.add(idx); return nf; })}
              className={`rounded-full border text-xs font-bold px-3 py-1.5 ${flags.has(idx)?'bg-amber-50 text-amber-700 border-amber-300':'bg-blue-50 text-blue-700 border-gray-200 hover:bg-blue-100'}`}>
              {flags.has(idx)?'Označené':'Označiť'}
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto no-scrollbar relative z-0">
          <div className="flex items-center gap-2 min-w-max">
            {Array.from({length: count}, (_,i)=> i+1).map(n=>{
              const answered = !!answers[n];
              const currentQ = n===idx;
              const isFlagged = flags.has(n);

              const base = "relative inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
              const palette = answered
                ? "bg-blue-600 text-white border border-blue-600 hover:bg-blue-600/90"
                : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50";
              const currentRing = currentQ ? "ring-2 ring-blue-400" : "";

              return (
                <button
                  key={n}
                  type="button"
                  onClick={()=>goto(n)}
                  aria-current={currentQ ? "true" : undefined}
                  className={[base, palette, currentRing].join(" ").trim()}
                  title={answered ? "Zodpovedané" : "Nezodpovedané"}
                >
                  {n}
                  {isFlagged && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-px -right-px w-0 h-0 border-t-[10px] border-l-[10px] border-t-rose-500 border-l-transparent rounded-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900">{current ? current.text : "Načítavam..."}</h2>

        <div className="mt-4 grid grid-cols-1 gap-2 relative z-50">
          {current?.answers.map(o=>{
            const label = letterFromIndex(o.order_index);
            const isSelected = selectedLabel === label;
            return (
              <button
                key={o.id}
                type="button"
                onClick={()=>pick(label)}
                aria-pressed={isSelected}
                className={[
                  "answer-btn rounded-xl border text-left px-4 py-3 transition pointer-events-auto",
                  "bg-white border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50 border-blue-300" : ""
                ].join(" ")}
              >
                <span className="font-bold mr-2">{label})</span>
                {o.text}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={idx===1}
            className={`rounded-full text-sm font-bold px-5 py-2 ${idx===1?'bg-blue-50 text-blue-700/60 cursor-not-allowed':'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
            Predošlá
          </button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={next} className="rounded-full bg-blue-50 text-blue-700 text-sm font-bold px-5 py-2 hover:bg-blue-100">Preskočiť</button>
            <button type="button" onClick={next} className="rounded-full bg-blue-500 text-white text-sm font-bold px-5 py-2 hover:bg-blue-600">Ďalej</button>
            <button
              type="button"
              onClick={()=> location.assign(`/results?category=${category}&count=${count}`)}
              disabled={!finishEnabled}
              className={`rounded-full text-white text-sm font-bold px-5 py-2 ${finishEnabled?'bg-blue-500 hover:bg-blue-600':'bg-blue-500/60 cursor-not-allowed'}`}>
              Ukončiť test
            </button>
          </div>
        </div>
      </section>
    </Shell>
  );
}
