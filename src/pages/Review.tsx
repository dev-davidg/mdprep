import { useEffect, useState } from "react";
import Shell from "@/layouts/Shell";
import { getQuestionsByIds, getCorrectMap } from "@/lib/data";

const AKEY = "md_test_answers";
const QKEY = "md_test_qids";

type Row = { id:string; text:string; yours:string | null; correct:string | null; ok:boolean };

export default function Review(){
  const [rows,setRows] = useState<Row[]>([]);
  const [loaded,setLoaded] = useState(false);

  useEffect(()=>{
    (async ()=>{
      let answers: Record<number,string> = {};
      let qids: string[] = [];
      try{ answers = JSON.parse(localStorage.getItem(AKEY)||"{}"); }catch{}
      try{ qids = JSON.parse(localStorage.getItem(QKEY)||"[]"); }catch{}
      if (!qids.length){ setRows([]); setLoaded(true); return; }

      const [qs, cmap] = await Promise.all([
        getQuestionsByIds(qids),
        getCorrectMap(qids)
      ]);

      const out: Row[] = qids.map((qid, i) => {
        const q = qs.find(x => x.id === qid);
        const yours = answers[i+1] ?? null;
        const correct = cmap[qid] ?? null;
        const ok = !!(yours && correct && yours === correct);
        return { id: qid, text: q?.text ?? `Otázka #${i+1}`, yours, correct, ok };
      });

      setRows(out);
      setLoaded(true);
    })().catch(()=>setLoaded(true));
  },[]);

  const total = rows.length;
  const correct = rows.reduce((n,r)=> n + (r.ok ? 1 : 0), 0);
  const pct = total ? Math.round(correct*100/total) : 0;

  return (
    <Shell title="Zobrazenie odpovedí" rightLink={{to:"/results", label:"Späť na prehľad"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        {!loaded ? <p className="text-sm text-gray-600">Načítavam…</p> : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Výsledok</p>
                <p className="text-2xl font-extrabold text-gray-900">{correct} / {total} <span className="text-base font-semibold text-gray-700">({pct}%)</span></p>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[var(--md-primary-blue)] h-2 rounded-full" style={{width:`${pct}%`}} />
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Otázky a odpovede</h2>
        {!loaded ? <p className="text-sm text-gray-600">Načítavam…</p> : (
          <div className="space-y-3">
            {rows.map((q,i)=>(
              <article key={q.id} className={`rounded-xl border p-4 ${q.ok?'border-green-600 bg-green-50':'border-red-600 bg-red-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{i+1}. {q.text}</p>
                  <span className={`badge ${q.ok?'badge-green':'badge-red'}`}>{q.ok?'Správne':'Nesprávne'}</span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-600">Vaša odpoveď</p>
                    <p className="text-sm font-bold text-gray-900">{q.yours ?? <span className="text-gray-500">—</span>}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-600">Správna odpoveď</p>
                    <p className="text-sm font-bold text-gray-900">{q.correct ?? <span className="text-gray-500">—</span>}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
