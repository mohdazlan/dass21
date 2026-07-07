"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import TerendakMotif from "@/components/TerendakMotif";
import { getSupabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const supabase = getSupabase();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("E-mel atau kata laluan tidak sah.");
      setBusy(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sago px-6">
      <TerendakMotif
        size={480}
        className="pointer-events-none absolute -left-24 -bottom-16 select-none"
      />

      <div className="relative z-10 w-full max-w-sm">
        <header className="mb-6 text-center">
          <p className="mb-1 font-body text-xs uppercase tracking-[0.2em] text-nipah">
            SaringMinda
          </p>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            Log Masuk Kaunselor
          </h1>
        </header>

        {!supabase ? (
          <p className="rounded-lg border border-straw bg-white/70 p-5 text-center font-body text-sm text-charcoal/80">
            Supabase belum dikonfigurasi. Sila tetapkan
            NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY dalam
            .env.local.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-straw bg-white/70 p-6 shadow-sm"
          >
            <label className="mb-4 block">
              <span className="mb-1 block font-body text-sm font-medium text-charcoal">
                E-mel
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah"
              />
            </label>
            <label className="mb-5 block">
              <span className="mb-1 block font-body text-sm font-medium text-charcoal">
                Kata Laluan
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah"
              />
            </label>

            {error && (
              <p className="mb-4 font-body text-sm text-lacquer">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-nipah px-6 py-3 font-body font-semibold text-white transition hover:bg-nipah/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Sedang log masuk…" : "Log Masuk"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
