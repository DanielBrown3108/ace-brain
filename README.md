# Ace Brain

A Khan-Academy-style site for Dr. Peter Quarshie's *Illustrated Mind Mapping for Anatomy & Physiology*. Free lessons, weekend 1-on-1 tutoring, and a course catalog Peter manages himself.

## Stack (all free tier)

- **Next.js 16** (App Router, React 19, TypeScript, Tailwind 4)
- **Supabase** — Postgres + auth + RLS
- **YouTube unlisted** + **Facebook embed** for lesson videos (no Mux bill)
- **Cal.com** for weekend tutoring bookings (embedded)
- **Vercel** for hosting

## First-time setup

### 1. Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. SQL Editor → paste `supabase/schema.sql` → run.
3. Authentication → Providers → enable **Email** (magic-link is on by default).
4. Project Settings → API → copy the **Project URL** and **anon public** key.

### 2. Local env

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### 4. Make Peter an admin

After Peter signs in once via the magic link on `/login`, run this in the Supabase SQL editor (replace the email):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'peter@example.com');
```

He can now visit `/admin` to add lessons.

### 5. Cal.com (tutoring)

1. Create a free account at [cal.com](https://cal.com), username e.g. `peter-quarshie`.
2. New event type → **Weekend Tutoring** (60 min, slug `weekend-tutoring`).
3. Availability → Saturdays + Sundays only.
4. Apps → connect **Google Calendar** + **Stripe** (for paid sessions).
5. Update `NEXT_PUBLIC_CAL_USERNAME` and `NEXT_PUBLIC_CAL_EVENT_SLUG` in `.env.local` if different.

## Adding lessons (Peter's flow)

1. Sign in at `/login`.
2. Go to `/admin/lessons/new`.
3. Pick the unit, paste the YouTube or Facebook URL, write notes, hit "Publish".

The lesson appears at `/courses/<course>/<unit>/<lesson>`.

## Project structure

```
src/
  app/
    page.tsx                  Landing
    courses/                  Catalog → course → unit → lesson
    tutoring/                 Cal.com booking embed
    book/                     Amazon CTA
    login/                    Magic-link auth
    auth/callback/            OAuth/magic-link callback
    admin/                    Peter's admin panel
  components/
    VideoEmbed.tsx            Renders YouTube or Facebook video
  lib/
    supabase/                 Browser, server, and proxy clients
    types.ts                  Shared types
  proxy.ts                    Refreshes the auth session on every request
                              (formerly middleware.ts; renamed in Next 16)
supabase/
  schema.sql                  Tables + RLS policies + auth trigger
```

## Deploying

1. Push this repo to GitHub.
2. Import into Vercel → set the same env vars.
3. Add your custom domain (once Peter confirms it).

## Roadmap

- [ ] Per-lesson "mark complete" + student progress dashboard
- [ ] Quiz blocks under each lesson
- [ ] Comments / Q&A
- [ ] Cal.com webhook → store bookings in Supabase
- [ ] Resend for transactional email
- [ ] Mind-map gallery (PDF/PNG uploads to Supabase Storage)
