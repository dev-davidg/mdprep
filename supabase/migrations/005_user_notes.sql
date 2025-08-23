-- 005_user_notes.sql
-- Adds per-user private notes on questions

create table if not exists public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  body text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_notes_user_id_idx on public.user_notes(user_id);
create index if not exists user_notes_question_id_idx on public.user_notes(question_id);

alter table public.user_notes enable row level security;

-- RLS: only owner can select/insert/update/delete their notes
drop policy if exists "notes select own" on public.user_notes;
create policy "notes select own"
  on public.user_notes for select
  using (auth.uid() = user_id);

drop policy if exists "notes write own" on public.user_notes;
create policy "notes write own"
  on public.user_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Update trigger for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_user_notes_updated on public.user_notes;
create trigger trg_user_notes_updated
before update on public.user_notes
for each row execute procedure public.set_updated_at();
