import { supabase } from "./supabase";

export type Category = { id: string; name: string; description?: string | null };
export type Answer = { id: string; text: string; is_correct: boolean; order_index: number };
export type Question = {
  id: string;
  category_id: string;
  text: string;
  explanation: string | null;
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
    .select("id, category_id, text, explanation, answers(id,text,is_correct,order_index)")
    .eq("category_id", categoryId)
    .limit(limit);
  if (error) throw error;
  // Ensure answers sorted A..D
  return (data ?? []).map(q => ({
    ...q,
    answers: (q.answers ?? []).slice().sort((a,b)=> a.order_index - b.order_index)
  })) as Question[];
}

/**
 * Record "seen" for (user, question). This creates the row if missing,
 * and leaves it as-is if it already exists (MVP: we only need presence).
 */
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
  // Join stats -> questions to count rows for this category
  const { data, error } = await supabase!
    .from("user_question_stats")
    .select("question_id, questions!inner(id,category_id)")
    .eq("questions.category_id", categoryId)
    .eq("user_id", userId);
  if (error) throw error;
  return data?.length ?? 0;
}
