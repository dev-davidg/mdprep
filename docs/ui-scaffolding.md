# UI/UX Scaffolding (Step 4)

This commit adds screen stubs and shared components using Tailwind + shadcn/ui.

## Screens
- **Auth** — email/password sign-in and signup
- **CategoryPicker** — grid of active categories (Learning/Test actions)
- **Learning** — single-question view with submit + explanation reveal
- **TestConfig** — choose number of questions; creates session
- **TestRun** — per-question 90s timer; records attempts; skip
- **Results** — shows score; placeholder for detailed review
- **Lists** — shows user's Flagged/Hard items

## Components
- **Header** — nav + auth state
- **QuestionCard** — accessible answer radio list
- **Timer** — RAF-based countdown with ARIA

## Notes
- RLS in Supabase enforces the 10% free bank. Client fetches are simple.
- Accessibility: labeled inputs, keyboardable radios, ARIA roles, visible focus.
- To wire into your app shell, import `AppRouter` in `main.tsx` and render it.

