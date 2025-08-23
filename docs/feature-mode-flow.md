# Feature: Subject → Mode Flow, Unified Q&A, Palette, Notes

This change implements:
- Subject first, then **ModePicker** (Learning/Test).
- Unified Q&A UI; **Learning** reveals correct answer instantly; **Test** hides and auto-advances.
- **Test**: skip, flag, and **question palette** to jump; answered/flagged indicators.
- **Seen/unseen** tracking via `user_question_stats` (Learning prefers unseen first).
- **Private notes** per question; **public comments** remain paid-only.

## DB
- Migration `005_user_notes.sql` creates `user_notes` with strict RLS (owner-only).
- Migration `006_get_learning_candidates.sql` adds RPC to prefer unseen (RLS applies).

## UI
- `CategoryPicker` → `/subject/:id` ModePicker.
- `Learning` updates: instant reveal, explanation toggle, flag/hard, private note, paid comments.
- `TestRun` updates: auto-advance on selection, skip, flag, palette, localStorage persistence.

## Follow-ups
- Persist test pool server-side (session meta) if we want cross-device continuity.
