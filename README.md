# MDprep

Progressive Web App for medical exam prep. Clean React + TS + Vite stack, Supabase backend, Netlify hosting, and basic PWA.

---

## Live & Status

* **Production:** *Netlify-linked; auto‑deploys on push to `main`.*
* **CI/CD:** Netlify Build (Publish dir: `dist`, Build: `npm run build`).

---

## Tech Stack

* **Frontend:** React + TypeScript (Vite), Tailwind CSS, shadcn/ui
* **Backend:** Supabase (Auth, Postgres, Storage)
* **Hosting:** Netlify (with `netlify.toml`)
* **PWA:** Manifest + Service Worker (runtime caching)

---

## Requirements

* Node **20+** (`node -v`)
* Supabase project (URL + anon key)

---

## Environment Variables

Set these **in Netlify** (and locally in a `.env` if needed):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

> Vite only exposes variables starting with `VITE_`. Legacy `NEXT_PUBLIC_*` are ignored by Vite.

---

## Getting Started (Local)

```bash
# install deps
npm install

# run dev server
npm run dev

# production build
npm run build

# preview the production build locally
npm run preview
```

Open the printed local URL (typically `http://localhost:5173`).

---

## Project Structure

```
public/
  _headers                 # security & caching headers (copied to dist)
  manifest.webmanifest     # PWA manifest
  service-worker.js        # runtime caching SW
  icons/
    icon-192.svg
    icon-512.svg
src/
  ...                      # app source code
netlify.toml               # build config + SPA redirect
README.md
```

---

## PWA Notes

* SW registers on page load (`/service-worker.js`).
* Runtime caching only (network-first for same-origin GETs, fallback to cache).
* Manifest linked in `index.html`; basic icons included.
* For hard refresh after SW updates: DevTools → Application → Service Workers → Unregister → Reload.

---

## Deploy (Netlify)
<<<<<<< HEAD
- Build command: `npm run build`
- Publish directory: `mdprep/app/dist`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
=======

* Repo is linked; **push to `main`** → Netlify auto‑builds and deploys.
* Build command: `npm run build`
* Publish directory: `dist`
* SPA redirect handled by `netlify.toml`.

**Environment vars in Netlify:**

* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_ANON_KEY`

---

## Smoke Test Checklist

1. App loads (no blank screen).
2. Auth screen works (sign up/sign in).
3. Category picker shows Math / Biology / Physics.
4. Learning mode: open a question, see explanation; can flag/hard.
5. Test mode: pick N questions, timer 90s/Q, submit → results with wrong answers highlighted.

---

## Troubleshooting

* **Blank page:** Check browser Console. Usually missing `VITE_SUPABASE_*` vars.
* **Deep link 404:** Ensure `[[redirects]]` in `netlify.toml` points `/*` → `/index.html`.
* **Build fails (cannot find `package.json`):** Ensure app files are at repo root (not in a subfolder).
* **CSP issues:** Update `public/_headers` if loading fonts/scripts from new domains.

---

## Contributing (Internal)

* Branch from `main`: `feature/<short-name>`
* Commit style: conventional-ish (`feat: ...`, `fix: ...`, `chore: ...`)
* Open PR → Netlify preview → 1 approval → squash & merge
* Keep secrets out of git; use Netlify env vars.

---

## License

Internal project. All question content must be **fictional** for MVP.
>>>>>>> 07d7ed9 (docs: update README)
