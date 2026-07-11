"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TerendakMotif from "@/components/TerendakMotif";
import { startSession } from "@/lib/session";

const DISCLAIMER_MS =
  "DASS-21 ialah alat saringan, bukan alat diagnosis. Keputusan ini bukan diagnosis klinikal dan tidak mengesahkan anda mempunyai atau tidak mempunyai sesuatu gangguan kesihatan mental.";

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
    <main
      className="relative flex min-h-screen flex-col items-center overflow-hidden bg-sago bg-cover bg-fixed bg-center px-4 py-10 sm:px-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(250, 246, 236, 0.95), rgba(250, 246, 236, 0.95)), url('/terendak-bg.jpg')",
      }}
    >
      <TerendakMotif
        size={640}
        className="pointer-events-none absolute -right-24 -top-16 select-none"
      />

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
          <p className="mb-5 font-body text-sm leading-relaxed text-charcoal/90">
            {DISCLAIMER_MS}
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
          Tanpa nama · Percuma · Jawapan anda tidak dikaitkan dengan identiti
          anda
        </p>
      </div>
    </main>
  );
}
