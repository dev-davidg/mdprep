-- 002_functions.sql
-- Helper role-checking and gating utilities for RLS

create or replace function app.has_role(uid uuid, role text)
returns boolean language sql stable as $$
  select exists (
    select 1 from app.user_roles ur
    where ur.user_id = uid and ur.role_key = role
  );
$$;

create or replace function app.is_admin(uid uuid)
returns boolean language sql stable as $$
  select app.has_role(uid, 'admin');
$$;

create or replace function app.is_moderator(uid uuid)
returns boolean language sql stable as $$
  select app.has_role(uid, 'moderator');
$$;

create or replace function app.is_paid(uid uuid)
returns boolean language sql stable as $$
  select app.has_role(uid, 'paid');
$$;

-- Deterministic 0-99 bucket per (user, question) using md5
create or replace function app.user_question_bucket(uid uuid, qid uuid)
returns int language sql immutable as $$
  select (('x' || substr(md5(uid::text || qid::text), 1, 8))::bit(32)::int % 100);
$$;
