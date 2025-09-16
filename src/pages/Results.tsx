import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Shell from "@/layouts/Shell";
import { getCorrectMap } from "@/lib/data";

const AKEY = "md_test_answers";
const QKEY = "md_test_qids";

export default function Results(){
  const qs = new URLSearchParams(useLocation().search);
  const total = Math.max(1, Number(qs.get("count")||"10"));
  const [correct,setCorrect] = useState(0);
  const [loaded,setLoaded] = useState(false);

  useEffect(()=>{
    (async ()=>{
      let answers: Record<number,string> = {};
      let qids: string[] = [];
      try{ answers = JSON.parse(localStorage.getItem(AKEY)||"{}"); }catch{}
      try{ qids = JSON.parse(localStorage.getItem(QKEY)||"[]"); }catch{}
      if (!qids.length){ setCorrect(0); setLoaded(true); return; }
      const cmap = await getCorrectMap(qids);
      let ok = 0;
      for (let i=1;i<=total;i++){
        const qid = qids[i-1];
        const yours = answers[i];
        const correct = qid ? cmap[qid] : undefined;
        if (yours && correct && yours===correct) ok++;
      }
      setCorrect(ok);
      setLoaded(true);
    })().catch(()=>setLoaded(true));
  },[total]);

  const pct = Math.round(correct*100/total);

  return (
    <Shell title="Výsledky testu" rightLink={{to:"/mode", label:"Späť na výber"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        {!loaded ? (
          <p className="text-sm text-gray-600">Počítam výsledok…</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Skóre</p>
                <p className="text-2xl font-extrabold text-gray-900">{correct} / {total} <span className="text-base font-semibold text-gray-700">({pct}%)</span></p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[var(--md-primary-blue)] h-2 rounded-full" style={{width:`${pct}%`}} />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Správne zodpovedané otázky: <span className="font-semibold text-gray-900">{correct}</span> z <span className="font-semibold text-gray-900">{total}</span>.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/review" className="rounded-full bg-blue-500 text-white text-sm font-bold px-5 py-2 hover:bg-blue-600">Zobraziť odpovede</Link>
              <Link to="/mode" className="rounded-full bg-blue-50 text-blue-700 text-sm font-bold px-5 py-2 hover:bg-blue-100">Nový test</Link>
            </div>
          </>
        )}
      </section>
    </Shell>
  );
}
