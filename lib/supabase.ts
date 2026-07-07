import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
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
  scores: ScreeningScores
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
