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
  user_type?: "pelajar" | "pensyarah" | null;
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

export default async function AdminPensyarahDashboardPage() {
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
    { data: staffResultsData, error: resultsError },
    { data: referrals, error: referralsError },
  ] = await Promise.all([
    supabase
      .from("screening_results")
      .select("*")
      .eq("user_type", "pensyarah")
      .order("created_at", { ascending: false })
      .limit(600)
      .returns<ScreeningResultRow[]>(),
    supabase
      .from("counseling_referrals")
      .select("*")
      .eq("user_type", "pensyarah")
      .order("created_at", { ascending: false })
      .limit(300)
      .returns<ReferralRow[]>(),
  ]);

  const staffResults = staffResultsData ?? [];
  const staffReferrals = referrals ?? [];
  const interestedRows = staffReferrals.filter((r) => r.interested);
  const declinedCount = staffReferrals.length - interestedRows.length;

  const totalStaffScreenings = staffResults.length;
  const staffCrisisCount = staffResults.filter((r) => r.crisis_flag).length;
  const elevated = (band: SeverityBand) => band !== "normal";

  const elevatedCounts = {
    stress: staffResults.filter((r) => elevated(r.stress_band)).length,
    anxiety: staffResults.filter((r) => elevated(r.anxiety_band)).length,
    depression: staffResults.filter((r) => elevated(r.depression_band)).length,
  };

  // Demographic breakdowns for interested staff
  const serviceGroupCounts: Record<string, number> = {};
  const positionCounts: Record<string, number> = {};
  const genderCounts: Record<string, number> = {};
  const departmentCounts: Record<string, number> = {};

  interestedRows.forEach((r) => {
    if (r.service_group) {
      serviceGroupCounts[r.service_group] = (serviceGroupCounts[r.service_group] || 0) + 1;
    }
    if (r.position) {
      positionCounts[r.position] = (positionCounts[r.position] || 0) + 1;
    }
    if (r.gender) {
      genderCounts[r.gender] = (genderCounts[r.gender] || 0) + 1;
    }
    if (r.department) {
      departmentCounts[r.department] = (departmentCounts[r.department] || 0) + 1;
    }
  });

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
              Dashboard Pensyarah &amp; Staf
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
            className="rounded-md px-4 py-2 font-body text-sm font-medium text-charcoal/70 transition hover:bg-straw/50 hover:text-charcoal"
          >
            Dashboard Utama (Semua / Pelajar)
          </Link>
          <Link
            href="/admin/pensyarah"
            aria-current="page"
            className="rounded-md bg-nipah px-4 py-2 font-body text-sm font-semibold text-white shadow-sm"
          >
            Dashboard Pensyarah &amp; Staf
          </Link>
        </nav>

        {/* Primary Summary Metric Cards */}
        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-straw bg-white/70 p-4 shadow-sm">
            <p className="font-body text-xs text-charcoal/60">
              Saringan Staf
            </p>
            <p className="font-display text-3xl font-bold text-charcoal">
              {totalStaffScreenings}
            </p>
            <p className="font-body text-xs text-charcoal/50">
              Keseluruhan staf
            </p>
          </div>
          <div className="rounded-lg border border-lacquer/40 bg-white/70 p-4 shadow-sm">
            <p className="font-body text-xs text-charcoal/60">Bendera Krisis</p>
            <p className="font-display text-3xl font-bold text-lacquer">
              {staffCrisisCount}
            </p>
            <p className="font-body text-xs text-charcoal/50">Perhatian segera</p>
          </div>
          <div className="rounded-lg border border-nipah/50 bg-white/70 p-4 shadow-sm">
            <p className="font-body text-xs text-charcoal/60">
              Mohon Temujanji
            </p>
            <p className="font-display text-3xl font-bold text-nipah">
              {interestedRows.length}
            </p>
            <p className="font-body text-xs text-charcoal/50">
              {declinedCount} tolak tawaran
            </p>
          </div>
          {(["stress", "anxiety", "depression"] as const).map((sub) => (
            <div key={sub} className="rounded-lg border border-straw bg-white/70 p-4 shadow-sm">
              <p className="font-body text-xs text-charcoal/60">
                {SUBSCALE_LABEL_MS[sub]} (staf)
              </p>
              <p className="font-display text-3xl font-bold text-charcoal">
                {elevatedCounts[sub]}
              </p>
              <p className="font-body text-xs text-charcoal/50">Tahap Ringan+</p>
            </div>
          ))}
        </section>

        {/* Demographic Breakdown Panels */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {/* Kumpulan Perkhidmatan Breakdown */}
          <div className="rounded-lg border border-straw bg-white/70 p-4 shadow-sm">
            <h3 className="mb-3 font-display text-sm font-bold text-charcoal">
              Kumpulan Perkhidmatan
            </h3>
            <ul className="space-y-2 font-body text-xs">
              {[
                "Pengurusan Tertinggi",
                "Pengurusan & Professional",
                "Pelaksana",
              ].map((group) => (
                <li key={group} className="flex items-center justify-between border-b border-straw/40 pb-1">
                  <span className="text-charcoal/80">{group}</span>
                  <span className="rounded bg-sago px-2 py-0.5 font-semibold text-charcoal">
                    {serviceGroupCounts[group] || 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Jawatan / Skim Breakdown */}
          <div className="rounded-lg border border-straw bg-white/70 p-4 shadow-sm">
            <h3 className="mb-3 font-display text-sm font-bold text-charcoal">
              Jawatan &amp; Skim
            </h3>
            <ul className="space-y-2 font-body text-xs">
              {["DH", "Sokongan Akademik"].map((pos) => (
                <li key={pos} className="flex items-center justify-between border-b border-straw/40 pb-1">
                  <span className="text-charcoal/80">{pos}</span>
                  <span className="rounded bg-sago px-2 py-0.5 font-semibold text-charcoal">
                    {positionCounts[pos] || 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Jantina Breakdown */}
          <div className="rounded-lg border border-straw bg-white/70 p-4 shadow-sm">
            <h3 className="mb-3 font-display text-sm font-bold text-charcoal">
              Jantina
            </h3>
            <ul className="space-y-2 font-body text-xs">
              {["Lelaki", "Perempuan"].map((gender) => (
                <li key={gender} className="flex items-center justify-between border-b border-straw/40 pb-1">
                  <span className="text-charcoal/80">{gender}</span>
                  <span className="rounded bg-sago px-2 py-0.5 font-semibold text-charcoal">
                    {genderCounts[gender] || 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Jabatan / Unit Breakdown */}
        {Object.keys(departmentCounts).length > 0 && (
          <section className="mb-8 rounded-lg border border-straw bg-white/70 p-4 shadow-sm">
            <h3 className="mb-3 font-display text-sm font-bold text-charcoal">
              Pecahan Mengikut Jabatan / Unit
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {Object.entries(departmentCounts).map(([dept, count]) => (
                <div key={dept} className="rounded border border-straw/60 bg-sago/50 p-2 text-xs font-body">
                  <p className="truncate font-medium text-charcoal" title={dept}>
                    {dept}
                  </p>
                  <p className="mt-1 font-semibold text-nipah">{count} permohonan</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Referral Worklist: Pensyarah & Staf */}
        <section className="mb-8 rounded-lg border border-nipah/40 bg-white/70 p-6 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal">
                Senarai Permohonan Temujanji Pensyarah &amp; Staf
                {interestedRows.length > 0 ? ` (${interestedRows.length})` : ""}
              </h2>
              <p className="mt-1 font-body text-xs text-charcoal/60">
                Maklumat sulit staf dan pensyarah yang memohon sesi temujanji kaunseling secara sukarela.
              </p>
            </div>
          </div>

          {referralsError ? (
            <p className="font-body text-sm text-lacquer">
              Ralat memuatkan permohonan: {referralsError.message}
            </p>
          ) : interestedRows.length === 0 ? (
            <p className="font-body text-sm text-charcoal/70">
              Tiada permohonan temujanji daripada pensyarah atau staf setakat ini.
            </p>
          ) : (
            <ul className="space-y-4">
              {interestedRows.map((r) => (
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
                      <span className="rounded border border-nipah/40 bg-nipah/20 px-2 py-0.5 text-xs font-semibold text-nipah">
                        Pensyarah / Staf
                      </span>
                      {r.position && (
                        <span className="rounded border border-charcoal/20 bg-white/80 px-2 py-0.5 text-xs font-medium text-charcoal">
                          {r.position}
                        </span>
                      )}
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
                    <div className="flex gap-2">
                      <dt className="text-charcoal/60">No. Staf / Pekerja:</dt>
                      <dd>{r.staff_no || "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-charcoal/60">Kumpulan Perkhidmatan:</dt>
                      <dd>{r.service_group || "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-charcoal/60">Jawatan / Skim:</dt>
                      <dd>{r.position || "—"}</dd>
                    </div>
                    <div className="flex gap-2 sm:col-span-2">
                      <dt className="text-charcoal/60">Jabatan / Unit:</dt>
                      <dd>{r.department || "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-charcoal/60">Telefon:</dt>
                      <dd>
                        <a
                          href={`tel:${r.phone?.replace(/[^\d+]/g, "")}`}
                          className="font-medium text-nipah underline underline-offset-2"
                        >
                          {r.phone}
                        </a>
                      </dd>
                    </div>
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
                      <div className="flex gap-2 sm:col-span-2">
                        <dt className="text-charcoal/60">Waktu sesuai dihubungi:</dt>
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
              ))}
            </ul>
          )}
        </section>

        {/* Recent Screenings Table */}
        <section className="rounded-lg border border-straw bg-white/70 p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold text-charcoal">
            Saringan Terkini Pensyarah &amp; Staf
            {staffResults.length > 0 ? ` (${staffResults.length})` : ""}
          </h2>

          {resultsError ? (
            <p className="font-body text-sm text-lacquer">
              Ralat memuatkan data: {resultsError.message}
            </p>
          ) : staffResults.length === 0 ? (
            <div className="rounded-lg border border-straw/60 bg-sago/40 p-6 text-center">
              <p className="font-body text-sm font-medium text-charcoal">
                Tiada rekod saringan pensyarah atau staf direkodkan setakat ini.
              </p>
              <p className="mt-1 font-body text-xs text-charcoal/60">
                Pensyarah dan staf boleh menjawab saringan di pautan{" "}
                <Link href="/pensyarah" className="text-nipah underline font-medium">
                  /pensyarah
                </Link>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-straw text-left text-charcoal/70">
                    <th className="py-2 pr-3">Tarikh</th>
                    <th className="py-2 pr-3">Kategori</th>
                    <th className="py-2 pr-3">Stres</th>
                    <th className="py-2 pr-3">Anzieti</th>
                    <th className="py-2 pr-3">Kemurungan</th>
                    <th className="py-2">Krisis</th>
                  </tr>
                </thead>
                <tbody>
                  {staffResults.map((r) => (
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
                      <td className="py-2 pr-3">
                        <span className="rounded bg-nipah/10 px-2 py-0.5 text-xs font-semibold text-nipah">
                          Pensyarah / Staf
                        </span>
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
