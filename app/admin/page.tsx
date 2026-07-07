import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import {
  BAND_LABEL_MS,
  SUBSCALE_LABEL_MS,
  type SeverityBand,
} from "@/lib/dass21";
import { getSupabaseServer } from "@/lib/supabaseServer";

// Auth + data depend on request cookies; never prerender.
export const dynamic = "force-dynamic";

interface ScreeningResultRow {
  id: number;
  session_uuid: string;
  stress_raw: number;
  anxiety_raw: number;
  depression_raw: number;
  stress_band: SeverityBand;
  anxiety_band: SeverityBand;
  depression_band: SeverityBand;
  crisis_flag: boolean;
  created_at: string;
}

function bandLabel(band: SeverityBand): string {
  return BAND_LABEL_MS[band] ?? band;
}

function bandClass(band: SeverityBand): string {
  switch (band) {
    case "normal":
      return "text-charcoal/80";
    case "ringan":
    case "sederhana":
      return "text-nipah font-medium";
    default:
      return "text-lacquer font-semibold";
  }
}

export default async function AdminDashboardPage() {
  const supabase = getSupabaseServer();

  if (!supabase) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sago px-6">
        <p className="max-w-md rounded-lg border border-straw bg-white/70 p-6 text-center font-body text-sm text-charcoal/80">
          Supabase belum dikonfigurasi. Sila tetapkan NEXT_PUBLIC_SUPABASE_URL
          dan NEXT_PUBLIC_SUPABASE_ANON_KEY dalam .env.local.
        </p>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // RLS only returns a row if the caller is present in admin_profiles.
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sago px-6">
        <div className="max-w-md rounded-lg border border-straw bg-white/70 p-6 text-center">
          <h1 className="mb-2 font-display text-xl font-bold text-charcoal">
            Tiada Akses
          </h1>
          <p className="mb-4 font-body text-sm text-charcoal/80">
            Akaun anda ({user.email}) belum didaftarkan sebagai kaunselor.
            Sila hubungi pentadbir sistem.
          </p>
          <LogoutButton />
        </div>
      </main>
    );
  }

  const { data: results, error: resultsError } = await supabase
    .from("screening_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<ScreeningResultRow[]>();

  const rows = results ?? [];
  const total = rows.length;
  const crisisCount = rows.filter((r) => r.crisis_flag).length;
  const elevated = (band: SeverityBand) => band !== "normal";
  const elevatedCounts = {
    stress: rows.filter((r) => elevated(r.stress_band)).length,
    anxiety: rows.filter((r) => elevated(r.anxiety_band)).length,
    depression: rows.filter((r) => elevated(r.depression_band)).length,
  };

  return (
    <main className="min-h-screen bg-sago px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-1 font-body text-xs uppercase tracking-[0.2em] text-nipah">
              SaringMinda
            </p>
            <h1 className="font-display text-3xl font-bold text-charcoal">
              Dashboard Kaunselor
            </h1>
            <p className="mt-1 font-body text-sm text-charcoal/60">
              {user.email} · {profile.role}
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-lg border border-straw bg-white/70 p-4">
            <p className="font-body text-xs text-charcoal/60">
              Jumlah Saringan
            </p>
            <p className="font-display text-3xl font-bold text-charcoal">
              {total}
            </p>
          </div>
          <div className="rounded-lg border border-lacquer/40 bg-white/70 p-4">
            <p className="font-body text-xs text-charcoal/60">Bendera Krisis</p>
            <p className="font-display text-3xl font-bold text-lacquer">
              {crisisCount}
            </p>
          </div>
          {(["stress", "anxiety", "depression"] as const).map((sub) => (
            <div key={sub} className="rounded-lg border border-straw bg-white/70 p-4">
              <p className="font-body text-xs text-charcoal/60">
                {SUBSCALE_LABEL_MS[sub]} (bukan normal)
              </p>
              <p className="font-display text-3xl font-bold text-charcoal">
                {elevatedCounts[sub]}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-straw bg-white/70 p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold text-charcoal">
            Saringan Terkini{total > 0 ? ` (${total})` : ""}
          </h2>

          {resultsError ? (
            <p className="font-body text-sm text-lacquer">
              Ralat memuatkan data: {resultsError.message}
            </p>
          ) : total === 0 ? (
            <p className="font-body text-sm text-charcoal/70">
              Tiada saringan direkodkan lagi. Kongsi pautan{" "}
              <Link href="/saring" className="text-nipah underline">
                /saring
              </Link>{" "}
              untuk mula mengumpul data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-straw text-left text-charcoal/70">
                    <th className="py-2 pr-3">Tarikh</th>
                    <th className="py-2 pr-3">Stres</th>
                    <th className="py-2 pr-3">Anzieti</th>
                    <th className="py-2 pr-3">Kemurungan</th>
                    <th className="py-2">Krisis</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-b border-straw/60 ${
                        r.crisis_flag ? "bg-lacquer/5" : ""
                      }`}
                    >
                      <td className="py-2 pr-3 text-charcoal/80">
                        {new Date(r.created_at).toLocaleString("ms-MY", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className={`py-2 pr-3 ${bandClass(r.stress_band)}`}>
                        {r.stress_raw} · {bandLabel(r.stress_band)}
                      </td>
                      <td className={`py-2 pr-3 ${bandClass(r.anxiety_band)}`}>
                        {r.anxiety_raw} · {bandLabel(r.anxiety_band)}
                      </td>
                      <td
                        className={`py-2 pr-3 ${bandClass(r.depression_band)}`}
                      >
                        {r.depression_raw} · {bandLabel(r.depression_band)}
                      </td>
                      <td className="py-2">
                        {r.crisis_flag ? (
                          <span className="rounded bg-lacquer px-2 py-0.5 text-xs font-semibold text-white">
                            Ya
                          </span>
                        ) : (
                          <span className="text-charcoal/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
