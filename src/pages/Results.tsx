import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Results() {
  const { sessionId } = useParams();
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("sessions").select("correct_count,total_questions,score_fraction").eq("id", sessionId).maybeSingle();
      if (data) {
        setScore(data.score_fraction ?? (data.total_questions ? data.correct_count / data.total_questions : 0));
      }
    })();
  }, [sessionId]);

  return (
    <div className="max-w-xl mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Results</h1>
      {score == null ? <p>Loading…</p> : <p>Your score: {(score * 100).toFixed(0)}%</p>}
      <p className="text-sm text-muted-foreground">Review coming soon: highlight wrong answers and explanations.</p>
    </div>
  );
}
