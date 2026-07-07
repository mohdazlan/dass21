import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * RLS verification against the live Supabase project (anon key only):
 *   1. anon INSERT into responses succeeds
 *   2. anon SELECT on responses returns nothing (no select policy — RLS
 *      filters silently, so we assert the just-inserted row is invisible)
 *
 * Run with: npm run test:rls (reads .env.local when present).
 * Skipped automatically when Supabase env vars are not set.
 * Note: this inserts one throwaway row (item 1, value 0, random session).
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const skip = !url || !anonKey ? "Supabase env vars not set" : false;

test("RLS: anon can INSERT responses but cannot SELECT them back", { skip }, async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url!, anonKey!, {
    auth: { persistSession: false },
  });

  const sessionUuid = crypto.randomUUID();

  const ins = await supabase
    .from("responses")
    .insert({ session_uuid: sessionUuid, item_number: 1, value: 0 });
  assert.equal(ins.error, null, `anon INSERT should succeed: ${ins.error?.message}`);

  const sel = await supabase
    .from("responses")
    .select("id")
    .eq("session_uuid", sessionUuid);
  assert.equal(sel.error, null);
  assert.equal(
    sel.data?.length ?? 0,
    0,
    "anon SELECT must not return rows (RLS should hide them)"
  );
});

test("RLS: anon cannot SELECT screening_results", { skip }, async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url!, anonKey!, {
    auth: { persistSession: false },
  });

  const sel = await supabase.from("screening_results").select("id").limit(1);
  assert.equal(sel.error, null);
  assert.equal(sel.data?.length ?? 0, 0);
});
