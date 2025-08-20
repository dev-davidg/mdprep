import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function ResultsReview() {
  const nav = useNavigate();
  const { state } = useLocation() as any;
  if (!state) return <main className="p-6 max-w-3xl mx-auto">No results… <Link to="/" className="underline text-blue-600">Back</Link></main>;
  const { summary, score, total } = state;
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Results</h1>
      <div className="mb-4">Score: <strong>{score}</strong> / {total}</div>
      <ul className="space-y-3">
        {summary.map((s:any, i:number) => (
          <li key={i} className={`p-3 rounded border ${s.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="font-medium">{s.stem}</div>
            <div>Your answer: {s.chosen ?? '—'}</div>
            {!s.isCorrect && <div>Correct answer: <strong>{s.correct ?? '—'}</strong></div>}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <Link to="/" className="px-3 py-2 rounded border">Back to categories</Link>
        <button onClick={()=>nav(-1)} className="px-3 py-2 rounded border">Back</button>
      </div>
    </main>
  );
}