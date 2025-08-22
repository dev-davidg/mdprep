# MDprep — ERD (Step 1)

> Logical data model targeting Supabase Postgres. Supabase `auth.users` is shown as an external identity source; application data links via `user_id` (UUID).

```mermaid
erDiagram

    AUTH_USERS ||--o{ PROFILES : "id = user_id"
    PROFILES ||--o{ SESSIONS : "user_id"
    PROFILES ||--o{ ATTEMPTS : "user_id"
    PROFILES ||--o{ USER_MARKS : "user_id"
    PROFILES ||--o{ COMMENTS : "user_id"
    PROFILES ||--o{ SUBSCRIPTIONS : "user_id"
    CATEGORIES ||--o{ QUESTIONS : "category_id"
    QUESTIONS ||--o{ ANSWERS : "question_id"
    QUESTIONS ||--o{ EXPLANATIONS : "question_id"
    QUESTIONS ||--o{ COMMENTS : "question_id"
    QUESTIONS ||--o{ ATTEMPTS : "question_id"
    SESSIONS ||--o{ ATTEMPTS : "session_id"
    QUESTIONS ||--o{ USER_MARKS : "question_id"
    PROFILES ||--o{ USER_QUESTION_STATS : "user_id"
    QUESTIONS ||--o{ USER_QUESTION_STATS : "question_id"
    APP_ROLES ||--o{ USER_ROLES : "role_key"
    PROFILES ||--o{ USER_ROLES : "user_id"

    AUTH_USERS {
      uuid id PK
      text email
      timestamptz created_at
    }

    PROFILES {
      uuid user_id PK
      text display_name
      text avatar_url
      timestamptz created_at
    }

    APP_ROLES {
      text role_key PK  "admin|moderator|free|paid|ambassador"
      text description
    }

    USER_ROLES {
      uuid user_id FK
      text role_key FK
      timestamptz granted_at
      text granted_by
    }

    SUBSCRIPTIONS {
      uuid id PK
      uuid user_id FK
      text provider        "e.g. stripe (future)"
      text plan            "monthly|annual|trial"
      text status          "active|canceled|past_due|none"
      timestamptz current_period_end
      text external_id     "provider customer/sub id"
      timestamptz created_at
    }

    CATEGORIES {
      uuid id PK
      text slug
      text name
      int sort_index
      bool is_active
    }

    QUESTIONS {
      uuid id PK
      uuid category_id FK
      text stem               "question text (fictional only)"
      text difficulty         "easy|med|hard"
      jsonb meta              "tags, source, etc."
      bool is_active
      uuid created_by
      timestamptz created_at
    }

    ANSWERS {
      uuid id PK
      uuid question_id FK
      text body
      bool is_correct
      int order_index
    }

    EXPLANATIONS {
      uuid id PK
      uuid question_id FK
      text body
      text source_url
      uuid created_by
      timestamptz created_at
    }

    COMMENTS {
      uuid id PK
      uuid question_id FK
      uuid user_id FK
      text body
      timestamptz created_at
    }

    SESSIONS {
      uuid id PK
      uuid user_id FK
      text mode              "learning|test"
      int total_questions
      int correct_count
      numeric score_fraction
      timestamptz started_at
      timestamptz submitted_at
    }

    ATTEMPTS {
      uuid id PK
      uuid session_id FK
      uuid user_id FK
      uuid question_id FK
      uuid selected_answer_id
      bool is_correct
      int elapsed_ms
      timestamptz created_at
    }

    USER_MARKS {
      uuid id PK
      uuid user_id FK
      uuid question_id FK
      text mark_type         "flag|hard"
      timestamptz created_at
    }

    USER_QUESTION_STATS {
      uuid id PK
      uuid user_id FK
      uuid question_id FK
      int seen_count
      int correct_count
      timestamptz last_seen_at
    }
```

### Role & Access Notes (for Step 2)
- **Roles**: `app_roles` + `user_roles` enables multiple roles per user (e.g., `paid` and `ambassador`). Admin/moderator used for content ops.
- **Free vs Paid (10% bank)**: Implement via RLS predicate that deterministically gates a subset of `questions` for non-`paid` users (e.g., hash of `user_id` + `question_id` threshold or a server-side sampling view).
- **Comments (paid only)**: Insert/select on `comments` allowed only if user has role `paid`. Author’s `user_id` always returned.
- **No service-role keys** on client; use RLS exclusively, with optional Netlify functions for privileged admin ops (later).

