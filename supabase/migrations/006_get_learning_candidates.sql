-- 006_get_learning_candidates.sql
-- Prefer unseen questions first for learning mode (RLS still applies).

create or replace function public.get_learning_candidates(p_category_id uuid, p_limit int default 1)
returns table (id uuid, stem text) 
language sql
stable
as $$
  select q.id, q.stem
  from public.questions q
  left join public.user_question_stats s
    on s.user_id = auth.uid() and s.question_id = q.id
  where q.category_id = p_category_id
    and q.is_active = true
  order by (s.seen_count is null) desc, coalesce(s.last_seen_at, 'epoch'::timestamptz) asc
  limit p_limit;
$$;
