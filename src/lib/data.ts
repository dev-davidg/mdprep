import { supabase } from "./supabase";

export type Category = { id: string; name: string; description?: string | null };
export type Answer = { id: string; text: string; is_correct: boolean; order_index: number };
export type Question = {
  id: string;
  category_id: string;
  text: string;
  explanation: string | null;
  explanation_long: string | null;
  answers: Answer[];
};

export const letterFromIndex = (idx: number) => ["A","B","C","D"][Math.max(1,Math.min(4, idx))-1];

export async function listCategories(): Promise<Category[]>{
  const { data, error } = await supabase!
    .from("categories")
    .select("id,name,description")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function countQuestionsByCategory(categoryId: string): Promise<number>{
  const { count, error } = await supabase!
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (error) throw error;
  return count ?? 0;
}

export async function getQuestions(categoryId: string, limit: number): Promise<Question[]>{
  const { data, error } = await supabase!
    .from("questions")
    .select("id, category_id, text, explanation, explanation_long, answers(id,text,is_correct,order_index)")
    .eq("category_id", categoryId)
  .limit(limit);
  if (error) throw error;
  return (data ?? []).map(q => ({
    ...q,
    answers: (q.answers ?? []).slice().sort((a,b)=> a.order_index - b.order_index)
  })) as Question[];
}

/** Record one seen row per (user, question). */
export async function upsertSeen(questionId: string, userId: string){
  const payload = {
    user_id: userId,
    question_id: questionId,
    seen_count: 1,
    correct_count: 0,
    last_seen_at: new Date().toISOString()
  };
  const { error } = await supabase!
    .from("user_question_stats")
    .upsert([payload], { onConflict: "user_id,question_id", ignoreDuplicates: true })
    .select();
  if (error) throw error;
}

export async function countSeenByCategory(categoryId: string, userId: string): Promise<number>{
  const { data, error } = await supabase!
    .from("user_question_stats")
    .select("question_id, questions!inner(id,category_id)")
    .eq("questions.category_id", categoryId)
    .eq("user_id", userId);
  if (error) throw error;
  return data?.length ?? 0;
}

/** Fetch minimal question info by IDs (order is preserved as in ids[]). */
export async function getQuestionsByIds(ids: string[]): Promise<{id:string; text:string}[]>{
  if (!ids.length) return [];
  const { data, error } = await supabase!
    .from("questions")
    .select("id,text")
    .in("id", ids);
  if (error) throw error;
  const map = new Map((data ?? []).map(q => [q.id, q]));
  return ids.map(id => map.get(id)).filter(Boolean) as {id:string; text:string}[];
}

/** Build map question_id -> correct letter (A..D). */
export async function getCorrectMap(ids: string[]): Promise<Record<string,string>>{
  if (!ids.length) return {};
  const { data, error } = await supabase!
    .from("answers")
    .select("question_id, order_index")
    .in("question_id", ids)
    .eq("is_correct", true);
  if (error) throw error;
  const out: Record<string,string> = {};
  for (const row of (data ?? [])) {
    out[row.question_id] = letterFromIndex(row.order_index);
  }
  return out;
}
