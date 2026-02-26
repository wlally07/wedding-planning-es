# Wedding Planning ES

Spain's premier wedding directory — connecting couples with the finest wedding professionals.

## Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Hosting:** Vercel
- **Domain:** weddingplanning.es (GoDaddy)

## Setup

```bash
npm install
npm run dev
```

## Environment Variables
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://timntczlwpcoohbvdqss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Also add these same variables in Vercel project settings.

## Pages
- `/` — Homepage with search + featured listings
- `/search` — Filtered search results
- `/vendor/[slug]` — Public vendor profile
- `/vendor/dashboard` — Vendor profile management
- `/admin` — Admin approval panel
- `/auth` — Login / Register
