"use client";

import { useState } from "react";
import {
  CONTACT_WINDOWS_MS,
  DEPARTMENTS_MS,
  STAFF_DEPARTMENTS_MS,
  GENDER_OPTIONS_MS,
  SERVICE_GROUPS_MS,
  POSITIONS_MS,
  EMPTY_REFERRAL_FORM,
  REFERRAL_CONSENT_MS,
  validateReferral,
  type ReferralErrors,
  type ReferralForm,
  type RespondentType,
} from "@/lib/referral";
import type { ScreeningScores } from "@/lib/scoring";
import { getSessionUserType } from "@/lib/session";
import { saveReferral } from "@/lib/supabase";

type Stage = "asking" | "form" | "sent" | "declined";

const FIELD_CLASS =
  "w-full rounded-md border border-straw bg-white px-3 py-2 font-body text-sm text-charcoal placeholder:text-charcoal/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal";

const LABEL_CLASS = "mb-1 block font-body text-sm font-medium text-charcoal";

/** A labelled text input with inline validation message. */
function Field({
  id,
  label,
  value,
  error,
  onChange,
  required = false,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: keyof ReferralForm;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
        {required && <span className="text-lacquer"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={FIELD_CLASS}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 font-body text-xs text-lacquer">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Voluntary counsellor-appointment offer, shown on the results page when the
 * screening reaches the referral threshold. Declining is recorded anonymously;
 * only an explicit "Ya" ever collects identifying details.
 */
export default function CounselorReferral({
  sessionUuid,
  scores,
}: {
  sessionUuid: string;
  scores: ScreeningScores;
}) {
  const [stage, setStage] = useState<Stage>("asking");
  const [form, setForm] = useState<ReferralForm>(() => ({
    ...EMPTY_REFERRAL_FORM,
    userType: getSessionUserType() ?? "pelajar",
  }));
  const [errors, setErrors] = useState<ReferralErrors>({});
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update(field: keyof ReferralForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the field's error as soon as the respondent starts fixing it.
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleTypeChange(newType: RespondentType) {
    setForm((prev) => ({
      ...prev,
      userType: newType,
      department: "", // reset department because options differ
      className: "",
      registrationNo: "",
      staffNo: "",
      serviceGroup: "",
      position: "",
    }));
    setErrors({});
  }

  async function decline() {
    setSubmitting(true);
    // Anonymous tally only — no identity is sent, and a failed write must not
    // block a respondent who has already said no.
    await saveReferral(sessionUuid, scores);
    setSubmitting(false);
    setStage("declined");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const found = validateReferral(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    const result = await saveReferral(sessionUuid, scores, form);
    setSubmitting(false);

    if (result.ok) setStage("sent");
    else setSubmitError(result.message);
  }

  if (stage === "declined") {
    return (
      <section className="mb-8 rounded-lg border border-straw bg-white/70 p-6 shadow-sm">
        <h2 className="mb-2 font-display text-xl font-bold text-charcoal">
          Baik, tiada masalah
        </h2>
        <p className="font-body text-sm leading-relaxed text-charcoal/90">
          Pilihan itu sepenuhnya milik anda. Jika anda berubah fikiran nanti,
          anda boleh datang terus ke Unit Kaunseling Politeknik Mukah pada
          bila-bila masa, atau ulang saringan ini semula.
        </p>
      </section>
    );
  }

  if (stage === "sent") {
    return (
      <section
        aria-live="polite"
        className="mb-8 rounded-lg border-2 border-nipah bg-straw/40 p-6"
      >
        <h2 className="mb-2 font-display text-xl font-bold text-charcoal">
          Permohonan Anda Telah Dihantar
        </h2>
        <p className="mb-3 font-body text-sm leading-relaxed text-charcoal/90">
          Terima kasih kerana mengambil langkah ini,{" "}
          <span className="font-semibold">{form.fullName.trim()}</span>. Unit
          Kaunseling Politeknik Mukah akan menghubungi anda di talian{" "}
          <span className="font-semibold">{form.phone.trim()}</span> untuk
          menetapkan temujanji.
        </p>
        <p className="font-body text-sm leading-relaxed text-charcoal/80">
          Jika anda memerlukan bantuan segera sebelum itu, sila hubungi Talian
          HEAL{" "}
          <a
            href="tel:15555"
            className="font-semibold text-lacquer underline underline-offset-2"
          >
            15555
          </a>{" "}
          atau datang terus ke Unit Kaunseling.
        </p>
      </section>
    );
  }

  const isLecturer = form.userType === "pensyarah";
  const departmentOptions = isLecturer ? STAFF_DEPARTMENTS_MS : DEPARTMENTS_MS;

  return (
    <section
      aria-labelledby="referral-heading"
      className="mb-8 rounded-lg border border-straw bg-white/70 p-6 shadow-sm"
    >
      <h2
        id="referral-heading"
        className="mb-2 font-display text-xl font-bold text-charcoal"
      >
        Berjumpa Kaunselor
      </h2>
      <p className="mb-5 font-body text-sm leading-relaxed text-charcoal/90">
        Berdasarkan keputusan anda, berbual dengan kaunselor mungkin membantu.
        Sesi ini percuma dan sulit. Adakah anda berminat untuk ditemujanjikan
        dengan kaunselor Politeknik Mukah?
      </p>

      {stage === "asking" && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setStage("form")}
            className="flex-1 rounded-md bg-nipah px-6 py-3 font-body font-semibold text-white transition hover:bg-nipah/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal motion-reduce:transition-none"
          >
            Ya, saya berminat
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={decline}
            className="flex-1 rounded-md border border-straw bg-sago px-6 py-3 font-body font-semibold text-charcoal transition hover:border-nipah focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:opacity-40 motion-reduce:transition-none"
          >
            {submitting ? "Sebentar…" : "Tidak, terima kasih"}
          </button>
        </div>
      )}

      {stage === "form" && (
        <form onSubmit={submit} noValidate className="space-y-4">
          <p className="rounded-md border border-straw bg-sago px-4 py-3 font-body text-xs leading-relaxed text-charcoal/80">
            Bahagian ini sahaja yang meminta identiti anda. Maklumat di bawah
            hanya dilihat oleh kaunselor berdaftar Unit Kaunseling dan digunakan
            semata-mata untuk menghubungi anda. Medan bertanda{" "}
            <span className="text-lacquer">*</span> wajib diisi.
          </p>

          {/* Role selector tab: Pelajar vs Pensyarah / Staf */}
          <div>
            <label className={LABEL_CLASS}>Kategori Anda</label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-straw bg-sago p-1">
              <button
                type="button"
                onClick={() => handleTypeChange("pelajar")}
                className={`rounded-md py-2 font-body text-sm font-semibold transition ${
                  form.userType === "pelajar"
                    ? "bg-nipah text-white shadow-sm"
                    : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                Pelajar
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("pensyarah")}
                className={`rounded-md py-2 font-body text-sm font-semibold transition ${
                  form.userType === "pensyarah"
                    ? "bg-nipah text-white shadow-sm"
                    : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                Pensyarah / Staf
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="fullName"
              label="Nama Penuh"
              value={form.fullName}
              error={errors.fullName}
              onChange={(v) => update("fullName", v)}
              required
              autoComplete="name"
            />
            <div>
              <label htmlFor="gender" className={LABEL_CLASS}>
                Jantina <span className="text-lacquer">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                aria-required
                aria-invalid={errors.gender ? true : undefined}
                aria-describedby={errors.gender ? "gender-error" : undefined}
                className={FIELD_CLASS}
              >
                <option value="">— Sila pilih jantina —</option>
                {GENDER_OPTIONS_MS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p id="gender-error" className="mt-1 font-body text-xs text-lacquer">
                  {errors.gender}
                </p>
              )}
            </div>
          </div>

          {isLecturer ? (
            /* Lecturer / Staff Fields (No semester / class value) */
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="staffNo"
                  label="No. Staf / Pekerja (pilihan)"
                  value={form.staffNo}
                  error={errors.staffNo}
                  onChange={(v) => update("staffNo", v)}
                  placeholder="Contoh: S10234"
                />
                <Field
                  id="phone"
                  label="No. Telefon"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(v) => update("phone", v)}
                  required
                  type="tel"
                  placeholder="Contoh: 013-1234567"
                  autoComplete="tel"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="serviceGroup" className={LABEL_CLASS}>
                    Kumpulan Perkhidmatan <span className="text-lacquer">*</span>
                  </label>
                  <select
                    id="serviceGroup"
                    name="serviceGroup"
                    value={form.serviceGroup}
                    onChange={(e) => update("serviceGroup", e.target.value)}
                    aria-required
                    aria-invalid={errors.serviceGroup ? true : undefined}
                    aria-describedby={
                      errors.serviceGroup ? "serviceGroup-error" : undefined
                    }
                    className={FIELD_CLASS}
                  >
                    <option value="">— Sila pilih kumpulan perkhidmatan —</option>
                    {SERVICE_GROUPS_MS.map((sg) => (
                      <option key={sg} value={sg}>
                        {sg}
                      </option>
                    ))}
                  </select>
                  {errors.serviceGroup && (
                    <p
                      id="serviceGroup-error"
                      className="mt-1 font-body text-xs text-lacquer"
                    >
                      {errors.serviceGroup}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="position" className={LABEL_CLASS}>
                    Jawatan <span className="text-lacquer">*</span>
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={form.position}
                    onChange={(e) => update("position", e.target.value)}
                    aria-required
                    aria-invalid={errors.position ? true : undefined}
                    aria-describedby={
                      errors.position ? "position-error" : undefined
                    }
                    className={FIELD_CLASS}
                  >
                    <option value="">— Sila pilih jawatan —</option>
                    {POSITIONS_MS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  {errors.position && (
                    <p
                      id="position-error"
                      className="mt-1 font-body text-xs text-lacquer"
                    >
                      {errors.position}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="department" className={LABEL_CLASS}>
                  Jabatan / Unit <span className="text-lacquer">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                  aria-required
                  aria-invalid={errors.department ? true : undefined}
                  aria-describedby={
                    errors.department ? "department-error" : undefined
                  }
                  className={FIELD_CLASS}
                >
                  <option value="">— Sila pilih —</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p
                    id="department-error"
                    className="mt-1 font-body text-xs text-lacquer"
                  >
                    {errors.department}
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Student Fields (Includes registration number & class/semester) */
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="registrationNo"
                  label="No. Pendaftaran"
                  value={form.registrationNo}
                  error={errors.registrationNo}
                  onChange={(v) => update("registrationNo", v)}
                  required
                  placeholder="Contoh: 21DKA23F1001"
                />
                <Field
                  id="phone"
                  label="No. Telefon"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(v) => update("phone", v)}
                  required
                  type="tel"
                  placeholder="Contoh: 013-1234567"
                  autoComplete="tel"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="department" className={LABEL_CLASS}>
                    Jabatan <span className="text-lacquer">*</span>
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={(e) => update("department", e.target.value)}
                    aria-required
                    aria-invalid={errors.department ? true : undefined}
                    aria-describedby={
                      errors.department ? "department-error" : undefined
                    }
                    className={FIELD_CLASS}
                  >
                    <option value="">— Sila pilih —</option>
                    {departmentOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p
                      id="department-error"
                      className="mt-1 font-body text-xs text-lacquer"
                    >
                      {errors.department}
                    </p>
                  )}
                </div>

                <Field
                  id="className"
                  label="Kelas / Semester"
                  value={form.className}
                  error={errors.className}
                  onChange={(v) => update("className", v)}
                  required
                  placeholder="Contoh: DKA 3A / Sem 3"
                />
              </div>
            </>
          )}

          <Field
            id="email"
            label="E-mel (pilihan)"
            value={form.email}
            error={errors.email}
            onChange={(v) => update("email", v)}
            type="email"
            placeholder={
              isLecturer
                ? "nama@pmu.edu.my"
                : "nama@student.mypolycc.edu.my"
            }
            autoComplete="email"
          />

          <div>
            <label htmlFor="preferredTime" className={LABEL_CLASS}>
              Waktu sesuai untuk dihubungi (pilihan)
            </label>
            <select
              id="preferredTime"
              name="preferredTime"
              value={form.preferredTime}
              onChange={(e) => update("preferredTime", e.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">— Tiada pilihan khusus —</option>
              {CONTACT_WINDOWS_MS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className={LABEL_CLASS}>
              Apa yang ingin anda bincangkan? (pilihan)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={500}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Anda boleh tulis secara ringkas, atau biarkan kosong."
              className={`${FIELD_CLASS} resize-y`}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 font-body text-sm text-charcoal">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-nipah focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
            />
            <span>{REFERRAL_CONSENT_MS}</span>
          </label>

          {submitError && (
            <p
              role="alert"
              className="rounded-md border border-lacquer/40 bg-lacquer/5 px-4 py-3 font-body text-sm text-lacquer"
            >
              {submitError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={!consented || submitting}
              className="flex-1 rounded-md bg-lacquer px-6 py-3 font-body font-semibold text-white transition hover:bg-lacquer/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            >
              {submitting ? "Menghantar…" : "Hantar Permohonan"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setStage("asking");
                setSubmitError(null);
              }}
              className="rounded-md border border-straw bg-sago px-6 py-3 font-body text-charcoal transition hover:border-nipah focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:opacity-40 motion-reduce:transition-none"
            >
              Kembali
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
