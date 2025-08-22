-- 001_schema.sql
-- MDprep base schema for Supabase
-- Safe to run multiple times (idempotent-ish): uses IF NOT EXISTS where possible.

create extension if not exists pgcrypto;

-- Namespaces
create schema if not exists app;
create schema if not exists content;

-- Reference: auth.users exists in Supabase

-- Profiles (1-1 with auth.users)
create table if not exists app.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Roles
create table if not exists app.app_roles (
  role_key text primary key,
  description text
);

insert into app.app_roles(role_key, description) values
  ('admin', 'Administrator'),
  ('moderator', 'Moderator'),
  ('free', 'Free user'),
  ('paid', 'Paid subscriber'),
  ('ambassador', 'Ambassador contributor')
on conflict (role_key) do nothing;

create table if not exists app.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null references app.app_roles(role_key) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by text,
  primary key (user_id, role_key)
);

-- Subscriptions (stub)
create table if not exists app.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text,           -- e.g., stripe
  plan text,               -- monthly|annual|trial
  status text,             -- active|canceled|past_due|none
  current_period_end timestamptz,
  external_id text,
  created_at timestamptz not null default now()
);

-- Categories
create table if not exists content.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  sort_index int default 0,
  is_active boolean not null default true
);

-- Questions
create table if not exists content.questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references content.categories(id) on delete cascade,
  stem text not null, -- fictional question text
  difficulty text check (difficulty in ('easy','med','hard')) default 'med',
  meta jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Answers (multiple-choice)
create table if not exists content.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references content.questions(id) on delete cascade,
  body text not null,
  is_correct boolean not null default false,
  order_index int not null default 0
);

-- Explanations
create table if not exists content.explanations (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references content.questions(id) on delete cascade,
  body text not null, -- Markdown allowed
  source_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Comments (paid users only via policies)
create table if not exists content.comments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references content.questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Sessions (test/learning runs)
create table if not exists app.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('learning','test')),
  total_questions int check (total_questions >= 0),
  correct_count int default 0,
  score_fraction numeric,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

-- Attempts (per question in a session)
create table if not exists app.attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references app.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references content.questions(id) on delete cascade,
  selected_answer_id uuid references content.answers(id),
  is_correct boolean,
  elapsed_ms int, -- 90s -> 90000 if timeout
  created_at timestamptz not null default now()
);

-- User Marks (flags & hard list)
create table if not exists app.user_marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references content.questions(id) on delete cascade,
  mark_type text not null check (mark_type in ('flag','hard')),
  created_at timestamptz not null default now(),
  unique (user_id, question_id, mark_type)
);

-- User question stats (seen/correct counters)
create table if not exists app.user_question_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references content.questions(id) on delete cascade,
  seen_count int not null default 0,
  correct_count int not null default 0,
  last_seen_at timestamptz,
  unique (user_id, question_id)
);
