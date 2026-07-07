/**
 * DASS-21 scoring — pure, dependency-free module (unit-tested in tests/).
 *
 * Cutoffs are transcribed verbatim from the KKM "Tangani Stres Anda" booklet
 * (docs/dass_21.pdf, SKOR SARINGAN). Scores are raw sums of the seven 0–3
 * items per subscale (max 21) — NOT doubled to DASS-42 scale.
 *
 * DASS-21 is a screening tool, not a diagnostic instrument.
 */

export type Subscale = "stress" | "anxiety" | "depression";

export type SeverityBand =
  | "normal"
  | "ringan"
  | "sederhana"
  | "teruk"
  | "sangat_teruk";

/** Item-number → subscale mapping (7 items each). */
export const SUBSCALE_ITEMS: Record<Subscale, number[]> = {
  stress: [1, 6, 8, 11, 12, 14, 18],
  anxiety: [2, 4, 7, 9, 15, 19, 20],
  depression: [3, 5, 10, 13, 16, 17, 21],
};

/** Maximum raw score per subscale (7 items × 3). */
export const MAX_RAW = 21;

/**
 * SKOR SARINGAN cutoffs (upper bound of each band, inclusive):
 *
 *                Kemurungan   Anzieti   Stres
 *   Normal          0–5        0–4      0–7
 *   Ringan          6–7        5–6      8–9
 *   Sederhana       8–10       7–8      10–13
 *   Teruk           11–14      9–10     14–17
 *   Sangat teruk    15+        11+      18+
 */
export const CUTOFFS: Record<
  Subscale,
  { band: SeverityBand; max: number }[]
> = {
  depression: [
    { band: "normal", max: 5 },
    { band: "ringan", max: 7 },
    { band: "sederhana", max: 10 },
    { band: "teruk", max: 14 },
    { band: "sangat_teruk", max: MAX_RAW },
  ],
  anxiety: [
    { band: "normal", max: 4 },
    { band: "ringan", max: 6 },
    { band: "sederhana", max: 8 },
    { band: "teruk", max: 10 },
    { band: "sangat_teruk", max: MAX_RAW },
  ],
  stress: [
    { band: "normal", max: 7 },
    { band: "ringan", max: 9 },
    { band: "sederhana", max: 13 },
    { band: "teruk", max: 17 },
    { band: "sangat_teruk", max: MAX_RAW },
  ],
};

export function bandFor(subscale: Subscale, rawScore: number): SeverityBand {
  const row = CUTOFFS[subscale].find((c) => rawScore <= c.max);
  // Unreachable for valid raw scores (every table ends at MAX_RAW).
  return row ? row.band : "sangat_teruk";
}

/** Answers keyed by item number (1–21), each 0–3. */
export type AnswerMap = Record<number, number>;

export interface ScreeningScores {
  stressRaw: number;
  anxietyRaw: number;
  depressionRaw: number;
  stressBand: SeverityBand;
  anxietyBand: SeverityBand;
  depressionBand: SeverityBand;
  /**
   * Crisis pathway trigger: item 21 ("Saya rasa hidup ini tidak bererti
   * lagi") ≥ 1, OR item 10 ("Saya rasa tidak ada apa yang saya harapkan")
   * ≥ 2. Independent of severity bands.
   */
  crisisFlag: boolean;
}

export function scoreDass21(answers: AnswerMap): ScreeningScores {
  const sums: Record<Subscale, number> = { stress: 0, anxiety: 0, depression: 0 };

  for (const subscale of Object.keys(SUBSCALE_ITEMS) as Subscale[]) {
    for (const itemNumber of SUBSCALE_ITEMS[subscale]) {
      const v = answers[itemNumber];
      if (v === undefined || !Number.isInteger(v) || v < 0 || v > 3) {
        throw new Error(
          `Jawapan tidak lengkap atau tidak sah untuk item ${itemNumber}`
        );
      }
      sums[subscale] += v;
    }
  }

  const crisisFlag = (answers[21] ?? 0) >= 1 || (answers[10] ?? 0) >= 2;

  return {
    stressRaw: sums.stress,
    anxietyRaw: sums.anxiety,
    depressionRaw: sums.depression,
    stressBand: bandFor("stress", sums.stress),
    anxietyBand: bandFor("anxiety", sums.anxiety),
    depressionBand: bandFor("depression", sums.depression),
    crisisFlag,
  };
}
