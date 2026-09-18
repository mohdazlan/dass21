/**
 * Add user_type column to screening_results table.
 * Allows tracking anonymous screening aggregates specifically for staff/pensyarah vs students.
 */

alter table screening_results
  add column if not exists user_type text not null default 'pelajar';
