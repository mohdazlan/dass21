# SaringMinda — Permohonan Temujanji Kaunseling (Referral Worklist)

Panduan untuk kaunselor menggunakan senarai permohonan temujanji (referral worklist) dalam dashboard.

---

## Ringkasan Keseluruhan (Top Section)

Dashboard menunjukkan empat kad statistik utama:

| Kad | Maksud |
|-----|--------|
| **Jumlah Saringan** | Jumlah keseluruhan saringan yang telah diselesaikan |
| **Bendera Krisis** 🚩 | Bilangan saringan yang mencetus bendera krisis (item 21 ≥ 1 ATAU item 10 ≥ 2) |
| **Mohon Temujanji** | Bilangan pelajar yang secara sukarela meminta temujanji + jumlah yang menolak tawaran |
| **Stres/Anzieti/Kemurungan (bukan normal)** | Bilangan saringan dalam setiap subscale yang tidak dalam tahap Normal |

---

## Permohonan Temujanji Kaunseling (Referral Worklist)

### Siapa yang Muncul di Senarai?

Responden (Pelajar atau Pensyarah / Staf) yang:
1. **Mendapat skor Sederhana atau lebih tinggi** dalam sekurang-kurangnya satu subscale, ATAU mencetus bendera krisis
2. **Menerima tawaran temujanji** di halaman hasil (`/keputusan`)
3. **Memilih "Ya, Saya Berminat"** dan memberikan maklumat hubungan mereka mengikut kategori:
   - **Pelajar:** Nama, No. Pendaftaran, Jabatan, Kelas / Semester, Telefon, E-mel.
   - **Pensyarah / Staf:** Nama, No. Staf, Jabatan / Unit, Telefon, E-mel (tiada maklumat semester/kelas).

**Nota:** Responden yang memilih "Tidak, Terima Kasih" tidak muncul dalam senarai — hanya diraih dalam bilangan "menolak tawaran" tanpa identiti.

### Maklumat Setiap Permohonan

Setiap kad dalam senarai menunjukkan:

| Field | Deskripsi |
|-------|-----------|
| **Kategori & Nama** | Nama penuh responden bersama badge `Pelajar` atau `Pensyarah / Staf` (dan badge `Krisis` jika berkenaan) |
| **No. Pendaftaran / No. Staf** | Nombor pendaftaran (pelajar) atau No. Staf/Pekerja (pensyarah) |
| **Kelas / Semester** | Kelas & semester (hanya dipaparkan untuk pelajar) |
| **Jabatan / Unit** | Jabatan atau unit pentadbiran/akademik |
| **Telefon** | Nombor telefon (klik untuk membuat panggilan terus) |
| **E-mel** | Alamat e-mel (klik untuk menulis e-mel) |
| **Waktu Sesuai** | Waktu pilihan untuk dihubungi (cth: Pagi, Petang, Bila-bila masa) |
| **Skor** | Skor mentah dan tahap untuk Stres, Anzieti, Kemurungan |

### Memprioritaskan Permohonan

**Urutan kontak yang disyorkan:**

1. **Krisis dahulu** — Pelajar dengan badge "Krisis" merah (perhatian segera)
2. **Sederhana & Teruk** — Skor yang tinggi dalam subscale mana pun
3. **Ringan** — Permohonan rutin

### Catatan Pelajar

Jika pelajar memberikan catatan (cth: "Saya berasa sangat cemas semasa peperiksaan"), ia akan ditunjukkan dalam kotak kuning di bawah maklumat hubungan — gunakan ini untuk menyediakan diri sebelum pertemuan.

---

## Contoh Kes

### Pelajar A: Krisis (Badge Merah)

```
Ahmad Bin Razak  🚩 Krisis
No. Pendaftaran: A231005
Kelas: Sem 2 Kejuruteraan
Telefon: 019-5551234 (klik untuk panggil)
Waktu sesuai: Jumaat petang saja
Catatan: "Saya risau saya tidak boleh mengikuti ujian"

Stres 18 · Sangat Teruk — Anzieti 11 · Sangat Teruk — Kemurungan 5 · Normal
```

**Tindakan:** Hubungi HARI INI. Skor tinggi dalam Stres dan Anzieti dengan aduan tentang ujian menunjukkan pelajar mungkin mengalami kebimbangan akademik akut.

### Pelajar B: Sederhana

```
Siti Nurhaliza
No. Pendaftaran: B231203
Kelas: Sem 3 Perubatan
Telefon: 012-3456789 (klik untuk panggil)
E-mel: siti.nurhaliza@uni.edu.my
Waktu sesuai: Isnin–Rabu siang
(tiada catatan)

Stres 10 · Sederhana — Anzieti 6 · Ringan — Kemurungan 8 · Sederhana
```

**Tindakan:** Hubungi dalam 2–3 hari bekerja. Stres dan Kemurungan di tahap Sederhana mencadangkan pelajar mendapat manfaat daripada kaunseling untuk kemahiran pengurusan tekanan dan sokongan emosi.

---

## Tata Letak

- **Kad krisis:** Latar merah jambu terang dengan border merah (mudah dikenal pasti)
- **Kad biasa:** Latar putih dengan border kelabu
- **Maklumat dalam baris:** Nama dan tarikh di atas; maklumat hubungan dalam grid dua lajur; skor di bawah

Senarai ini dirancang untuk penilaian cepat dan penempatan panggilan segera.

---

## Sokongan Teknikal

Jika senarai tidak memaparkan:
1. **Muat semula halaman** (F5 atau Cmd+R)
2. **Log keluar dan log masuk semula**
3. Hubungi pentadbir sistem jika ralat berterusan

Jika permohonan baru tidak muncul:
- Pastikan pelajar menyelesaikan saringan penuh dan memilih "Ya, Saya Berminat"
- Halaman biasanya mengemas kini dalam masa 1–2 minit
