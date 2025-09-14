import Shell from "@/layouts/Shell";
const AKEY = "md_test_answers";
const correctLetter = (i:number)=> ["A","B","C","D"][(i-1)%4];

export default function Review(){
  const qs = new URLSearchParams(location.search);
  const total = Math.max(1, Number(qs.get("count")||"10"));
  let answers: Record<number,string> = {};
  try{ answers = JSON.parse(localStorage.getItem(AKEY)||"{}"); }catch{}
  const data = Array.from({length: total}, (_,k)=> {
    const id = k+1;
    const yours = answers[id] || null;
    const correct = correctLetter(id);
    return { id, text:`Otázka #${id} – Ukážkový text otázky`, yours, correct };
  });

  const correctCount = data.reduce((n,q)=> n + (q.yours && q.yours===q.correct ? 1 : 0), 0);
  const pct = Math.round(correctCount*100/total);

  return (
    <Shell title="Zobrazenie odpovedí" rightLink={{to:"/results", label:"Späť na prehľad"}}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Výsledok</p>
            <p className="text-2xl font-extrabold text-gray-900">{correctCount} / {total} <span className="text-base font-semibold text-gray-700">({pct}%)</span></p>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[var(--md-primary-blue)] h-2 rounded-full" style={{width:`${pct}%`}} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Otázky a odpovede</h2>
        <div className="space-y-3">
          {data.map(q=>{
            const ok = q.yours && q.yours===q.correct;
            return (
              <article key={q.id} className={`rounded-xl border p-4 ${ok?'border-green-600 bg-green-50':'border-red-600 bg-red-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{q.text}</p>
                  <span className={`badge ${ok?'badge-green':'badge-red'}`}>{ok?'Správne':'Nesprávne'}</span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-600">Vaša odpoveď</p>
                    <p className="text-sm font-bold text-gray-900">{q.yours ?? <span className="text-gray-500">—</span>}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-600">Správna odpoveď</p>
                    <p className="text-sm font-bold text-gray-900">{q.correct}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}
