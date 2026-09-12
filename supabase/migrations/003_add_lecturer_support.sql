/**
 * Add lecturer/staff support to counseling_referrals table.
 * Differentiates student vs lecturer/staff referrals.
 */

alter table counseling_referrals
  add column if not exists user_type text not null default 'pelajar',
  add column if not exists staff_no text;
