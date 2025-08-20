import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import supabase from '../supabaseClient';

type Answer = { id: string; text: string; is_correct: boolean; order_index: number };
type Question = { id: string; text: string; answers: Answer[]; explanations?: { content: string }[] };

export default function Learning() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const categorySlug = params.get('category') ?? 'mathematics';
  const categoryName = useMemo(()=>categorySlug.charAt(0).toUpperCase()+categorySlug.slice(1),[categorySlug]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: cats, error: catErr } = await supabase
          .from('categories').select('id,name').eq('name', categoryName).limit(1);
        if (catErr) throw catErr;
        const categoryId = cats?.[0]?.id;
        if (!categoryId) throw new Error('Category not found');

        const { data, error } = await supabase
          .from('questions')
          .select('id,text,answers(id,text,is_correct,order_index),explanations(content)')
          .eq('category_id', categoryId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        setQuestions(data || []);
      } catch (e:any) {
        setError(e.message || 'Failed to load questions.');
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryName]);

  const current = questions[index];

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <Link to="/" className="text-blue-600 underline">← Categories</Link>
        <div className="text-sm text-gray-600">{categoryName} — Learning mode</div>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && current && (
        <article className="bg-white rounded-xl shadow p-4">
          <h1 className="text-lg font-semibold mb-2">{current.text}</h1>
          <ol className="list-decimal ml-6 space-y-1">
            {current.answers?.sort((a,b)=>a.order_index-b.order_index).map(a=>(
              <li key={a.id}>{a.text}</li>
            ))}
          </ol>
          {current.explanations && current.explanations.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-primary underline">Explanation</summary>
              <div className="mt-2 text-gray-700 whitespace-pre-line">
                {current.explanations[0].content}
              </div>
            </details>
          )}
          <div className="flex gap-2 mt-4">
            <button disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}
                    className="px-3 py-2 rounded border bg-gray-100 disabled:opacity-50">Previous</button>
            <button disabled={index===questions.length-1} onClick={()=>setIndex(i=>Math.min(questions.length-1,i+1))}
                    className="px-3 py-2 rounded border bg-gray-100 disabled:opacity-50">Next</button>
          </div>
        </article>
      )}
    </main>
  );
}