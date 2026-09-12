# Permohonan Temujanji Kaunseling — Feature Summary

Feature untuk pelajar dan pensyarah/staf meminta temujanji kaunseling berdasarkan keputusan saringan mereka.

## 🎯 Objektif

Memudahkan pelajar dan pensyarah/staf yang mendapat skor Sederhana atau lebih tinggi (atau mencetus krisis) untuk secara sukarela meminta temujanji dengan Unit Kaunseling, sambil menjaga privasi mereka yang menolak tawaran.

---

## 🔧 Komponen Teknikal

### 1. Pangkalan Data (`002_counseling_referrals.sql` + `003_add_lecturer_support.sql`)

```sql
counseling_referrals
├── id (primary key)
├── session_uuid (FK dari screening session)
├── interested (boolean: true=Ya, false=Tidak)
├── user_type (text: 'pelajar' | 'pensyarah')
├── full_name, registration_no, staff_no, phone, email, etc. (NULL jika interested=false)
├── department, class_name (class_name NULL untuk pensyarah)
├── stress_raw, anxiety_raw, depression_raw (skor pada masa permohonan)
├── stress_band, anxiety_band, depression_band (tahap pada masa permohonan)
├── crisis_flag (boolean)
└── created_at (timestamp)
```

**RLS:**
- Anon boleh INSERT (responden menghantar sendiri)
- Anon TIDAK boleh SELECT (tiada kebocoran identiti)
- Staff boleh SELECT semua

### 2. Borang Responden (`CounselorReferral.tsx`)

Muncul pada halaman hasil (`/keputusan`) apabila:
- Skor ≥ Sederhana dalam mana-mana subscale, ATAU
- Crisis flag aktif

**Pilihan Kategori:**
- **Pelajar:** Nama Penuh *, No. Pendaftaran *, Jabatan *, Kelas/Semester *, No. Telefon *, E-mel, Waktu sesuai, Catatan.
- **Pensyarah / Staf:** Nama Penuh *, No. Staf/Pekerja (pilihan), Jabatan/Unit * (termasuk JPA dan unit pentadbiran), No. Telefon *, E-mel, Waktu sesuai, Catatan. **(Tiada medan semester/kelas).**

**Butang:**
- "Ya, Saya Berminat" → Simpan dengan identiti mengikut kategori
- "Tidak, Terima Kasih" → Simpan tanpa identiti (tally sahaja)

### 3. Dashboard Kaunselor (`/admin`)

**Bahagian Atas — Statistik:**
- Jumlah Saringan
- Bendera Krisis
- **Mohon Temujanji** (pecahan pelajar & pensyarah/staf + bilangan penolakan)
- Stres/Anzieti/Kemurungan (bukan normal)

**Bahagian Tengah — Permohonan Temujanji:**
- Senarai kad kompak (max 200 most recent)
- Badge kategori: `Pelajar` vs `Pensyarah / Staf`
- Badge `Krisis` jika berkenaan
- Memaparkan No. Staf & Jabatan/Unit bagi pensyarah, atau No. Pendaftaran, Jabatan & Kelas bagi pelajar
- Telefon (clickable tel: link)
- E-mel (clickable mailto: link)
- Waktu sesuai & Catatan
- Skor + tahap subscale
- Urutan: paling baru dahulu

**Bahagian Bawah — Saringan Terkini:**
- Sama seperti sebelumnya (100 most recent)

---

## 📋 Alur Pelajar

1. **Selesaikan saringan** → `/keputusan`
2. **Lihat hasil** → Tiga gauge + Pelan Tindakan + Crisis panel (jika berkenaan)
3. **Tawaran temujanji?** (jika skor Sederhana+)
   - "Ya" → Borang (identiti diperlukan) → "Permohonan Diterima"
   - "Tidak" → Tally sahaja
4. Kaunselor akan menghubungi dalam 2–3 hari jika "Ya"

---

## 📊 Alur Kaunselor

1. **Log masuk** → `/admin/login`
2. **Dashboard** → Lihat statistik & permohonan
3. **Permohonan Temujanji:**
   - Lihat senarai pelajar yang berminat
   - Klik telefon/e-mel untuk hubungi
   - Prioritas: Krisis dahulu → Sederhana/Teruk → Ringan
4. **Cek hasil anonim** → Bahagian "Saringan Terkini" (tanpa identiti)

---

## 🔐 Privasi & Keamanan

✅ **Anonim secara default** — Saringan asal tiada identiti  
✅ **Opt-in identiti** — Hanya diberi jika pelajar memilih "Ya"  
✅ **Penolakan bisu** — Pilihan "Tidak" tidak dicatat dengan identiti  
✅ **RLS ketat** — Anon INSERT sahaja, tiada SELECT kembali

---

## 📝 Dokumentasi untuk Kaunselor

Rujuk: `REFERRAL_GUIDE.md`
- Cara membaca senarai
- Memprioritaskan permohonan
- Contoh kes (Krisis vs Sederhana)
- Tata letak & intuitif

---

## ✅ Senarai Semakan Pengurusan

Sebelum diluncurkan:

- [ ] Migration 002_counseling_referrals.sql telah dijalankan
- [ ] ReferralForm muncul pada /keputusan (test dengan skor Sederhana+)
- [ ] Admin dashboard menunjukkan permohonan temujanji (test dengan "Ya")
- [ ] Pengujian RLS: "Tidak" tidak muncul dalam senarai
- [ ] Kaunselor boleh mengklik telefon & e-mel untuk menghubungi
- [ ] Crisis highlighting berfungsi (badge merah pada krisis)

---

## 🚀 Deployment

1. Run 002 migration di Supabase Dashboard
2. Test end-to-end: Respondent → Form → Admin views
3. Dokumentasi boleh dibahagikan kepada kaunselor

---

**Status:** Production-ready  
**Last Updated:** August 2026
