import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SUBSCALE_ITEMS,
  bandFor,
  scoreDass21,
  type AnswerMap,
} from "../lib/scoring.ts";

/** All 21 items answered with the same value. */
function uniformAnswers(value: number): AnswerMap {
  const answers: AnswerMap = {};
  for (let i = 1; i <= 21; i++) answers[i] = value;
  return answers;
}

// ---------------------------------------------------------------------------
// Band boundaries — every edge of the SKOR SARINGAN table
// ---------------------------------------------------------------------------

test("kemurungan band boundaries (0–5 / 6–7 / 8–10 / 11–14 / 15+)", () => {
  assert.equal(bandFor("depression", 0), "normal");
  assert.equal(bandFor("depression", 5), "normal");
  assert.equal(bandFor("depression", 6), "ringan");
  assert.equal(bandFor("depression", 7), "ringan");
  assert.equal(bandFor("depression", 8), "sederhana");
  assert.equal(bandFor("depression", 10), "sederhana");
  assert.equal(bandFor("depression", 11), "teruk");
  assert.equal(bandFor("depression", 14), "teruk");
  assert.equal(bandFor("depression", 15), "sangat_teruk");
  assert.equal(bandFor("depression", 21), "sangat_teruk");
});

test("anzieti band boundaries (0–4 / 5–6 / 7–8 / 9–10 / 11+)", () => {
  assert.equal(bandFor("anxiety", 0), "normal");
  assert.equal(bandFor("anxiety", 4), "normal");
  assert.equal(bandFor("anxiety", 5), "ringan");
  assert.equal(bandFor("anxiety", 6), "ringan");
  assert.equal(bandFor("anxiety", 7), "sederhana");
  assert.equal(bandFor("anxiety", 8), "sederhana");
  assert.equal(bandFor("anxiety", 9), "teruk");
  assert.equal(bandFor("anxiety", 10), "teruk");
  assert.equal(bandFor("anxiety", 11), "sangat_teruk");
  assert.equal(bandFor("anxiety", 21), "sangat_teruk");
});

test("stres band boundaries (0–7 / 8–9 / 10–13 / 14–17 / 18+)", () => {
  assert.equal(bandFor("stress", 0), "normal");
  assert.equal(bandFor("stress", 7), "normal");
  assert.equal(bandFor("stress", 8), "ringan");
  assert.equal(bandFor("stress", 9), "ringan");
  assert.equal(bandFor("stress", 10), "sederhana");
  assert.equal(bandFor("stress", 13), "sederhana");
  assert.equal(bandFor("stress", 14), "teruk");
  assert.equal(bandFor("stress", 17), "teruk");
  assert.equal(bandFor("stress", 18), "sangat_teruk");
  assert.equal(bandFor("stress", 21), "sangat_teruk");
});

// ---------------------------------------------------------------------------
// Full scoring
// ---------------------------------------------------------------------------

test("all zeros → raw 0, all bands normal, no crisis", () => {
  const s = scoreDass21(uniformAnswers(0));
  assert.deepEqual(
    [s.stressRaw, s.anxietyRaw, s.depressionRaw],
    [0, 0, 0]
  );
  assert.deepEqual(
    [s.stressBand, s.anxietyBand, s.depressionBand],
    ["normal", "normal", "normal"]
  );
  assert.equal(s.crisisFlag, false);
});

test("all threes → raw 21 each, all sangat_teruk, crisis", () => {
  const s = scoreDass21(uniformAnswers(3));
  assert.deepEqual(
    [s.stressRaw, s.anxietyRaw, s.depressionRaw],
    [21, 21, 21]
  );
  assert.deepEqual(
    [s.stressBand, s.anxietyBand, s.depressionBand],
    ["sangat_teruk", "sangat_teruk", "sangat_teruk"]
  );
  assert.equal(s.crisisFlag, true);
});

test("subscale mapping is 7/7/7 and covers items 1–21 exactly once", () => {
  const all = [
    ...SUBSCALE_ITEMS.stress,
    ...SUBSCALE_ITEMS.anxiety,
    ...SUBSCALE_ITEMS.depression,
  ].sort((a, b) => a - b);
  assert.equal(SUBSCALE_ITEMS.stress.length, 7);
  assert.equal(SUBSCALE_ITEMS.anxiety.length, 7);
  assert.equal(SUBSCALE_ITEMS.depression.length, 7);
  assert.deepEqual(all, Array.from({ length: 21 }, (_, i) => i + 1));
});

test("incomplete answers throw", () => {
  assert.throws(() => scoreDass21({ 1: 0 }));
});

test("out-of-range answer throws", () => {
  const a = uniformAnswers(0);
  a[5] = 4;
  assert.throws(() => scoreDass21(a));
});

// ---------------------------------------------------------------------------
// Crisis flag: item 21 ≥ 1 OR item 10 ≥ 2
// ---------------------------------------------------------------------------

test("item 21 = 1 with otherwise-normal answers → crisis", () => {
  const a = uniformAnswers(0);
  a[21] = 1;
  const s = scoreDass21(a);
  assert.equal(s.depressionBand, "normal"); // raw 1 is still Normal
  assert.equal(s.crisisFlag, true); // but the support panel must show
});

test("item 10 = 2 with otherwise-normal answers → crisis", () => {
  const a = uniformAnswers(0);
  a[10] = 2;
  const s = scoreDass21(a);
  assert.equal(s.crisisFlag, true);
});

test("item 10 = 1 and item 21 = 0 → no crisis", () => {
  const a = uniformAnswers(0);
  a[10] = 1;
  const s = scoreDass21(a);
  assert.equal(s.crisisFlag, false);
});

test("high scores without item 10/21 triggers → no crisis", () => {
  // Max out everything except items 10 and 21.
  const a = uniformAnswers(3);
  a[10] = 1;
  a[21] = 0;
  const s = scoreDass21(a);
  assert.equal(s.stressBand, "sangat_teruk");
  assert.equal(s.crisisFlag, false);
});
