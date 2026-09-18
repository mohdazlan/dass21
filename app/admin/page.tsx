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

interface ReferralRow {
  id: number;
  interested: boolean;
  user_type?: "pelajar" | "pensyarah" | null;
  full_name: string | null;
  gender?: string | null;
  service_group?: string | null;
  position?: string | null;
  registration_no: string | null;
  staff_no?: string | null;
  phone: string | null;
  department: string | null;
  class_name: string | null;
  email: string | null;
  preferred_time: string | null;
  notes: string | null;
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

  const [
    { data: results, error: resultsError },
    { data: referrals, error: referralsError },
  ] = await Promise.all([
    supabase
      .from("screening_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(600)
      .returns<ScreeningResultRow[]>(),
    supabase
      .from("counseling_referrals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<ReferralRow[]>(),
  ]);

  const rows = results ?? [];
  const allReferrals = referrals ?? [];
  // Declined rows carry no identity — they exist only for the tally below.
  const interestedRows = allReferrals.filter((r) => r.interested);
  const studentReferrals = interestedRows.filter((r) => r.user_type !== "pensyarah");
  const lecturerReferrals = interestedRows.filter((r) => r.user_type === "pensyarah");
  const declinedCount = allReferrals.length - interestedRows.length;
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
        {/* Top Header */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 font-body text-xs uppercase tracking-[0.2em] text-nipah">
              SaringMinda · Politeknik Mukah
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

        {/* Tab Navigation */}
        <nav aria-label="Dashboard Navigation" className="mb-8 flex gap-2 border-b border-straw pb-3">
          <Link
            href="/admin"
            aria-current="page"
            className="rounded-md bg-nipah px-4 py-2 font-body text-sm font-semibold text-white shadow-sm"
          >
            Dashboard Utama (Semua / Pelajar)
          </Link>
          <Link
            href="/admin/pensyarah"
            className="rounded-md px-4 py-2 font-body text-sm font-medium text-charcoal/70 transition hover:bg-straw/50 hover:text-charcoal"
          >
            Dashboard Pensyarah &amp; Staf
          </Link>
        </nav>

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
          <div className="rounded-lg border border-nipah/50 bg-white/70 p-4">
            <p className="font-body text-xs text-charcoal/60">
              Mohon Temujanji
            </p>
            <p className="font-display text-3xl font-bold text-nipah">
              {interestedRows.length}
            </p>
            <p className="font-body text-xs text-charcoal/50">
              {studentReferrals.length} pelajar · {lecturerReferrals.length} staf
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

        <section className="mb-8 rounded-lg border border-nipah/40 bg-white/70 p-6 shadow-sm">
          <h2 className="mb-1 font-display text-xl font-bold text-charcoal">
            Permohonan Temujanji Kaunseling
            {interestedRows.length > 0 ? ` (${interestedRows.length})` : ""}
          </h2>
          <p className="mb-4 font-body text-xs text-charcoal/60">
            Responden (pelajar &amp; pensyarah) yang secara sukarela memberi
            identiti dan bersetuju dihubungi. Sila hubungi mengikut keutamaan —
            kes berbendera krisis dahulu.
          </p>

          {referralsError ? (
            <p className="font-body text-sm text-lacquer">
              Ralat memuatkan permohonan: {referralsError.message}
            </p>
          ) : interestedRows.length === 0 ? (
            <p className="font-body text-sm text-charcoal/70">
              Tiada permohonan temujanji setakat ini.
            </p>
          ) : (
            <ul className="space-y-4">
              {interestedRows.map((r) => {
                const isLecturer = r.user_type === "pensyarah";
                return (
                  <li
                    key={r.id}
                    className={`rounded-lg border p-4 ${
                      r.crisis_flag
                        ? "border-lacquer/50 bg-lacquer/5"
                        : "border-straw bg-sago/40"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-body text-base font-semibold text-charcoal">
                          {r.full_name}
                        </h3>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${
                            isLecturer
                              ? "bg-nipah/20 text-nipah border border-nipah/40"
                              : "bg-charcoal/10 text-charcoal/80 border border-charcoal/20"
                          }`}
                        >
                          {isLecturer ? "Pensyarah / Staf" : "Pelajar"}
                        </span>
                        {r.crisis_flag && (
                          <span className="rounded bg-lacquer px-2 py-0.5 text-xs font-semibold text-white">
                            Krisis
                          </span>
                        )}
                      </div>
                      <span className="font-body text-xs text-charcoal/60">
                        {new Date(r.created_at).toLocaleString("ms-MY", {
                          timeZone: "Asia/Kuala_Lumpur",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <dl className="grid gap-x-6 gap-y-1 font-body text-sm text-charcoal/90 sm:grid-cols-2">
                      <div className="flex gap-2">
                        <dt className="text-charcoal/60">Jantina:</dt>
                        <dd>{r.gender || "—"}</dd>
                      </div>
                      {isLecturer ? (
                        <>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">No. Staf:</dt>
                            <dd>{r.staff_no || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">Kumpulan:</dt>
                            <dd>{r.service_group || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">Jawatan:</dt>
                            <dd>{r.position || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">Jabatan / Unit:</dt>
                            <dd>{r.department || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">Telefon:</dt>
                            <dd>
                              <a
                                href={`tel:${r.phone?.replace(/[^\d+]/g, "")}`}
                                className="text-nipah underline underline-offset-2"
                              >
                                {r.phone}
                              </a>
                            </dd>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">No. Pendaftaran:</dt>
                            <dd>{r.registration_no || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">Jabatan:</dt>
                            <dd>{r.department || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">Kelas / Semester:</dt>
                            <dd>{r.class_name || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-charcoal/60">Telefon:</dt>
                            <dd>
                              <a
                                href={`tel:${r.phone?.replace(/[^\d+]/g, "")}`}
                                className="text-nipah underline underline-offset-2"
                              >
                                {r.phone}
                              </a>
                            </dd>
                          </div>
                        </>
                      )}
                      {r.email && (
                        <div className="flex gap-2">
                          <dt className="text-charcoal/60">E-mel:</dt>
                          <dd>
                            <a
                              href={`mailto:${r.email}`}
                              className="text-nipah underline underline-offset-2"
                            >
                              {r.email}
                            </a>
                          </dd>
                        </div>
                      )}
                      {r.preferred_time && (
                        <div className="flex gap-2">
                          <dt className="text-charcoal/60">Waktu sesuai:</dt>
                          <dd>{r.preferred_time}</dd>
                        </div>
                      )}
                    </dl>

                    {r.notes && (
                      <p className="mt-3 rounded-md border border-straw bg-white/70 px-3 py-2 font-body text-sm italic text-charcoal/80">
                        &ldquo;{r.notes}&rdquo;
                      </p>
                    )}

                    <p className="mt-3 border-t border-straw pt-2 font-body text-xs text-charcoal/70">
                      <span className={bandClass(r.stress_band)}>
                        Stres {r.stress_raw} · {bandLabel(r.stress_band)}
                      </span>
                      {" — "}
                      <span className={bandClass(r.anxiety_band)}>
                        Anzieti {r.anxiety_raw} · {bandLabel(r.anxiety_band)}
                      </span>
                      {" — "}
                      <span className={bandClass(r.depression_band)}>
                        Kemurungan {r.depression_raw} ·{" "}
                        {bandLabel(r.depression_band)}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
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
                          timeZone: "Asia/Kuala_Lumpur",
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
