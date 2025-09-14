import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Shell from "@/layouts/Shell";

function useQS(){
  const q = new URLSearchParams(useLocation().search);
  const count = Math.max(1, Number(q.get("count")||"10"));
  const idx = Math.max(1, Number(q.get("q")||"1"));
  return { count, idx };
}
const AKEY = "md_test_answers";
const FKEY = "md_test_flags";

export default function Test(){
  const { count, idx: initialIdx } = useQS();
  const nav = useNavigate();
  const [idx,setIdx] = useState(initialIdx);
  const [answers,setAnswers] = useState<Record<number,string>>(()=> {
    try{ return JSON.parse(localStorage.getItem(AKEY)||"{}"); }catch{return{}}
  });
  const [flags,setFlags] = useState<Set<number>>(()=> {
    try{ return new Set(JSON.parse(localStorage.getItem(FKEY)||"[]")); }catch{return new Set()}
  });

  useEffect(()=>{ localStorage.setItem(AKEY, JSON.stringify(answers)); },[answers]);
  useEffect(()=>{ localStorage.setItem(FKEY, JSON.stringify(Array.from(flags))); },[flags]);

  const qText = useMemo(()=> "Ktorá štruktúra je zodpovedná za produkciu inzulínu?", []);
  const opts = [
    {k:"A", t:"Hypofýza"},
    {k:"B", t:"Pankreas (Langerhansove ostrovčeky)"},
    {k:"C", t:"Pečeň"},
    {k:"D", t:"Štítna žľaza"},
  ];

  // timer
  const [remaining,setRemaining] = useState(90);
  const timerRef = useRef<number|undefined>();
  useEffect(()=>{
    window.clearInterval(timerRef.current);
    setRemaining(90);
    timerRef.current = window.setInterval(()=> setRemaining(r=> {
      if(r<=1){ window.clearInterval(timerRef.current); next(); }
      return r-1;
    }), 1000);
    return ()=> window.clearInterval(timerRef.current);
  },[idx]);

  const pick = (k:string) => setAnswers(a=> ({...a, [idx]:k}));
  const goto = (n:number) => {
    const clamped = Math.max(1, Math.min(count, n));
    setIdx(clamped);
    const u = new URL(location.href); u.searchParams.set("q", String(clamped)); history.replaceState(null,"",u.toString());
  };
  const prev = () => goto(idx-1);
  const next = () => goto(idx+1);
  const finishEnabled = Object.keys(answers).length >= count;

  const mm = (n:number)=> String(Math.floor(n/60)).padStart(2,"0");
  const ss = (n:number)=> String(n%60).padStart(2,"0");

  return (
    <Shell title="Test">
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-700"><span className="font-semibold">Otázka</span> {idx}/{count}</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 hidden sm:inline">Čas na otázku</span>
            <span className="badge badge-blue">{mm(remaining)}:{ss(remaining)}</span>
            <button onClick={()=> setFlags(f=>{ const nf=new Set(f); nf.has(idx)?nf.delete(idx):nf.add(idx); return nf; })}
              className={`rounded-full border text-xs font-bold px-3 py-1.5 ${flags.has(idx)?'bg-amber-50 text-amber-700 border-amber-300':'bg-blue-50 text-blue-700 border-gray-200 hover:bg-blue-100'}`}>
              {flags.has(idx)?'Označené':'Označiť'}
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {Array.from({length: count}, (_,i)=> i+1).map(n=>{
              const answered = !!answers[n];
              const current = n===idx;
              return (
                <button key={n} onClick={()=>goto(n)}
                  className={`qchip rounded-full border border-gray-200 bg-white text-sm font-bold px-3 py-1.5
                    ${current?'qchip-current':''} ${answered?'qchip-answered':''}`}>
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900">{qText}</h2>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {opts.map(o=>(
            <button key={o.k} onClick={()=>pick(o.k)}
              className={`answer-btn rounded-xl border border-gray-200 bg-white text-left px-4 py-3 ${answers[idx]===o.k?'answer-selected':''}`}>
              {o.k}) {o.t}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={prev} disabled={idx===1}
            className={`rounded-full text-sm font-bold px-5 py-2 ${idx===1?'bg-blue-50 text-blue-700/60 cursor-not-allowed':'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
            Predošlá
          </button>
          <div className="flex items-center gap-3">
            <button onClick={next} className="rounded-full bg-blue-50 text-blue-700 text-sm font-bold px-5 py-2 hover:bg-blue-100">Preskočiť</button>
            <button onClick={next} className="rounded-full bg-blue-500 text-white text-sm font-bold px-5 py-2 hover:bg-blue-600">Ďalej</button>
            <button onClick={()=> location.assign("/results")} disabled={!finishEnabled}
              className={`rounded-full text-white text-sm font-bold px-5 py-2 ${finishEnabled?'bg-blue-500 hover:bg-blue-600':'bg-blue-500/60 cursor-not-allowed'}`}>
              Ukončiť test
            </button>
          </div>
        </div>
      </section>
    </Shell>
  );
}
