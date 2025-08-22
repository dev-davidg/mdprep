# MDprep (MVP)

## Quick start
```bash
cd app
cp .env.example .env
# paste your Supabase anon key into .env
npm install
npm run dev
# or build
npm run build
npm run preview
```

## Deploy (Netlify)
- Build command: `npm run build`
- Publish directory: `mdprep/app/dist`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

VITE
