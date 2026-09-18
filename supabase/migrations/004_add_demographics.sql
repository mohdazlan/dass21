/**
 * Add gender (jantina), service group (kumpulan perkhidmatan), and position (jawatan)
 * to counseling_referrals table.
 */

alter table counseling_referrals
  add column if not exists gender text,
  add column if not exists service_group text,
  add column if not exists position text;
