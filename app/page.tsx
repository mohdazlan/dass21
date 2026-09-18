"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AbstractBackground from "@/components/AbstractBackground";
import { startSession } from "@/lib/session";

const DISCLAIMER_MS =
  "DASS-21 ialah alat saringan, bukan alat diagnosis. Keputusan ini bukan diagnosis klinikal dan tidak mengesahkan anda mempunyai atau tidak mempunyai sesuatu gangguan kesihatan mental.";

/**
 * The screening is anonymous, but a respondent whose score reaches the
 * referral threshold is offered an appointment form on the results page.
 * That is the one place identity is ever collected, so it is disclosed here
 * before consent rather than sprung on them at the end.
 */
const PRIVACY_MS =
  "Saringan ini tanpa nama — jawapan anda tidak dikaitkan dengan identiti anda. Jika keputusan anda menunjukkan keperluan sokongan, anda akan ditawarkan untuk berjumpa kaunselor. Hanya jika anda sendiri memilih tawaran itu, anda akan diminta mengisi nama dan maklumat hubungan untuk Unit Kaunseling menghubungi anda.";

export default function HomePage() {
  const router = useRouter();
  const [consented, setConsented] = useState(false);

  function handleStart() {
    if (!consented) return;
    // Session UUID lives in memory only — never localStorage/cookies/URL.
    startSession();
    router.push("/saring");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-transparent px-4 py-10 sm:px-6">
      <AbstractBackground />

      {/* PMU logo — very top of the page */}
      <div className="relative z-10 mb-6">
        <Image
          src="/pmu.png"
          alt="Politeknik Malaysia Mukah"
          width={480}
          height={180}
          priority
          className="h-14 w-auto sm:h-16"
        />
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center">
        <p className="mb-3 font-body text-sm uppercase tracking-[0.2em] text-nipah">
          Saringan Kesihatan Mental
        </p>
        <h1 className="mb-4 font-display text-4xl font-bold text-charcoal sm:text-5xl">
          SaringMinda
        </h1>
        <p className="mb-8 font-body text-base text-charcoal/80 sm:text-lg">
          Saringan DASS-21 tanpa nama untuk memahami tahap stres, keresahan dan
          kemurungan anda sepanjang seminggu yang lepas. Mengambil masa
          kira-kira 5 minit.
        </p>

        <section
          aria-labelledby="consent-heading"
          className="rounded-lg border border-straw bg-white/70 p-6 text-left shadow-sm"
        >
          <h2
            id="consent-heading"
            className="mb-3 font-display text-xl font-bold text-charcoal"
          >
            Persetujuan Bermaklumat
          </h2>
          <p className="mb-3 font-body text-sm leading-relaxed text-charcoal/90">
            {DISCLAIMER_MS}
          </p>
          <p className="mb-5 font-body text-sm leading-relaxed text-charcoal/90">
            {PRIVACY_MS}
          </p>

          <label className="mb-5 flex cursor-pointer items-start gap-3 font-body text-sm text-charcoal">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-nipah focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
            />
            <span>Saya faham dan bersetuju</span>
          </label>

          <button
            type="button"
            disabled={!consented}
            onClick={handleStart}
            className="w-full rounded-md bg-nipah px-6 py-3 font-body font-semibold text-white transition hover:bg-nipah/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          >
            Mula Saringan
          </button>
        </section>

        <p className="mt-6 font-body text-xs text-charcoal/60">
          Tanpa nama · Percuma · Identiti hanya diminta jika anda sendiri
          memilih untuk berjumpa kaunselor
        </p>

        <div className="mt-4">
          <a
            href="/pensyarah"
            className="font-body text-xs text-nipah underline underline-offset-4 hover:text-lacquer"
          >
            Anda pensyarah atau staf? Klik di sini untuk saringan staf &amp; pensyarah →
          </a>
        </div>
      </div>
    </main>
  );
}
