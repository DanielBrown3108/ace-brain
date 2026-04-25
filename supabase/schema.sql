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

-- Anyone (including anon) can read published catalog content.
create policy "courses readable" on public.courses
  for select using (published or auth.role() = 'authenticated' and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "units readable" on public.units
  for select using (exists (
    select 1 from public.courses c where c.id = units.course_id and (
      c.published or exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
      )
    )
  ));

create policy "lessons readable" on public.lessons
  for select using (published or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Only admins can write catalog rows.
create policy "admin writes courses" on public.courses
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )) with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "admin writes units" on public.units
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )) with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "admin writes lessons" on public.lessons
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )) with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Profiles: a user reads/updates their own row; admins read all.
create policy "own profile read" on public.profiles
  for select using (id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));
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
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
