"use client";

import { FormEvent, useState } from "react";
import type { ScreeningScores } from "@/lib/scoring";
import { getSupabase } from "@/lib/supabase";

interface ReferralFormProps {
  sessionUuid: string;
  scores: ScreeningScores;
  onSubmitSuccess: () => void;
}

export default function ReferralForm({
  sessionUuid,
  scores,
  onSubmitSuccess,
}: ReferralFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    user_type: "pelajar" as "pelajar" | "pensyarah",
    full_name: "",
    registration_no: "",
    staff_no: "",
    class_name: "",
    department: "",
    phone: "",
    email: "",
    preferred_time: "",
    notes: "",
  });

  const supabase = getSupabase();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !formData.full_name || !formData.phone) return;
    setBusy(true);
    setError(null);

    const isLecturer = formData.user_type === "pensyarah";

    const { error: err } = await supabase.from("counseling_referrals").insert({
      session_uuid: sessionUuid,
      interested: true,
      user_type: formData.user_type,
      full_name: formData.full_name,
      registration_no: isLecturer ? null : formData.registration_no || null,
      staff_no: isLecturer ? formData.staff_no || null : null,
      class_name: isLecturer ? null : formData.class_name || null,
      department: formData.department || null,
      phone: formData.phone || null,
      email: formData.email || null,
      preferred_time: formData.preferred_time || null,
      notes: formData.notes || null,
      stress_raw: scores.stressRaw,
      anxiety_raw: scores.anxietyRaw,
      depression_raw: scores.depressionRaw,
      stress_band: scores.stressBand,
      anxiety_band: scores.anxietyBand,
      depression_band: scores.depressionBand,
      crisis_flag: scores.crisisFlag,
    });

    if (err) {
      setError("Gagal menghantar permohonan. Sila cuba lagi.");
      setBusy(false);
      return;
    }

    setSubmitted(true);
    onSubmitSuccess();
  }

  async function handleDecline() {
    if (!supabase) {
      setDeclined(true);
      onSubmitSuccess();
      return;
    }
    // Record decline: no identity, just a tally
    await supabase.from("counseling_referrals").insert({
      session_uuid: sessionUuid,
      interested: false,
      stress_raw: scores.stressRaw,
      anxiety_raw: scores.anxietyRaw,
      depression_raw: scores.depressionRaw,
      stress_band: scores.stressBand,
      anxiety_band: scores.anxietyBand,
      depression_band: scores.depressionBand,
      crisis_flag: scores.crisisFlag,
    });
    setDeclined(true);
    onSubmitSuccess();
  }

  if (submitted) {
    return (
      <section className="rounded-lg border-2 border-nipah bg-straw/30 p-6">
        <h3 className="mb-2 font-display text-lg font-bold text-charcoal">
          ✅ Permohonan Diterima
        </h3>
        <p className="font-body text-sm text-charcoal/90">
          Terima kasih. Unit Kaunseling akan menghubungi anda dalam masa 2–3 hari
          bekerja menggunakan maklumat yang anda berikan. Jika anda tidak mendengar
          berita, sila hubungi kaunselor institusi anda secara langsung.
        </p>
      </section>
    );
  }

  if (declined) {
    return (
      <section className="rounded-lg border border-straw bg-white/70 p-6">
        <p className="font-body text-sm text-charcoal/80">
          Tiada masalah. Anda tetap boleh meminta bantuan kaunseling pada masa
          depan melalui Unit Kaunseling institusi anda.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-straw bg-white/70 p-6 shadow-sm">
      <h3 className="mb-4 font-display text-lg font-bold text-charcoal">
        Adakah anda berminat mendapatkan temujanji kaunseling?
      </h3>
      <p className="mb-4 font-body text-sm text-charcoal/80">
        Berdasarkan saringan anda, disarankan untuk berjumpa dengan kaunselor
        bagi penilaian lanjut. Anda boleh membekalkan maklumat di bawah agar Unit
        Kaunseling dapat menghubungi anda.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div>
          <label className="mb-1 block font-body text-sm font-medium text-charcoal">
            Nama Penuh <span className="text-lacquer">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-body text-sm font-medium text-charcoal">
              No. Pendaftaran / Matrik
            </label>
            <input
              type="text"
              value={formData.registration_no}
              onChange={(e) =>
                setFormData({ ...formData, registration_no: e.target.value })
              }
              className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah"
            />
          </div>
          <div>
            <label className="mb-1 block font-body text-sm font-medium text-charcoal">
              Kelas
            </label>
            <input
              type="text"
              value={formData.class_name}
              onChange={(e) =>
                setFormData({ ...formData, class_name: e.target.value })
              }
              className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-body text-sm font-medium text-charcoal">
              Telefon <span className="text-lacquer">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="01X-XXXXXXX"
              className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah"
            />
          </div>
          <div>
            <label className="mb-1 block font-body text-sm font-medium text-charcoal">
              E-mel <span className="text-lacquer">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-medium text-charcoal">
            Waktu Sesuai (cth: Isnin–Jumaat selepas 2 PM)
          </label>
          <input
            type="text"
            value={formData.preferred_time}
            onChange={(e) =>
              setFormData({ ...formData, preferred_time: e.target.value })
            }
            className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-medium text-charcoal">
            Catatan (apa yang ingin anda bincangkan?)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-straw bg-sago px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-nipah resize-none"
          />
        </div>

        {error && <p className="font-body text-sm text-lacquer">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-md bg-nipah px-4 py-2 font-body font-semibold text-white transition hover:bg-nipah/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Sedang menghantar…" : "Ya, Saya Berminat"}
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 rounded-md border border-straw bg-sago px-4 py-2 font-body font-semibold text-charcoal transition hover:border-lacquer hover:text-lacquer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            Tidak, Terima Kasih
          </button>
        </div>
      </form>
    </section>
  );
}
