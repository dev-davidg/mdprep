# Supabase Schema & RLS — MDprep (Step 2)

This folder contains SQL to create the MDprep database schema, helper functions, and Row Level Security policies compatible with Supabase.

## Files
- `001_schema.sql` — Tables, types, constraints.
- `002_functions.sql` — Helper functions (e.g., `is_admin`, `is_moderator`, `has_role`, `is_paid`).
- `003_policies.sql` — RLS enablement and policies (free users limited to 10% of questions deterministically).
- `004_seed_minimal.sql` — Minimal safe, fictional seed (categories + a few sample questions per category).

## How to apply (via Supabase SQL editor)
Run the files in order:
1. `001_schema.sql`
2. `002_functions.sql`
3. `003_policies.sql`
4. `004_seed_minimal.sql` (optional for test data)

> Note: Do **not** load service role keys into the client. All rules depend on `auth.uid()`.
