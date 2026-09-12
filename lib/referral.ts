/**
 * Voluntary counsellor-referral intake — content and validation.
 *
 * The screening is anonymous; this is the single opt-in point where a student
 * may identify themselves so the Unit Kaunseling can contact them. Nothing
 * here runs unless the student explicitly chooses "Ya, saya berminat".
 */

/**
 * Jabatan options for the dropdown. Kept as a fixed list so the counsellor's
 * worklist can be grouped and filtered by department without free-text drift.
 *
 * These are the six Politeknik Mukah departments that students are actually
 * enrolled under, cross-checked against the programmes PMU publishes:
 *   JKA   — Diploma Kejuruteraan Awam
 *   JKE   — Diploma Kejuruteraan Elektrik & Elektronik / Elektronik (Komunikasi)
 *   JKM   — Diploma Kejuruteraan Mekanikal
 *   JP    — Diploma Akauntansi / Pengajian Perniagaan / Sains Kesetiausahaan
 *   JTMK  — Diploma Teknologi Maklumat
 *   JMSK  — Pra-Diploma (Sains)
 *
 * Jabatan Pengajian Am is deliberately absent: it teaches general-studies
 * units across programmes but no student is registered under it, so offering
 * it would only produce unusable answers.
 */
export type RespondentType = "pelajar" | "pensyarah";

export const RESPONDENT_TYPE_LABEL_MS: Record<RespondentType, string> = {
  pelajar: "Pelajar",
  pensyarah: "Pensyarah / Staf",
};

/**
 * Jabatan options for students.
 */
export const DEPARTMENTS_MS = [
  "Jabatan Kejuruteraan Awam (JKA)",
  "Jabatan Kejuruteraan Elektrik (JKE)",
  "Jabatan Kejuruteraan Mekanikal (JKM)",
  "Jabatan Perdagangan (JP)",
  "Jabatan Teknologi Maklumat dan Komunikasi (JTMK)",
  "Jabatan Matematik, Sains dan Komputer (JMSK)",
  "Lain-lain",
] as const;

/**
 * Jabatan / Unit options for lecturers and staff members.
 * Includes academic departments (with JPA) and administrative units.
 */
export const STAFF_DEPARTMENTS_MS = [
  "Jabatan Kejuruteraan Awam (JKA)",
  "Jabatan Kejuruteraan Elektrik (JKE)",
  "Jabatan Kejuruteraan Mekanikal (JKM)",
  "Jabatan Perdagangan (JP)",
  "Jabatan Teknologi Maklumat dan Komunikasi (JTMK)",
  "Jabatan Matematik, Sains dan Komputer (JMSK)",
  "Jabatan Pengajian Am (JPA)",
  "Unit Hal Ehwal Pelajar (HEP)",
  "Unit Pentadbiran & Kewangan",
  "Unit Peperiksaan & Penilaian",
  "Unit Latihan & Pendidikan Lanjutan (ULPL)",
  "Unit Psikologi & Kerjaya",
  "Unit Perpustakaan",
  "Lain-lain",
] as const;

/** Optional "bila sesuai dihubungi" choices. */
export const CONTACT_WINDOWS_MS = [
  "Pagi (8:00 – 12:00)",
  "Tengah hari (12:00 – 14:00)",
  "Petang (14:00 – 17:00)",
  "Bila-bila masa",
] as const;

export const REFERRAL_CONSENT_MS =
  "Saya bersetuju maklumat peribadi dan keputusan saringan saya dikongsi " +
  "dengan Unit Kaunseling Politeknik Mukah untuk tujuan menetapkan temujanji.";

/** Fields the respondent fills in. */
export interface ReferralForm {
  userType: RespondentType;
  fullName: string;
  registrationNo: string;
  staffNo: string;
  phone: string;
  department: string;
  className: string;
  email: string;
  preferredTime: string;
  notes: string;
}

export const EMPTY_REFERRAL_FORM: ReferralForm = {
  userType: "pelajar",
  fullName: "",
  registrationNo: "",
  staffNo: "",
  phone: "",
  department: "",
  className: "",
  email: "",
  preferredTime: "",
  notes: "",
};

/** Field name → Bahasa Melayu error message; absent key means valid. */
export type ReferralErrors = Partial<Record<keyof ReferralForm, string>>;

/** Digits only, ignoring the spaces/dashes people type into phone fields. */
function digitCount(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

/**
 * Validates the required fields plus the optional e-mail.
 * For students: requires fullName, registrationNo, department, className, phone.
 * For lecturers/staff: requires fullName, department, phone (no className/semester required).
 */
export function validateReferral(form: ReferralForm): ReferralErrors {
  const errors: ReferralErrors = {};

  if (!form.fullName.trim()) errors.fullName = "Sila isi nama penuh.";
  if (!form.department.trim()) errors.department = "Sila pilih jabatan / unit.";

  if (form.userType === "pelajar") {
    if (!form.registrationNo.trim())
      errors.registrationNo = "Sila isi no. pendaftaran.";
    if (!form.className.trim())
      errors.className = "Sila isi kelas / semester.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Sila isi no. telefon.";
  } else if (digitCount(form.phone) < 9) {
    errors.phone = "No. telefon tidak lengkap (contoh: 013-1234567).";
  }

  // E-mail is optional, but a typo'd address is worse than a blank one.
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Format e-mel tidak sah.";

  return errors;
}

/** Trims every field and turns blanks into null for the database. */
export function normaliseReferral(form: ReferralForm) {
  const clean = (v: string) => (v.trim() ? v.trim() : null);
  const isLecturer = form.userType === "pensyarah";

  return {
    user_type: form.userType,
    full_name: clean(form.fullName),
    registration_no: isLecturer ? null : clean(form.registrationNo),
    staff_no: isLecturer ? clean(form.staffNo) : null,
    phone: clean(form.phone),
    department: clean(form.department),
    class_name: isLecturer ? null : clean(form.className),
    email: clean(form.email),
    preferred_time: clean(form.preferredTime),
    notes: clean(form.notes),
  };
}
