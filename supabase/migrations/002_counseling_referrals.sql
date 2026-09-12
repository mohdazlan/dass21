/**
 * Counseling referral table — respondents who scored Sederhana+ (or crisis flag)
 * and opted in to book an appointment with the counseling unit.
 *
 * RLS: anon can INSERT (the respondent submits their own referral) but cannot
 * SELECT back (no identity leakage). Staff can read all referrals.
 *
 * The "interested" boolean differentiates:
 * - interested = true: respondent chose "Ya, saya berminat" (full identity provided)
 * - interested = false: respondent chose "Tidak, terima kasih" (minimal data, tally only)
 */

create table counseling_referrals (
  id              bigint generated always as identity primary key,
  session_uuid    uuid        not null,
  interested      boolean     not null default false,
  full_name       text,
  registration_no text,
  phone           text,
  department      text,
  class_name      text,
  email           text,
  preferred_time  text,
  notes           text,
  stress_raw      int,
  anxiety_raw     int,
  depression_raw  int,
  stress_band     text,
  anxiety_band    text,
  depression_band text,
  crisis_flag     boolean     default false,
  created_at      timestamptz not null default now()
);

alter table counseling_referrals enable row level security;

-- anon can INSERT their own referral
create policy counseling_referrals_insert_anon
  on counseling_referrals
  for insert
  to anon
  with check (true);

-- staff (in admin_profiles) can read all referrals
create policy counseling_referrals_select_staff
  on counseling_referrals
  for select
  to authenticated
  using (is_staff());
