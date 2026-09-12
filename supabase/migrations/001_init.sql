-- SaringMinda — initial schema, RLS policies, and DASS-21 seed data.
-- DASS-21 is a screening tool, not a diagnostic instrument.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type subscale as enum ('stress', 'anxiety', 'depression');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- The 21 DASS-21 items, in Bahasa Melayu, mapped to their subscale.
create table questions (
  id          bigint generated always as identity primary key,
  item_number int         not null unique check (item_number between 1 and 21),
  text_ms     text        not null,
  subscale    subscale    not null,
  active      boolean     not null default true
);

-- Raw item responses submitted by an anonymous respondent, keyed by a
-- client-generated session uuid (no auth required to answer the screening).
create table responses (
  id           bigint generated always as identity primary key,
  session_uuid uuid        not null,
  item_number  int         not null check (item_number between 1 and 21),
  value        int         not null check (value between 0 and 3),
  created_at   timestamptz not null default now()
);

-- Computed subscale totals, severity bands, and the crisis flag for a session.
create table screening_results (
  id               bigint generated always as identity primary key,
  session_uuid     uuid        not null,
  stress_raw       int         not null,
  anxiety_raw      int         not null,
  depression_raw   int         not null,
  stress_band      text        not null,
  anxiety_band     text        not null,
  depression_band  text        not null,
  crisis_flag      boolean     not null default false,
  created_at       timestamptz not null default now()
);

-- Staff who may review screening data. Presence of a row (matched to the
-- authenticated user's id) grants read access via RLS below.
create table admin_profiles (
  id    uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role  text not null default 'counselor'
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table questions          enable row level security;
alter table responses          enable row level security;
alter table screening_results  enable row level security;
alter table admin_profiles     enable row level security;

-- Staff membership check. SECURITY DEFINER so the lookup runs with the
-- function owner's rights and bypasses RLS — this both avoids the infinite
-- recursion that a self-referential policy on admin_profiles would cause and
-- lets the same predicate be reused across every table's policy.
create function is_staff()
  returns boolean
  language sql
  security definer
  set search_path = public
  stable
as $$
  select exists (select 1 from admin_profiles where id = auth.uid());
$$;

-- questions: readable by everyone (anon + authenticated); no public writes.
create policy questions_select_all
  on questions
  for select
  using (true);

-- responses: anon may INSERT only. No SELECT/UPDATE/DELETE for anon.
create policy responses_insert_anon
  on responses
  for insert
  to anon
  with check (true);

-- responses: staff (present in admin_profiles) may read everything.
create policy responses_select_staff
  on responses
  for select
  to authenticated
  using (is_staff());

-- screening_results: anon may INSERT only.
create policy screening_results_insert_anon
  on screening_results
  for insert
  to anon
  with check (true);

-- screening_results: staff may read everything.
create policy screening_results_select_staff
  on screening_results
  for select
  to authenticated
  using (is_staff());

-- admin_profiles: staff may read all profiles.
create policy admin_profiles_select_staff
  on admin_profiles
  for select
  to authenticated
  using (is_staff());

-- ---------------------------------------------------------------------------
-- Seed: the 21 DASS-21 items (Bahasa Melayu)
--   Stress     = 1, 6, 8, 11, 12, 14, 18
--   Anxiety    = 2, 4, 7, 9, 15, 19, 20
--   Depression = 3, 5, 10, 13, 16, 17, 21
-- ---------------------------------------------------------------------------
insert into questions (item_number, text_ms, subscale) values
  (1,  'Saya rasa susah untuk bertenang', 'stress'),
  (2,  'Saya sedar mulut saya kering', 'anxiety'),
  (3,  'Saya seolah-olah tidak dapat mengalami perasaan positif sama sekali', 'depression'),
  (4,  'Saya mengalami kesukaran bernafas contohnya, bernafas terlalu cepat, tercungap-cungap walaupun tidak melakukan aktiviti fizikal', 'anxiety'),
  (5,  'Saya rasa tidak bersemangat untuk memulakan sesuatu keadaan', 'depression'),
  (6,  'Saya cenderung bertindak secara berlebihan kepada sesuatu keadaan', 'stress'),
  (7,  'Saya pernah menggeletar (contohnya tangan)', 'anxiety'),
  (8,  'Saya rasa saya terlalu gelisah', 'stress'),
  (9,  'Saya risau akan berlaku keadaan di mana saya panik dan berkelakuan bodoh', 'anxiety'),
  (10, 'Saya rasa tidak ada apa yang saya harapkan', 'depression'),
  (11, 'Saya dapati saya mudah resah', 'stress'),
  (12, 'Saya merasa sukar untuk relaks', 'stress'),
  (13, 'Saya rasa muram dan sedih', 'depression'),
  (14, 'Saya tidak boleh terima apa jua yang menghalangi saya daripada meneruskan apa yang sedang saya lakukan', 'stress'),
  (15, 'Saya rasa hampir panik', 'anxiety'),
  (16, 'Saya tidak bersemangat langsung', 'depression'),
  (17, 'Saya rasa diri saya tidak berharga', 'depression'),
  (18, 'Saya mudah tersinggung', 'stress'),
  (19, 'Walaupun saya tidak melakukan aktiviti fizikal, saya sedar akan debaran jantung saya (contoh degupan jantung lebih cepat)', 'anxiety'),
  (20, 'Saya rasa takut tanpa sebab', 'anxiety'),
  (21, 'Saya rasa hidup ini tidak bererti lagi', 'depression');
