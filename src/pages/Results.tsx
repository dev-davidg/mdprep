import { Link } from "react-router-dom";
import Shell from "@/layouts/Shell";

const AKEY = "md_test_answers";
const correctLetter = (i:number)=> ["A","B","C","D"][(i-1)%4];

export default function Results(){
  let answers: Record<number,string> = {};
  try{ answers = JSON.parse(localStorage.getItem(AKEY)||"{}"); }catch{}
  const ids = Object.keys(answers).map(Number).sort((a,b)=>a-b);
  const total = Math.max(ids.length, Number(new URLSearchParams(location.search).get("count")||"10"));
  const correct = Array.from({length: total}, (_,i)=> i+1)
    .reduce((n,i)=> n + (answers[i] && answers[i]===correctLetter(i) ? 1 : 0), 0);
  const pct = Math.round(correct*100/total);

  return (
    <Shell title="Výsledky testu" rightLink={{to:"/mode", label:"Späť na výber"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Skóre</p>
            <p className="text-2xl font-extrabold text-gray-900">{correct} / {total} <span className="text-base font-semibold text-gray-700">({pct}%)</span></p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
              <p className="text-xs text-gray-600">Čas</p>
              <p className="text-sm font-bold text-gray-900">—</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
              <p className="text-xs text-gray-600">Označené</p>
              <p className="text-sm font-bold text-gray-900">—</p>
            </div>
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
      </section>
    </Shell>
  );
}
