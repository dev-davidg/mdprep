-- 004_seed_minimal.sql
-- Minimal, safe fictional seed for local testing

-- Categories
insert into content.categories (slug, name, sort_index) values
  ('math', 'Mathematics', 1),
  ('bio', 'Biology', 2),
  ('phys', 'Physics', 3)
on conflict (slug) do nothing;

-- A couple of questions per category (fictional)
-- MATH Q1
with q as (
  insert into content.questions (category_id, stem, difficulty, meta)
  select id, 'What is the derivative of f(x)=x^2?', 'easy', '{"topic":"calculus"}'::jsonb
  from content.categories where slug='math'
  returning id
)
insert into content.answers (question_id, body, is_correct, order_index)
select q.id, a.body, a.is_correct, a.ord
from q
cross join (values
  ('2x', true, 1),
  ('x', false, 2),
  ('x^3', false, 3),
  ('1', false, 4)
) as a(body, is_correct, ord);

insert into content.explanations (question_id, body)
select id, 'Using power rule: d/dx (x²) = 2x.' from content.questions
where stem='What is the derivative of f(x)=x^2?' limit 1;

-- BIO Q1
with q as (
  insert into content.questions (category_id, stem, difficulty, meta)
  select id, 'Which organelle is the powerhouse of the cell?', 'easy', '{"topic":"cell"}'::jsonb
  from content.categories where slug='bio'
  returning id
)
insert into content.answers (question_id, body, is_correct, order_index)
select q.id, a.body, a.is_correct, a.ord
from q
cross join (values
  ('Mitochondrion', true, 1),
  ('Ribosome', false, 2),
  ('Golgi apparatus', false, 3),
  ('Lysosome', false, 4)
) as a(body, is_correct, ord);

insert into content.explanations (question_id, body)
select id, 'Mitochondria generate ATP via oxidative phosphorylation.' from content.questions
where stem='Which organelle is the powerhouse of the cell?' limit 1;

-- PHYS Q1
with q as (
  insert into content.questions (category_id, stem, difficulty, meta)
  select id, 'A car accelerates uniformly from rest to 20 m/s in 5 s. What is its acceleration?', 'easy', '{"topic":"kinematics"}'::jsonb
  from content.categories where slug='phys'
  returning id
)
insert into content.answers (question_id, body, is_correct, order_index)
select q.id, a.body, a.is_correct, a.ord
from q
cross join (values
  ('4 m/s^2', true, 1),
  ('2 m/s^2', false, 2),
  ('5 m/s^2', false, 3),
  ('10 m/s^2', false, 4)
) as a(body, is_correct, ord);

insert into content.explanations (question_id, body)
select id, 'a = Δv/Δt = 20/5 = 4 m/s².', from content.questions
where stem='A car accelerates uniformly from rest to 20 m/s in 5 s. What is its acceleration?' limit 1;
