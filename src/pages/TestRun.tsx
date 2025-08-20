// src/pages/TestRun.tsx
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { formatTime } from '../utils';

type Answer = { id: string; text: string; is_correct: boolean; order_index: number };
type Question = { id: string; text: string; answers: Answer[] };

const PER_QUESTION_SECONDS = 90;

export default function TestRun() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const count = Math.max(1, parseInt(params.get('count') || '5', 10));
  const categorySlug = params.get('category'); // optional: e.g. mathematics
  const categoryName = useMemo(() => {
    if (!categorySlug) return null;
    return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  }, [categorySlug]);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string | null>>({});
  const [remaining, setRemaining] = useState(PER_QUESTION_SECONDS);

  // Per-question timer
  useEffect(() => {
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [index]);

  // Auto-advance when timer hits zero
  useEffect(() => {
    if (remaining === 0) handleNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // Load questions (client-side shuffle)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // If category filter is present, look up its id first
        let categoryId: string | null = null;
        if (categoryName) {
          const { data: cats, error: catErr } = await supabase
            .from('categories')
            .select('id,name')
            .eq('name', categoryName)
            .limit(1);
          if (catErr) throw catErr;
          categoryId = cats?.[0]?.id ?? null;
        }

        const base = supabase
          .from('questions')
          .select('id,text,answers(id,text,is_correct,order_index),created_at');

        const { data, error } = categoryId
          ? await base.eq('category_id', categoryId).order('created_at', { ascending: true })
          : await base.order('created_at', { ascending: true });

        if (error) throw error;

        // Client-side shuffle & take N
        const shuffled = (data ?? [])
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
          .map((q: any) => ({
            id: q.id,
            text: q.text,
            answers: (q.answers ?? []).sort((a: Answer, b: Answer) => a.order_index - b.order_index),
          }));

        setQuestions(shuffled);
        setIndex(0);
        setRemaining(PER_QUESTION_SECONDS);
      } catch (e) {
        console.error(e);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, categoryName]);

  const current = questions[index];

  const totalTime = count * PER_QUESTION_SECONDS;
  const used = index * PER_QUESTION_SECONDS + (PER_QUESTION_SECONDS - remaining);
  const leftAll = Math.max(0, totalTime - used);

  function handleChoose(aid: string) {
    if (!current) return;
    setSelected((s) => ({ ...s, [current.id]: aid }));
  }

  function handleNext() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setRemaining(PER_QUESTION_SECONDS);
    } else {
      finish();
    }
  }

  function finish() {
    const summary = questions.map((q) => {
      const choiceId = selected[q.id];
      const chosen = q.answers.find((a) => a.id === choiceId) || null;
      const correct = q.answers.find((a) => a.is_correct) || null;
      const isCorrect = !!(chosen && correct && chosen.id === correct.id);
      return { qid: q.id, stem: q.text, chosen: chosen?.text || null, correct: correct?.text || null, isCorrect };
    });
    const score = summary.filter((s) => s.isCorrect).length;
    navigate('/results', { state: { summary, score, total: questions.length } });
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm">Question {Math.min(index + 1, questions.length)} / {questions.length || count}</div>
        <div className="text-sm" aria-live="polite">
          Time left: {formatTime(remaining)} (Total: {formatTime(leftAll)})
        </div>
      </div>

      {loading && <div>Loading questions…</div>}

      {!loading && questions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
          No questions available for this selection. Add more in Supabase, then try again.
        </div>
      )}

      {!loading && current && (
        <article className="bg-white rounded-xl shadow p-4">
          <h1 className="text-lg font-semibold mb-3">{current.text}</h1>
          <div className="space-y-2">
            {current.answers.map((a) => (
              <label key={a.id} className="block border rounded p-2 cursor-pointer hover:bg-gray-50">
                <input
                  className="mr-2"
                  type="radio"
                  name={`q-${current.id}`}
                  checked={selected[current.id] === a.id}
                  onChange={() => handleChoose(a.id)}
                />
                {a.text}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleNext} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {index === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </article>
      )}
    </main>
  );
}
