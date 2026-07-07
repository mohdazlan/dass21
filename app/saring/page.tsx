"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DASS21_ITEMS,
  SCALE_OPTIONS_MS,
  type Dass21Item,
  type Subscale,
} from "@/lib/dass21";
import { scoreDass21, type AnswerMap } from "@/lib/scoring";
import { getSupabase, saveScreening } from "@/lib/supabase";
import { getSessionUuid, setScreeningResult } from "@/lib/session";

const TOTAL_ITEMS = DASS21_ITEMS.length;

/** Progress indicator styled as terendak woven bands filling up. */
function WovenProgress({ answered }: { answered: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={TOTAL_ITEMS}
      aria-valuenow={answered}
      aria-label={`${answered} daripada ${TOTAL_ITEMS} soalan dijawab`}
      className="flex items-end gap-1"
    >
      {Array.from({ length: TOTAL_ITEMS }, (_, i) => (
        <span
          key={i}
          className={`flex-1 rounded-sm transition-colors motion-reduce:transition-none ${
            i % 2 === 0 ? "h-3" : "h-2"
          } ${i < answered ? (i % 2 === 0 ? "bg-nipah" : "bg-lacquer/70") : "bg-straw/60"}`}
        />
      ))}
    </div>
  );
}

export default function SaringPage() {
  const router = useRouter();
  const sessionUuid = getSessionUuid();

  const [items, setItems] = useState<Dass21Item[]>(DASS21_ITEMS);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);

  // Consent gate: no in-memory session means the respondent skipped the
  // consent panel (e.g. direct URL or hard refresh) — send them back.
  useEffect(() => {
    if (!sessionUuid) router.replace("/");
  }, [sessionUuid, router]);

  // Fetch the 21 items from Supabase; fall back to the bundled wording
  // (identical to the DB seed) when unconfigured or unreachable.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase
      .from("questions")
      .select("item_number, text_ms, subscale")
      .eq("active", true)
      .order("item_number")
      .then(({ data }) => {
        if (data && data.length === TOTAL_ITEMS) {
          setItems(
            data.map((d) => ({
              itemNumber: d.item_number as number,
              textMs: d.text_ms as string,
              subscale: d.subscale as Subscale,
            }))
          );
        }
      });
  }, []);

  if (!sessionUuid) return null;

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === TOTAL_ITEMS;

  function selectAnswer(itemNumber: number, value: number) {
    setAnswers((prev) => ({ ...prev, [itemNumber]: value }));
  }

  async function submit() {
    if (!allAnswered || submitting || !sessionUuid) return;
    setSubmitting(true);

    const scores = scoreDass21(answers);
    // Results travel in memory only — never URL params or storage.
    setScreeningResult(scores);
    // Best-effort anonymous persist; the respondent sees results regardless.
    await saveScreening(sessionUuid, answers, scores);

    router.push("/keputusan");
  }

  return (
    <main className="min-h-screen bg-sago">
      {/* Recall-frame banner — pinned above every question group */}
      <div className="sticky top-0 z-20 border-b border-straw bg-sago/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-center font-body text-sm font-semibold text-charcoal">
            Jawab berdasarkan keadaan anda{" "}
            <span className="text-lacquer">SEMINGGU YANG LEPAS</span>
          </p>
          <div className="mt-2">
            <WovenProgress answered={answeredCount} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6 text-center">
          <p className="mb-1 font-body text-xs uppercase tracking-[0.2em] text-nipah">
            SaringMinda
          </p>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
            Saringan DASS-21
          </h1>
          <p className="mt-2 font-body text-sm text-charcoal/70">
            Tidak ada jawapan betul atau salah. Jangan guna terlalu banyak masa
            untuk mana-mana kenyataan.
          </p>
        </header>

        <ol className="space-y-4">
          {items.map((item) => (
            <li
              key={item.itemNumber}
              className="rounded-lg border border-straw bg-white/70 p-4 shadow-sm"
            >
              <div
                role="radiogroup"
                aria-labelledby={`q-${item.itemNumber}`}
              >
                <p
                  id={`q-${item.itemNumber}`}
                  className="mb-3 font-body font-medium text-charcoal"
                >
                  {item.itemNumber}. {item.textMs}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SCALE_OPTIONS_MS.map((opt) => (
                    <label key={opt.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name={`item-${item.itemNumber}`}
                        value={opt.value}
                        checked={answers[item.itemNumber] === opt.value}
                        onChange={() =>
                          selectAnswer(item.itemNumber, opt.value)
                        }
                        className="peer sr-only"
                      />
                      <span className="block rounded-md border border-straw bg-sago px-2 py-2 text-center font-body text-xs text-charcoal transition hover:border-nipah peer-checked:border-nipah peer-checked:bg-nipah peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-charcoal motion-reduce:transition-none sm:text-sm">
                        {opt.value} — {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="sticky bottom-0 mt-6 rounded-t-lg border border-straw bg-sago/95 p-4 shadow-lg backdrop-blur-sm">
          <p className="mb-2 text-center font-body text-sm text-charcoal/80">
            {answeredCount} / {TOTAL_ITEMS} dijawab
          </p>
          <button
            type="button"
            disabled={!allAnswered || submitting}
            onClick={submit}
            className="w-full rounded-md bg-lacquer px-6 py-3 font-body font-semibold text-white transition hover:bg-lacquer/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          >
            {submitting ? "Memproses…" : "Lihat Keputusan"}
          </button>
        </div>
      </div>
    </main>
  );
}
