"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AdminSessionNotice() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = getSupabase();

    if (!supabase) {
      setChecking(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setAdminEmail(data.user?.email ?? null);
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    const supabase = getSupabase();
    if (!supabase) return;

    setLoggingOut(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("Log keluar tidak berjaya. Sila cuba sekali lagi.");
      setLoggingOut(false);
      return;
    }

    setAdminEmail(null);
    setLoggingOut(false);
    router.refresh();
  }

  if (checking || !adminEmail) return null;

  return (
    <aside
      role="alert"
      className="mb-6 rounded-lg border-2 border-lacquer bg-lacquer/10 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-body text-sm font-bold uppercase tracking-wide text-lacquer">
            Mod Admin Aktif
          </p>
          <p className="mt-1 font-body text-sm leading-relaxed text-charcoal">
            Anda sedang log masuk sebagai admin ({adminEmail}). Sebarang data
            saringan yang dihantar dalam keadaan ini tidak akan disimpan ke
            dalam pangkalan data.
          </p>
          <p className="mt-1 font-body text-xs text-charcoal/70">
            Log keluar admin sebelum mengisi saringan sebenar. Jawapan yang
            telah dipilih pada halaman ini akan kekal.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="shrink-0 rounded-md bg-lacquer px-5 py-3 font-body text-sm font-semibold text-white transition hover:bg-lacquer/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:cursor-wait disabled:opacity-60"
        >
          {loggingOut ? "Sedang Log Keluar…" : "Log Keluar Admin & Teruskan"}
        </button>
      </div>
      {error && (
        <p className="mt-3 font-body text-sm font-semibold text-lacquer">
          {error}
        </p>
      )}
    </aside>
  );
}
