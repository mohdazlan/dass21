/**
 * DASS-21 UI content — item wording (Bahasa Melayu) and display labels.
 * Wording is transcribed verbatim from the KKM "Tangani Stres Anda" booklet
 * (docs/dass_21.pdf). Scoring logic lives in lib/scoring.ts.
 */

import type { Subscale } from "./scoring";

export type { Subscale, SeverityBand } from "./scoring";

export const SUBSCALE_LABEL_MS: Record<Subscale, string> = {
  stress: "Stres",
  anxiety: "Anzieti / Keresahan",
  depression: "Kemurungan",
};

export const BAND_LABEL_MS = {
  normal: "Normal",
  ringan: "Ringan",
  sederhana: "Sederhana",
  teruk: "Teruk",
  sangat_teruk: "Sangat Teruk",
} as const;

/** Response scale: 0–3 for every item. */
export const SCALE_OPTIONS_MS = [
  { value: 0, label: "Tidak pernah sama sekali" },
  { value: 1, label: "Jarang" },
  { value: 2, label: "Kerap" },
  { value: 3, label: "Sangat kerap" },
] as const;

export interface Dass21Item {
  itemNumber: number;
  textMs: string;
  subscale: Subscale;
}

/**
 * All 21 items in questionnaire order. Mirrors the DB seed in 001_init.sql —
 * used as the offline fallback when the `questions` table is unreachable.
 */
export const DASS21_ITEMS: Dass21Item[] = [
  { itemNumber: 1, textMs: "Saya rasa susah untuk bertenang", subscale: "stress" },
  { itemNumber: 2, textMs: "Saya sedar mulut saya kering", subscale: "anxiety" },
  { itemNumber: 3, textMs: "Saya seolah-olah tidak dapat mengalami perasaan positif sama sekali", subscale: "depression" },
  { itemNumber: 4, textMs: "Saya mengalami kesukaran bernafas contohnya, bernafas terlalu cepat, tercungap-cungap walaupun tidak melakukan aktiviti fizikal", subscale: "anxiety" },
  { itemNumber: 5, textMs: "Saya rasa tidak bersemangat untuk memulakan sesuatu keadaan", subscale: "depression" },
  { itemNumber: 6, textMs: "Saya cenderung bertindak secara berlebihan kepada sesuatu keadaan", subscale: "stress" },
  { itemNumber: 7, textMs: "Saya pernah menggeletar (contohnya tangan)", subscale: "anxiety" },
  { itemNumber: 8, textMs: "Saya rasa saya terlalu gelisah", subscale: "stress" },
  { itemNumber: 9, textMs: "Saya risau akan berlaku keadaan di mana saya panik dan berkelakuan bodoh", subscale: "anxiety" },
  { itemNumber: 10, textMs: "Saya rasa tidak ada apa yang saya harapkan", subscale: "depression" },
  { itemNumber: 11, textMs: "Saya dapati saya mudah resah", subscale: "stress" },
  { itemNumber: 12, textMs: "Saya merasa sukar untuk relaks", subscale: "stress" },
  { itemNumber: 13, textMs: "Saya rasa muram dan sedih", subscale: "depression" },
  { itemNumber: 14, textMs: "Saya tidak boleh terima apa jua yang menghalangi saya daripada meneruskan apa yang sedang saya lakukan", subscale: "stress" },
  { itemNumber: 15, textMs: "Saya rasa hampir panik", subscale: "anxiety" },
  { itemNumber: 16, textMs: "Saya tidak bersemangat langsung", subscale: "depression" },
  { itemNumber: 17, textMs: "Saya rasa diri saya tidak berharga", subscale: "depression" },
  { itemNumber: 18, textMs: "Saya mudah tersinggung", subscale: "stress" },
  { itemNumber: 19, textMs: "Walaupun saya tidak melakukan aktiviti fizikal, saya sedar akan debaran jantung saya (contoh degupan jantung lebih cepat)", subscale: "anxiety" },
  { itemNumber: 20, textMs: "Saya rasa takut tanpa sebab", subscale: "anxiety" },
  { itemNumber: 21, textMs: "Saya rasa hidup ini tidak bererti lagi", subscale: "depression" },
];
