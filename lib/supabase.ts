import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normaliseReferral, type ReferralForm } from "./referral";
import type { AnswerMap, ScreeningScores } from "./scoring";

/**
 * Browser Supabase client. Returns null when env vars are absent so the
 * screening still works fully offline — results are computed client-side and
 * saving is best-effort.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}

/**
 * Persist one completed screening (21 item responses + computed result).
 * Anonymous: rows are keyed only by a client-generated session uuid.
 * Returns true if saved, false if Supabase is unconfigured or the write failed.
 */
export async function saveScreening(
  sessionUuid: string,
  answers: AnswerMap,
  scores: ScreeningScores,
  userType: import("./referral").RespondentType = "pelajar"
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const responseRows = Object.entries(answers).map(([itemNumber, value]) => ({
      session_uuid: sessionUuid,
      item_number: Number(itemNumber),
      value,
    }));

    const { error: respErr } = await supabase.from("responses").insert(responseRows);
    if (respErr) return false;

    const { error: resErr } = await supabase.from("screening_results").insert({
      session_uuid: sessionUuid,
      user_type: userType,
      stress_raw: scores.stressRaw,
      anxiety_raw: scores.anxietyRaw,
      depression_raw: scores.depressionRaw,
      stress_band: scores.stressBand,
      anxiety_band: scores.anxietyBand,
      depression_band: scores.depressionBand,
      crisis_flag: scores.crisisFlag,
    });
    return !resErr;
  } catch {
    return false;
  }
}

/**
 * Record the student's answer to the counsellor offer.
 *
 * Unlike saveScreening this is NOT best-effort: a student who fills in the
 * form is expecting a phone call, so a failed write has to surface as an error
 * rather than a silent success. `form` is omitted when they decline — the row
 * is then a bare anonymous tally with no identifying columns.
 */
export async function saveReferral(
  sessionUuid: string,
  scores: ScreeningScores,
  form?: ReferralForm
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabase();
  if (!supabase)
    return {
      ok: false,
      message:
        "Sistem tidak dapat dihubungi. Sila hubungi Unit Kaunseling secara terus.",
    };

  const scoreSnapshot = {
    stress_raw: scores.stressRaw,
    anxiety_raw: scores.anxietyRaw,
    depression_raw: scores.depressionRaw,
    stress_band: scores.stressBand,
    anxiety_band: scores.anxietyBand,
    depression_band: scores.depressionBand,
    crisis_flag: scores.crisisFlag,
  };

  try {
    const { error } = await supabase.from("counseling_referrals").insert({
      session_uuid: sessionUuid,
      interested: form !== undefined,
      ...scoreSnapshot,
      ...(form ? normaliseReferral(form) : {}),
    });

    if (error)
      return {
        ok: false,
        message:
          "Maaf, maklumat anda tidak dapat dihantar. Sila cuba sekali lagi.",
      };
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Sambungan internet terputus. Sila semak sambungan dan cuba sekali lagi.",
    };
  }
}
