"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BAND_LABEL_MS, SUBSCALE_LABEL_MS } from "@/lib/dass21";
import {
  CUTOFFS,
  MAX_RAW,
  type SeverityBand,
  type Subscale,
} from "@/lib/scoring";
import { getScreeningResult } from "@/lib/session";

const CRISIS_CONTACTS = [
  { name: "Talian HEAL", contact: "15555" },
  { name: "Befrienders Kuching", contact: "082-242800" },
  { name: "Kaunselor institusi anda", contact: "Hubungi kaunselor institusi anda" },
];

const NOT_DIAGNOSIS_MS =
  "Keputusan ini bukan diagnosis klinikal. DASS-21 ialah alat saringan, bukan alat diagnosis.";

/** Pelan Tindakan — 2–3 short recommendations per band level. */
const ACTION_PLAN_MS: Record<SeverityBand, string[]> = {
  normal: [
    "Kekalkan rutin penjagaan diri: tidur mencukupi, senaman ringan dan hubungan sosial yang sihat.",
    "Ulang saringan ini dari semasa ke semasa untuk memantau kesejahteraan anda.",
  ],
  ringan: [
    "Amalkan teknik relaksasi seperti pernafasan dalam secara berkala.",
    "Pantau perasaan anda; jika simptom berterusan melebihi dua minggu, pertimbangkan berjumpa kaunselor.",
  ],
  sederhana: [
    "Dapatkan penilaian lanjut daripada kaunselor berdaftar.",
    "Kekalkan sokongan sosial dan kurangkan tekanan harian di mana boleh.",
  ],
  teruk: [
    "Dapatkan penilaian lanjut daripada kaunselor berdaftar atau profesional kesihatan mental secepat mungkin.",
    "Maklumkan kepada seseorang yang anda percayai supaya anda mendapat sokongan.",
  ],
  sangat_teruk: [
    "Dapatkan penilaian lanjut daripada kaunselor berdaftar atau pakar kesihatan mental dengan segera.",
    "Jangan hadapi keadaan ini bersendirian — gunakan talian sokongan yang tersenarai.",
    "Jika anda berasa tidak selamat, hubungi perkhidmatan kecemasan (999) sekarang.",
  ],
};

const BAND_ORDER: SeverityBand[] = [
  "normal",
  "ringan",
  "sederhana",
  "teruk",
  "sangat_teruk",
];

/** Fill colour per band segment — calm woven palette, no alarm styling. */
const BAND_SEGMENT_CLASS: Record<SeverityBand, string> = {
  normal: "bg-straw",
  ringan: "bg-nipah/40",
  sederhana: "bg-nipah",
  teruk: "bg-lacquer/60",
  sangat_teruk: "bg-lacquer",
};

/**
 * Horizontal severity gauge drawn against the subscale's OWN cutoff bands.
 * The 0–21 raw range spans 22 discrete values; each band segment's width is
 * proportional to how many values it covers, and the marker sits at the
 * centre of the scored value.
 */
function SeverityGauge({
  subscale,
  raw,
  band,
}: {
  subscale: Subscale;
  raw: number;
  band: SeverityBand;
}) {
  const steps = MAX_RAW + 1; // 22 discrete raw values, 0..21
  let lower = 0;
  const segments = CUTOFFS[subscale].map(({ band: b, max }) => {
    const width = ((max - lower + 1) / steps) * 100;
    lower = max + 1;
    return { band: b, width };
  });
  const markerLeft = ((raw + 0.5) / steps) * 100;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-body font-semibold text-charcoal">
          {SUBSCALE_LABEL_MS[subscale]}
        </h3>
        <span className="font-body text-sm text-charcoal/70">
          Skor: {raw} / {MAX_RAW}
        </span>
      </div>

      <div
        role="img"
        aria-label={`${SUBSCALE_LABEL_MS[subscale]}: skor ${raw} daripada ${MAX_RAW}, tahap ${BAND_LABEL_MS[band]}`}
        className="relative"
      >
        <div className="flex h-5 overflow-hidden rounded-full border border-straw">
          {segments.map((s) => (
            <div
              key={s.band}
              style={{ width: `${s.width}%` }}
              className={BAND_SEGMENT_CLASS[s.band]}
            />
          ))}
        </div>
        {/* Score marker */}
        <div
          style={{ left: `${markerLeft}%` }}
          className="absolute -top-1 h-7 w-0.5 -translate-x-1/2 rounded bg-charcoal"
        />
      </div>

      <p className="mt-2 font-body text-sm font-semibold text-charcoal">
        Tahap: {BAND_LABEL_MS[band]}
      </p>
    </div>
  );
}

export default function KeputusanPage() {
  const router = useRouter();
  const scores = getScreeningResult();

  // No in-memory result (direct visit or refresh) — back to the start.
  useEffect(() => {
    if (!scores) router.replace("/");
  }, [scores, router]);

  if (!scores) return null;

  const worstBand = (
    [scores.stressBand, scores.anxietyBand, scores.depressionBand] as const
  ).reduce(
    (worst, b) =>
      BAND_ORDER.indexOf(b) > BAND_ORDER.indexOf(worst) ? b : worst,
    "normal" as SeverityBand
  );

  return (
    <main className="min-h-screen bg-sago px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="mb-1 font-body text-xs uppercase tracking-[0.2em] text-nipah">
            SaringMinda
          </p>
          <h1 className="font-display text-3xl font-bold text-charcoal">
            Keputusan &amp; Interpretasi
          </h1>
        </header>

        {scores.crisisFlag && (
          <section
            aria-labelledby="support-heading"
            className="mb-8 rounded-lg border-2 border-nipah bg-straw/40 p-6"
          >
            <h2
              id="support-heading"
              className="mb-2 font-display text-xl font-bold text-charcoal"
            >
              Sokongan Untuk Anda
            </h2>
            <p className="mb-4 font-body text-sm leading-relaxed text-charcoal/90">
              Sebahagian jawapan anda menunjukkan anda mungkin sedang melalui
              saat yang berat. Anda tidak keseorangan — sokongan sedia ada,
              dan bercakap dengan seseorang boleh membantu.
            </p>
            <ul className="space-y-2 font-body text-sm text-charcoal">
              <li>
                <span className="font-semibold">Talian HEAL:</span>{" "}
                <a
                  href="tel:15555"
                  className="text-lacquer underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
                >
                  15555
                </a>
              </li>
              <li>
                <span className="font-semibold">Befrienders Kuching:</span>{" "}
                <a
                  href="tel:082242800"
                  className="text-lacquer underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
                >
                  082-242800
                </a>
              </li>
              <li className="font-semibold">
                Hubungi kaunselor institusi anda
              </li>
            </ul>
          </section>
        )}

        <section className="mb-8 space-y-6 rounded-lg border border-straw bg-white/70 p-6 shadow-sm">
          <SeverityGauge
            subscale="stress"
            raw={scores.stressRaw}
            band={scores.stressBand}
          />
          <SeverityGauge
            subscale="anxiety"
            raw={scores.anxietyRaw}
            band={scores.anxietyBand}
          />
          <SeverityGauge
            subscale="depression"
            raw={scores.depressionRaw}
            band={scores.depressionBand}
          />
          <p className="font-body text-xs text-charcoal/70">
            {NOT_DIAGNOSIS_MS}
          </p>
        </section>

        <section className="mb-10 rounded-lg border border-straw bg-white/70 p-6 shadow-sm">
          <h2 className="mb-3 font-display text-xl font-bold text-charcoal">
            Pelan Tindakan
          </h2>
          <ul className="list-disc space-y-2 pl-5 font-body text-sm text-charcoal/90">
            {ACTION_PLAN_MS[worstBand].map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>

        <div className="mb-10 text-center">
          <Link
            href="/"
            className="font-body text-sm text-nipah underline underline-offset-4 hover:text-lacquer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            Kembali ke Halaman Utama
          </Link>
        </div>

        <footer className="border-t border-straw pt-5">
          <p className="mb-2 font-body text-xs text-charcoal/70">
            <span className="font-semibold">Perlukan sokongan?</span>{" "}
            {CRISIS_CONTACTS.map((c, i) => (
              <span key={c.name}>
                {i > 0 && " · "}
                {c.name === "Kaunselor institusi anda"
                  ? c.contact
                  : `${c.name}: ${c.contact}`}
              </span>
            ))}
          </p>
          <p className="font-body text-xs text-charcoal/60">
            {NOT_DIAGNOSIS_MS}
          </p>
        </footer>
      </div>
    </main>
  );
}
