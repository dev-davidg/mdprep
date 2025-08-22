# MDprep — User Flows (Step 1)

## Learning Mode

```mermaid
flowchart TD
    A[Open App (PWA)] --> B{Authenticated?}
    B -- No --> C[Sign In / Sign Up (Supabase Auth)]
    C --> D[Select Category]
    B -- Yes --> D[Select Category]
    D --> E[Fetch next question (RLS enforces 10% for free users)]
    E --> F[Show Answers]
    F -->|Choose| G[Check correctness]
    G --> H[Show explanation]
    H --> I{Paid user?}
    I -- Yes --> J[View/Add comments (author ID visible)]
    I -- No --> K[Comments hidden]
    H --> L[Mark as Flag/Hard]
    L --> M[Update user_question_stats]
    M --> N{Continue?}
    N -- Yes --> E
    N -- No --> O[Exit / Back to Category]
```

### Notes
- Each reveal updates `user_question_stats.seen_count` and, on answer, `correct_count`.
- “Flag” and “Hard” bookmarks write to `user_marks`.
- Content is **fictional** and safe. Explanations show after answering.

---

## Test Mode

```mermaid
flowchart TD
    A[Open App] --> B{Authenticated?}
    B -- No --> C[Sign In]
    B -- Yes --> D[Select Category]
    C --> D
    D --> E[Set number of questions]
    E --> F[Start Test Session (create `sessions`)]
    F --> G[For each question: start 90s timer]
    G --> H[User selects answer]
    H --> I[Record attempt; stop timer]
    I --> J{More questions?}
    J -- Yes --> G
    J -- No --> K[Submit]
    K --> L[Compute score; update `sessions`]
    L --> M[Results screen: correct/incorrect highlighted]
    M --> N[Review questions; add marks; (paid) comments]
    N --> O[Exit / Start new]
```

### Timer
- Per-question **90 seconds**. If timer elapses, record as incorrect with `elapsed_ms=90000` and auto-advance.

### Accessibility
- Keyboard reachable controls; visible focus; ARIA labels for radio options; color is **not** the only carrier of meaning (icons/text used as well).

