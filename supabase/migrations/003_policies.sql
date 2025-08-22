-- 003_policies.sql
-- Enable and define Row Level Security policies

-- Enable RLS
alter table app.profiles enable row level security;
alter table app.app_roles enable row level security;
alter table app.user_roles enable row level security;
alter table app.subscriptions enable row level security;
alter table content.categories enable row level security;
alter table content.questions enable row level security;
alter table content.answers enable row level security;
alter table content.explanations enable row level security;
alter table content.comments enable row level security;
alter table app.sessions enable row level security;
alter table app.attempts enable row level security;
alter table app.user_marks enable row level security;
alter table app.user_question_stats enable row level security;

-- Basic profiles: users can read their own profile; admins can read all; users can upsert their own
drop policy if exists "select own profile" on app.profiles;
create policy "select own profile" on app.profiles
for select using (user_id = auth.uid() or app.is_admin(auth.uid()));

drop policy if exists "upsert own profile" on app.profiles;
create policy "upsert own profile" on app.profiles
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Roles tables: readable by admins/moderators; own roles readable by user; only admins manage
drop policy if exists "select own roles or admin" on app.user_roles;
create policy "select own roles or admin" on app.user_roles
for select using (user_id = auth.uid() or app.is_admin(auth.uid()) or app.is_moderator(auth.uid()));

drop policy if exists "admin manage roles" on app.user_roles;
create policy "admin manage roles" on app.user_roles
for all using (app.is_admin(auth.uid())) with check (app.is_admin(auth.uid()));

drop policy if exists "select app roles" on app.app_roles;
create policy "select app roles" on app.app_roles
for select using (true);

-- Subscriptions: user can see own; admins all
drop policy if exists "select own subscriptions or admin" on app.subscriptions;
create policy "select own subscriptions or admin" on app.subscriptions
for select using (user_id = auth.uid() or app.is_admin(auth.uid()));

drop policy if exists "insert own subscription" on app.subscriptions;
create policy "insert own subscription" on app.subscriptions
for insert with check (user_id = auth.uid() or app.is_admin(auth.uid()));

-- Categories: readable by all authenticated; admin manage
drop policy if exists "select categories" on content.categories;
create policy "select categories" on content.categories
for select using (is_active);

drop policy if exists "admin manage categories" on content.categories;
create policy "admin manage categories" on content.categories
for all using (app.is_admin(auth.uid())) with check (app.is_admin(auth.uid()));

-- Questions: free users see 10% via bucket; paid & admins see all
drop policy if exists "select questions with gating" on content.questions;
create policy "select questions with gating" on content.questions
for select using (
  is_active AND (
    app.is_paid(auth.uid())
    OR app.is_admin(auth.uid())
    OR app.user_question_bucket(auth.uid(), id) < 10  -- 10% bank for free users
  )
);

drop policy if exists "admin manage questions" on content.questions;
create policy "admin manage questions" on content.questions
for all using (app.is_admin(auth.uid()) or app.is_moderator(auth.uid()))
with check (app.is_admin(auth.uid()) or app.is_moderator(auth.uid()));

-- Answers: readable if parent question is readable; admin manage
drop policy if exists "select answers via parent" on content.answers;
create policy "select answers via parent" on content.answers
for select using (
  exists (select 1 from content.questions q
          where q.id = question_id
            and q.is_active
            and (
              app.is_paid(auth.uid())
              OR app.is_admin(auth.uid())
              OR app.user_question_bucket(auth.uid(), q.id) < 10
            ))
);

drop policy if exists "admin manage answers" on content.answers;
create policy "admin manage answers" on content.answers
for all using (app.is_admin(auth.uid()) or app.is_moderator(auth.uid()))
with check (app.is_admin(auth.uid()) or app.is_moderator(auth.uid()));

-- Explanations: readable if parent question readable; admin/mod create
drop policy if exists "select explanations via parent" on content.explanations;
create policy "select explanations via parent" on content.explanations
for select using (
  exists (select 1 from content.questions q
          where q.id = question_id
            and q.is_active
            and (
              app.is_paid(auth.uid())
              OR app.is_admin(auth.uid())
              OR app.user_question_bucket(auth.uid(), q.id) < 10
            ))
);

drop policy if exists "admin/mod manage explanations" on content.explanations;
create policy "admin/mod manage explanations" on content.explanations
for all using (app.is_admin(auth.uid()) or app.is_moderator(auth.uid()))
with check (app.is_admin(auth.uid()) or app.is_moderator(auth.uid()));

-- Comments: visible & creatable to PAID (and admins/mods)
drop policy if exists "paid select comments" on content.comments;
create policy "paid select comments" on content.comments
for select using (app.is_paid(auth.uid()) or app.is_admin(auth.uid()) or app.is_moderator(auth.uid()));

drop policy if exists "paid insert comments" on content.comments;
create policy "paid insert comments" on content.comments
for insert with check (
  (user_id = auth.uid()) and (app.is_paid(auth.uid()) or app.is_admin(auth.uid()) or app.is_moderator(auth.uid()))
);

-- Sessions: user owns their sessions
drop policy if exists "select own sessions" on app.sessions;
create policy "select own sessions" on app.sessions
for select using (user_id = auth.uid() or app.is_admin(auth.uid()));

drop policy if exists "insert own sessions" on app.sessions;
create policy "insert own sessions" on app.sessions
for insert with check (user_id = auth.uid() or app.is_admin(auth.uid()));

drop policy if exists "update own sessions" on app.sessions;
create policy "update own sessions" on app.sessions
for update using (user_id = auth.uid() or app.is_admin(auth.uid()))
with check (user_id = auth.uid() or app.is_admin(auth.uid()));

-- Attempts: user owns their attempts
drop policy if exists "select own attempts" on app.attempts;
create policy "select own attempts" on app.attempts
for select using (user_id = auth.uid() or app.is_admin(auth.uid()));

drop policy if exists "insert own attempts" on app.attempts;
create policy "insert own attempts" on app.attempts
for insert with check (user_id = auth.uid() or app.is_admin(auth.uid()));

-- User marks
drop policy if exists "select own marks" on app.user_marks;
create policy "select own marks" on app.user_marks
for select using (user_id = auth.uid());

drop policy if exists "upsert own marks" on app.user_marks;
create policy "upsert own marks" on app.user_marks
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- User question stats
drop policy if exists "select own stats" on app.user_question_stats;
create policy "select own stats" on app.user_question_stats
for select using (user_id = auth.uid());

drop policy if exists "upsert own stats" on app.user_question_stats;
create policy "upsert own stats" on app.user_question_stats
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
