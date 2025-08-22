# MDprep — API & Data Access (Step 3)

This doc defines how the frontend communicates with the database using the **Supabase JS client** with **RLS** as the primary security layer. We avoid a custom backend wherever possible. Netlify Functions are reserved for future privileged tasks (e.g., payments webhooks).

## Access Pattern Decision

- **Primary:** Direct from React → Supabase (PostgREST + Realtime) using the anon key. **RLS** enforces data access:
  - Free users: limited to **10%** of the question bank via deterministic bucket policy.
  - Paid/Admin/Moderator: full read; additional privileges where noted.
- **Secondary (future):** Netlify Functions for operations that **must not** run on the client (webhooks, admin imports, batch jobs). Not required for MVP.

## Conventions

- All responses are JSON objects from PostgREST.
- Timestamps are ISO 8601 (`timestamptz`).
- Pagination via `range` (from-to) headers or `.range(from, to)` in Supabase JS.
- Errors surface as JS exceptions or `{ error }` objects from Supabase client.
- All requests require the user to be **authenticated** unless explicitly public.

## Tables & Operations

### 1) Auth & Profiles

- **Get current user profile**
  - **Query**: `profiles` by `user_id = auth.uid()`
  - **Select**:
    ```ts
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, created_at')
      .eq('user_id', user.id)
      .single()
    ```

- **List roles for current user**
  - **Query**: `user_roles` join `app_roles`
    ```ts
    const { data } = await supabase
      .from('user_roles')
      .select('role_key, granted_at')
      .eq('user_id', user.id)
    ```

### 2) Categories

- **List active categories (public)**
  - **Query**: `categories` where `is_active = true` ordered by `sort_index`.
    ```ts
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_index', { ascending: true })
    ```

### 3) Questions (RLS‑gated)

- **Page of questions for Learning/Test**
  - **Query**: `questions` by `category_id`, optional randomness.
  - **Fields**: `id, stem, difficulty, meta, category_id`
  - **Note**: RLS enforces 10% limit for free users.
    ```ts
    const { data } = await supabase
      .from('questions')
      .select('id, stem, difficulty, meta, category_id')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(0, pageSize - 1)
    ```

- **Randomized set for Test Mode**
  - Use `rpc.random_questions(category_id, limit)` (see below) or fetch IDs then shuffle client‑side.
  - MVP path: client shuffle on a pre-fetched page (keeps SQL simple).

### 4) Answers & Explanations

- **Answers for a question**
  - **Query**: `answers` by `question_id`; order by `order_index`.
    ```ts
    const { data } = await supabase
      .from('answers')
      .select('id, body, is_correct, order_index')
      .eq('question_id', qid)
      .order('order_index')
    ```

- **Explanation for a question**
  - **Query**: `explanations` by `question_id`; return newest.
    ```ts
    const { data } = await supabase
      .from('explanations')
      .select('id, body, source_url, created_at')
      .eq('question_id', qid)
      .order('created_at', { ascending: false })
      .limit(1)
    ```

### 5) Sessions & Attempts (Test Mode)

- **Start a session**
  - Insert into `sessions` with `mode = 'test'`, `total_questions`.
    ```ts
    const { data: session } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, mode: 'test', total_questions })
      .select()
      .single()
    ```

- **Record an attempt**
  - Insert per answered question with `elapsed_ms` and correctness.
    ```ts
    await supabase.from('attempts').insert({
      session_id: session.id,
      user_id: user.id,
      question_id,
      selected_answer_id,
      is_correct,
      elapsed_ms
    })
    ```

- **Submit a session**
  - Update `sessions` with `submitted_at`, `correct_count`, `score_fraction`.
    ```ts
    await supabase.from('sessions')
      .update({ submitted_at: new Date().toISOString(), correct_count, score_fraction })
      .eq('id', session.id)
    ```

### 6) User Marks & Stats

- **Toggle flag/hard**
  - Upsert into `user_marks` with `mark_type = 'flag' | 'hard'`.
    ```ts
    await supabase.from('user_marks').upsert({
      user_id: user.id, question_id, mark_type
    }, { onConflict: 'user_id,question_id,mark_type' })
    ```

- **Update seen/correct stats**
  - Increment `seen_count` on view; increment `correct_count` when correct.
    ```ts
    await supabase.rpc('inc_seen', { p_qid: qid })
    await supabase.rpc('inc_correct', { p_qid: qid }) // only when correct
    ```

### 7) Comments (Paid only)

- **List comments for a question** (RLS restricts to paid/admin/mod)
    ```ts
    const { data } = await supabase
      .from('comments')
      .select('id, body, user_id, created_at')
      .eq('question_id', qid)
      .order('created_at', { ascending: true })
    ```

- **Create a comment** (paid users)
    ```ts
    const { data, error } = await supabase
      .from('comments')
      .insert({ question_id: qid, user_id: user.id, body })
      .select()
    ```

## RPC Helpers (SQL functions)

The Step 2 SQL includes these helpers (names shown; see migrations for implementation):

- `app.has_role(uid uuid, role text) returns boolean`
- `app.is_paid(uid uuid) returns boolean`
- `app.user_question_bucket(uid uuid, qid uuid) returns int` — 0..99
- `inc_seen(p_qid uuid)` and `inc_correct(p_qid uuid)` — update `user_question_stats`
- *(optional)* `random_questions(p_category uuid, p_limit int)` — if you choose server-side random selection later

## Auth Scopes

- **Anonymous**: Can fetch **public assets only** (no questions).
- **Authenticated (free)**: Read active categories; **read a gated 10%** of `questions/answers/explanations`; manage own `sessions/attempts/marks/stats`.
- **Paid**: Full read of question bank; **read & create comments**.
- **Moderator/Admin**: Manage content and categories; bypass gating; read all comments.

## Pagination & Query Strategy

- For Learning mode scrolling lists, use `.range(offset, offset + pageSize - 1)` and a stable order (`created_at` or `id`).
- For Test mode, fetch a chunk (e.g., 60) then client-side shuffle and take the first N after applying RLS (already applied by Supabase).

## Error Handling

- Treat `error?.code === '42501'` (insufficient_privilege) as an RLS denial — show a friendly message (e.g., "Upgrade to access more questions").
- Network errors should gracefully fallback to a retry or offline notice (but we do **not** support offline question answering).

## Security Notes

- Never expose `service_role` keys in the frontend.
- All row ownership writes use `auth.uid()` RLS checks — inserts must supply `user_id = auth.uid()`; updates guard `user_id = auth.uid()`.
- Comments reveal **author user_id** per requirements; if displaying profile names, fetch via `profiles` with a JOIN on allowed columns.

---

# Minimal TypeScript Types (optional)

Place these in `src/lib/types.ts` for stronger typing in the app:

```ts
export type UUID = string;

export interface Category {
  id: UUID;
  name: string;
  slug: string;
}

export type Difficulty = 'easy' | 'med' | 'hard';

export interface Question {
  id: UUID;
  category_id: UUID;
  stem: string;
  difficulty: Difficulty;
  meta: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export interface Answer {
  id: UUID;
  question_id: UUID;
  body: string;
  is_correct: boolean;
  order_index: number;
}

export interface Explanation {
  id: UUID;
  question_id: UUID;
  body: string;
  source_url: string | null;
  created_at: string;
}

export interface Comment {
  id: UUID;
  question_id: UUID;
  user_id: UUID;
  body: string;
  created_at: string;
}

export interface Session {
  id: UUID;
  user_id: UUID;
  mode: 'learning' | 'test';
  total_questions: number;
  correct_count: number | null;
  score_fraction: number | null;
  started_at: string;
  submitted_at: string | null;
}
```
---

# Self‑Check (Step 3)

- **Choice justified**: Direct Supabase client with RLS; functions reserved for privileged ops. ✔️
- **Shapes & scopes**: Request/response patterns and auth scopes documented. ✔️
- **Constraints**: No copyrighted content; i18n not implemented; WCAG handled in UI layers. ✔️
- **Reproducible**: Drop‑in doc; TypeScript types optional for immediate use. ✔️

---

# MDprep – Step 3 Status

**What I produced**
- `/docs/api.md` with API strategy, operations, TS usage snippets, RPC helper list, scopes, and security notes.

**Assumptions made**
- Test randomization via client shuffle for MVP simplicity.
- `inc_seen`/`inc_correct` RPCs exist from Step 2 (or will be added alongside policies).

**Open decisions / blockers**
- None blocking. If you prefer **server-side random selection**, we can add `rpc.random_questions` in a tiny follow-up migration.

**Next automatic actions**
- Step 4 — UI/UX scaffolding:
  - Tailwind tokens + shadcn/ui baseline.
  - Screen stubs: Auth, Category picker, Learning, Test config/run, Results/Review, Lists (Flagged/Hard).
  - Accessibility fundamentals.
