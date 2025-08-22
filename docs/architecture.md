# MDprep — Architecture (Step 1)

This document shows the high‑level system architecture for the MDprep PWA deployed on Netlify with Supabase.

## System Diagram

```mermaid
flowchart TD
    subgraph Client["User Device (PWA)"]
      A[React + TypeScript<br/>Vite build<br/>Tailwind + shadcn/ui]
      SW[Service Worker<br/>manifest.webmanifest]
    end

    subgraph Hosting["Netlify"]
      N1[Static Assets (HTML/CSS/JS)]
      N2[Redirects / SPA routing]
      N3[Serverless Functions (optional)]
    end

    subgraph Supabase["Supabase"]
      S1[(Postgres DB)]
      S2[Row Level Security (RLS)]
      S3[Auth (email/password + OAuth)]
      S4[Storage (optional later)]
      S5[Realtime (optional later)]
    end

    A <--> SW
    A -->|Fetch| N1
    A -->|Route| N2
    A -->|Direct REST / JS client| S1
    A -->|Auth flows| S3
    A -->|Reads constrained by| S2
    N3 -->|Privileged operations (if needed)| S1
    A -->|Uploads/Assets (future)| S4

    classDef node fill:#0ea5e9,stroke:#0b7285,color:#fff,stroke-width:1px;
    classDef light fill:#bae6fd,stroke:#0ea5e9,color:#083344;
    class A,SW node
    class N1,N2,N3 light
    class S1,S2,S3,S4,S5 light
```

### Notes & Decisions
- **Direct client → Supabase** with RLS is the default access pattern to keep the backend thin. We will add **Netlify Functions** only for cases that require a server context (webhooks, payment callbacks, privileged batch ops).
- **Auth**: Supabase Auth (email/password now; Google/Facebook later when keys exist).
- **Security**: All sensitive rules enforced via **RLS** and Postgres policies. No service role keys in client.
- **PWA**: Installable shell (no offline questions); SW caches shell assets only.
- **i18n**: Code structured for later internationalization; content currently EN-only.
- **Accessibility**: WCAG 2.1 AA where reasonable (focus order, labels, color contrast).

