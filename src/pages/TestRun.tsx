import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";
import QuestionPalette, { PaletteItem } from "../components/QuestionPalette";

interface Answer { id: string; body: string; is_correct: boolean; }
interface Question { id: string; stem: string; answers: Answer[]; }

export default function TestRun() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [pool, setPool] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  // Load pool (persist order in localStorage so user can navigate freely)
  useEffect(() => {
    (async () => {
      const key = `mdprep:testpool:${sessionId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPool(parsed.pool);
        setAnswered(parsed.answered ?? {});
        setFlagged(parsed.flagged ?? {});
        return;
      }
      const { data } = await supabase
        .from("questions")
        .select("*, answers:answers(id, body, is_correct)")
        .limit(50);

      const raw = (data ?? []) as any[];
      // Derive a portable "stem" regardless of actual column name
      const arr: Question[] = raw.map((row) => {
        const stemText =
          (row.stem ??
            row.title ??
            row.question ??
            row.text ??
            row.body ??
            row.content ??
            "Question") as string;
        return {
          id: row.id as string,
          stem: stemText,
          answers: (row.answers ?? []) as Answer[],
        };
      });

      // Shuffle
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      const pick = arr.slice(0, 20); // TODO: read sessions.total_questions
      setPool(pick);
      localStorage.setItem(
        key,
        JSON.stringify({ pool: pick, answered: {}, flagged: {} })
      );
    })();
  }, [sessionId]);

  // Persist on changes
  useEffect(() => {
    const key = `mdprep:testpool:${sessionId}`;
    if (pool.length) {
      localStorage.setItem(key, JSON.stringify({ pool, answered, flagged }));
    }
  }, [pool, answered, flagged, sessionId]);

  const current = pool[idx];
  const palette: PaletteItem[] = pool.map((q, i) => ({
    index: i,
    answered: !!answered[q.id],
    flagged: !!flagged[q.id],
  }));

  async function onSelect(choiceId: string) {
    if (!current) return;
    setAnswered((m) => ({ ...m, [current.id]: choiceId }));
    // Record attempt; no reveal
    const ans = current.answers.find((a) => a.id === choiceId);
    await supabase.from("attempts").insert({
      session_id: sessionId,
      question_id: current.id,
      selected_answer_id: choiceId,
      is_correct: ans?.is_correct ?? false,
      elapsed_ms: 0,
    });
    // Advance to next
    setTimeout(() => setIdx((i) => Math.min(i + 1, pool.length - 1)), 200);
  }

  function skip() {
    setIdx((i) => Math.min(i + 1, pool.length - 1));
  }

  async function toggleFlag() {
    if (!current) return;
    setFlagged((m) => ({ ...m, [current.id]: !m[current.id] }));
    await supabase
      .from("user_marks")
      .insert({ question_id: current.id, mark_type: "flag" });
    setIdx((i) => Math.min(i + 1, pool.length - 1));
  }

  function goto(i: number) {
    setIdx(i);
  }

  return (
    <section className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          Question {idx + 1} / {pool.length}
        </div>
        <Timer durationMs={90000} onExpire={skip} />
      </div>

      {pool.length > 0 ? (
        <>
          <QuestionCard
            stem={current?.stem ?? ""}
            choices={(current?.answers ?? []).map((a) => ({
              id: a.id,
              body: a.body,
            }))}
            selectedId={answered[current?.id ?? ""] ?? null}
            onSelect={onSelect}
            onSubmit={() => {}}
          />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={skip}>
                Skip
              </Button>
              <Button variant="secondary" onClick={toggleFlag}>
                Flag
              </Button>
            </div>
            <Button onClick={() => navigate(`/results/${sessionId}`)}>
              Submit Test
            </Button>
          </div>

          <div className="rounded border p-3">
            <h2 className="mb-2 font-medium">Navigate questions</h2>
            <QuestionPalette items={palette} goto={goto} />
            <div className="mt-2 text-xs text-muted-foreground">
              Answered = filled, Flagged = yellow ring, Unanswered = muted
            </div>
          </div>
        </>
      ) : (
        <p>Loading questions…</p>
      )}
    </section>
  );
}
