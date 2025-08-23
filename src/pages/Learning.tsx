import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import QuestionCard from "../components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Answer { id: string; body: string; is_correct: boolean; }
interface Question { id: string; stem: string; answers: Answer[]; }

export default function Learning() {
  const { categoryId } = useParams();
  const [q, setQ] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [showExpl, setShowExpl] = useState(true);
  const [note, setNote] = useState("");

  // Answers table in your DB uses "text" for the option label; fall back to "body" if present.
  async function fetchAnswers(qid: string) {
    const { data, error } = await supabase
      .from("answers")
      .select("id, is_correct, order_index, text, body")
      .eq("question_id", qid)
      .order("order_index", { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }

    return (data ?? []).map((r: any) => ({
      id: r.id as string,
      body: (r.body ?? r.text ?? "") as string,
      is_correct: !!r.is_correct,
    })) as Answer[];
  }

  async function loadNext() {
    setSelected(null);
    setReveal(false);

    // Try unseen-first RPC (returns only IDs)
    const { data: cand } = await supabase.rpc("get_learning_candidates", {
      p_category_id: categoryId,
      p_limit: 1,
    });

    let nextQ: Question | null = null;

    if (cand && cand.length > 0) {
      const qid = cand[0].id as string;

      // Fetch the question row; derive a displayable stem regardless of column name
      const { data: qrow } = await supabase
        .from("questions")
        .select("*")
        .eq("id", qid)
        .maybeSingle();

      const stemText =
        (qrow?.stem ??
          qrow?.title ??
          qrow?.question ??
          qrow?.text ??
          qrow?.body ??
          qrow?.content ??
          "Question") as string;

      const ans = await fetchAnswers(qid);
      nextQ = { id: qid, stem: stemText, answers: ans };
    } else {
      // Fallback: simple fetch by category
      const { data: rows } = await supabase
        .from("questions")
        .select("*")
        .eq("category_id", categoryId)
        .limit(1);

      if (rows && rows[0]) {
        const qid = rows[0].id as string;
        const stemText =
          (rows[0].stem ??
            rows[0].title ??
            rows[0].question ??
            rows[0].text ??
            rows[0].body ??
            rows[0].content ??
            "Question") as string;
        const ans = await fetchAnswers(qid);
        nextQ = { id: qid, stem: stemText, answers: ans };
      }
    }

    setQ(nextQ);

    // Mark as seen for this user (include user_id for RLS)
    if (nextQ?.id) {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (uid) {
        await supabase
          .from("user_question_stats")
          .upsert(
            { user_id: uid, question_id: nextQ.id, seen_count: 1 },
            { onConflict: "user_id,question_id" }
          );
      }
    }
  }

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  useEffect(() => {
    (async () => {
      if (!selected || !q) return;
      setReveal(true);
      const isCorrect =
        q.answers.find((a) => a.id === selected)?.is_correct ?? false;

      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (uid) {
        await supabase
          .from("user_question_stats")
          .upsert(
            {
              user_id: uid,
              question_id: q.id,
              seen_count: 1,
              correct_count: isCorrect ? 1 : 0,
            },
            { onConflict: "user_id,question_id" }
          );
      }
    })();
  }, [selected, q]);

  async function flag(type: "flag" | "hard") {
    if (!q) return;
    await supabase.from("user_marks").insert({ question_id: q.id, mark_type: type });
  }

  async function saveNote() {
    if (!q || !note.trim()) return;
    await supabase
      .from("user_notes")
      .insert({ question_id: q.id, body: note.trim(), is_private: true });
    setNote("");
  }

  return (
    <section className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Learning</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => flag("flag")}>
            Flag
          </Button>
          <Button variant="secondary" onClick={() => flag("hard")}>
            Mark hard
          </Button>
          <Button variant="ghost" onClick={loadNext} aria-label="Next question">
            Next
          </Button>
        </div>
      </div>

      {!q ? (
        <p>No questions available.</p>
      ) : (
        <QuestionCard
          stem={q.stem}
          choices={q.answers.map((a) => ({ id: a.id, body: a.body }))}
          selectedId={selected}
          onSelect={setSelected}
          onSubmit={() => {}}
        >
          {reveal && (
            <div className="space-y-3">
              <p className="font-medium">
                Correct answer:{" "}
                <span className="text-green-600">
                  {q.answers.find((a) => a.is_correct)?.body}
                </span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExpl((v) => !v)}
                aria-expanded={showExpl}
              >
                {showExpl ? "Hide" : "Show"} explanation
              </Button>
              {showExpl && <Explanation questionId={q.id} />}

              <div className="space-y-2 pt-2">
                <Label htmlFor="note">Private note</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a private note (only you can see it)"
                />
                <div>
                  <Button onClick={saveNote} size="sm">
                    Save note
                  </Button>
                </div>
              </div>

              <PaidComments questionId={q.id} />
            </div>
          )}
        </QuestionCard>
      )}
    </section>
  );
}

function Explanation({ questionId }: { questionId: string }) {
  const [body, setBody] = useState<string>("");
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("explanations")
        .select("body")
        .eq("question_id", questionId)
        .maybeSingle();
      setBody(data?.body ?? "No explanation available.");
    })();
  }, [questionId]);
  return (
    <div
      className="prose prose-sm dark:prose-invert mt-2"
      aria-live="polite"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

function PaidComments({ questionId }: { questionId: string }) {
  const [can, setCan] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [text, setText] = useState("");
  useEffect(() => {
    (async () => {
      // Coarse paid-role check; can be refined to current user if needed
      const { data } = await supabase
        .from("user_roles")
        .select("role_key")
        .eq("role_key", "paid")
        .limit(1);
      setCan((data ?? []).length > 0);
      if ((data ?? []).length > 0) {
        const { data: comments } = await supabase
          .from("comments")
          .select("id, user_id, body, created_at")
          .eq("question_id", questionId)
          .order("created_at", { ascending: true });
        setList(comments ?? []);
      }
    })();
  }, [questionId]);
  async function add() {
    if (!text.trim()) return;
    await supabase
      .from("comments")
      .insert({ question_id: questionId, body: text.trim() });
    setText("");
    const { data: comments } = await supabase
      .from("comments")
      .select("id, user_id, body, created_at")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });
    setList(comments ?? []);
  }
  if (!can) return null;
  return (
    <div className="mt-4">
      <h2 className="font-medium">Public comments</h2>
      <ul className="mt-2 space-y-2">
        {list.map((c) => (
          <li key={c.id} className="rounded border p-2 text-sm">
            <span className="text-muted-foreground">{c.user_id}</span>: {c.body}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a public comment (paid users)"
        />
        <Button onClick={add}>Post</Button>
      </div>
    </div>
  );
}
