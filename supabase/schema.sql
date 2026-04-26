-- Quarshie Academy initial schema.
-- Paste into Supabase SQL editor (or run via supabase CLI).

create extension if not exists "pgcrypto";

-- Profiles mirror auth.users so we can attach role + display name.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cover_image_url text,
  position int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  position int not null default 0,
  unique (course_id, slug)
);

-- A lesson holds either a YouTube video or a Facebook video URL,
-- plus rich-text notes. The frontend picks the right embed.
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  video_source text not null check (video_source in ('youtube','facebook','none')),
  video_url text,
  notes_html text,
  position int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (unit_id, slug)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Bookings are written by a webhook from Cal.com after a paid slot is confirmed.
create table if not exists public.tutoring_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  student_email text not null,
  student_name text,
  scheduled_for timestamptz not null,
  duration_minutes int not null default 60,
  meeting_url text,
  cal_booking_id text unique,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','completed')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-level security.
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.tutoring_bookings enable row level security;

-- SECURITY DEFINER helper to check admin status without re-triggering RLS
-- on the profiles table (which would cause infinite recursion).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "courses readable" on public.courses;
drop policy if exists "units readable" on public.units;
drop policy if exists "lessons readable" on public.lessons;
drop policy if exists "admin writes courses" on public.courses;
drop policy if exists "admin writes units" on public.units;
drop policy if exists "admin writes lessons" on public.lessons;
drop policy if exists "own profile read" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "own progress read" on public.lesson_progress;
drop policy if exists "own progress write" on public.lesson_progress;
drop policy if exists "own progress delete" on public.lesson_progress;
drop policy if exists "own bookings read" on public.tutoring_bookings;

-- Anyone (including anon) can read published catalog content.
create policy "courses readable" on public.courses
  for select using (published or public.is_admin());

create policy "units readable" on public.units
  for select using (exists (
    select 1 from public.courses c
    where c.id = units.course_id and (c.published or public.is_admin())
  ));

create policy "lessons readable" on public.lessons
  for select using (published or public.is_admin());

-- Only admins can write catalog rows.
create policy "admin writes courses" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin writes units" on public.units
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin writes lessons" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: a user reads/updates their own row; admins read all.
create policy "own profile read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles
  for update using (id = auth.uid());

-- Progress: a user reads/writes only their own rows.
create policy "own progress read" on public.lesson_progress
  for select using (user_id = auth.uid());
create policy "own progress write" on public.lesson_progress
  for insert with check (user_id = auth.uid());
create policy "own progress delete" on public.lesson_progress
  for delete using (user_id = auth.uid());

-- Bookings: a user reads bookings tied to their email; admins read all.
-- Inserts come from a service-role webhook, so no insert policy needed.
create policy "own bookings read" on public.tutoring_bookings
  for select using (
    user_id = auth.uid()
    or student_email = (select email from auth.users where id = auth.uid())
    or public.is_admin()
  );

-- ===========================================================================
-- Quiz questions (multiple choice, attached to a lesson).
-- ===========================================================================
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  position int not null default 0,
  prompt text not null,
  explanation text,
  created_at timestamptz not null default now()
);

-- Add type + answer_key for short-answer questions (additive migration).
alter table public.quiz_questions
  add column if not exists question_type text not null default 'multiple_choice';

do $$ begin
  alter table public.quiz_questions
    add constraint quiz_questions_type_check
    check (question_type in ('multiple_choice', 'short_answer'));
exception when duplicate_object then null;
end $$;

alter table public.quiz_questions
  add column if not exists answer_key text;

create table if not exists public.quiz_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  position int not null default 0,
  body text not null,
  is_correct boolean not null default false
);

alter table public.quiz_questions enable row level security;
alter table public.quiz_choices enable row level security;

drop policy if exists "questions readable" on public.quiz_questions;
drop policy if exists "choices readable" on public.quiz_choices;
drop policy if exists "admin writes questions" on public.quiz_questions;
drop policy if exists "admin writes choices" on public.quiz_choices;

-- Anyone can read questions/choices for a published lesson; admins can read all.
create policy "questions readable" on public.quiz_questions
  for select using (
    exists (
      select 1 from public.lessons l
      where l.id = quiz_questions.lesson_id
      and (l.published or public.is_admin())
    )
  );

create policy "choices readable" on public.quiz_choices
  for select using (
    exists (
      select 1 from public.quiz_questions q
      join public.lessons l on l.id = q.lesson_id
      where q.id = quiz_choices.question_id
      and (l.published or public.is_admin())
    )
  );

create policy "admin writes questions" on public.quiz_questions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin writes choices" on public.quiz_choices
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- Lesson discussion / Q&A
-- ===========================================================================
create table if not exists public.lesson_comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists lesson_comments_lesson_id_idx
  on public.lesson_comments(lesson_id, created_at desc);

alter table public.lesson_comments enable row level security;

drop policy if exists "comments readable" on public.lesson_comments;
drop policy if exists "comments insert own" on public.lesson_comments;
drop policy if exists "comments update own or admin" on public.lesson_comments;
drop policy if exists "comments delete own or admin" on public.lesson_comments;

-- Anyone can read comments on a published lesson; admins can read all.
create policy "comments readable" on public.lesson_comments
  for select using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_comments.lesson_id
      and (l.published or public.is_admin())
    )
  );

-- Signed-in users can comment as themselves.
create policy "comments insert own" on public.lesson_comments
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lessons l where l.id = lesson_comments.lesson_id and l.published
    )
  );

-- Authors can edit their own; admins can edit anything (e.g. to pin).
create policy "comments update own or admin" on public.lesson_comments
  for update using (user_id = auth.uid() or public.is_admin());

-- Authors can delete their own; admins can delete any.
create policy "comments delete own or admin" on public.lesson_comments
  for delete using (user_id = auth.uid() or public.is_admin());

-- ===========================================================================
-- Storage bucket for course cover images.
-- Public read so the browser can render covers without auth; admin-only
-- write so randos can't overwrite Peter's catalog art.
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('course-covers', 'course-covers', true)
on conflict (id) do nothing;

drop policy if exists "course covers public read" on storage.objects;
drop policy if exists "admin uploads course covers" on storage.objects;
drop policy if exists "admin updates course covers" on storage.objects;
drop policy if exists "admin deletes course covers" on storage.objects;

create policy "course covers public read" on storage.objects
  for select using (bucket_id = 'course-covers');

create policy "admin uploads course covers" on storage.objects
  for insert with check (bucket_id = 'course-covers' and public.is_admin());

create policy "admin updates course covers" on storage.objects
  for update using (bucket_id = 'course-covers' and public.is_admin())
  with check (bucket_id = 'course-covers' and public.is_admin());

create policy "admin deletes course covers" on storage.objects
  for delete using (bucket_id = 'course-covers' and public.is_admin());
