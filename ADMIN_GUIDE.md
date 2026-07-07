# SaringMinda — Counselor Dashboard Guide

This guide explains how to use the admin dashboard to view and interpret screening results.

---

## Logging In

1. Visit: **`/admin/login`** (or click a link from your institution's portal)
2. Enter your **email** and **password**
3. Click **Log Masuk**

> **If you see "Tiada Akses":** Your account hasn't been registered as a counselor yet. Contact your system administrator with your email address.

---

## The Dashboard Overview

Once logged in, you see:

### Summary Cards (Top Section)

Four key metrics at a glance:

| Card | Meaning |
|------|---------|
| **Jumlah Saringan** | Total screenings completed so far |
| **Bendera Krisis** 🚩 | How many flagged the crisis pathway (item 21 ≥ 1 OR item 10 ≥ 2) |
| **Stres (bukan normal)** | Screenings where stress is Ringan or higher |
| **Anzieti (bukan normal)** | Screenings where anxiety is Ringan or higher |
| **Kemurungan (bukan normal)** | Screenings where depression is Ringan or higher |

---

## The Results Table

Below the cards, a table of the **100 most recent screenings**:

| Column | What It Shows |
|--------|---------------|
| **Tarikh** | When the screening was completed (date + time) |
| **Stres** | Raw score (0–21) + severity band (Normal/Ringan/Sederhana/Teruk/Sangat Teruk) |
| **Anzieti** | Raw score + severity band |
| **Kemurungan** | Raw score + severity band |
| **Krisis** | "Ya" (red badge) if crisis flag is set; "—" otherwise |

### Severity Band Colors

| Band | Styling |
|------|---------|
| **Normal** | Light gray text (mild concern) |
| **Ringan** / **Sederhana** | Nipah gold (moderate — consider follow-up) |
| **Teruk** / **Sangat Teruk** | Lacquer red (high concern — prioritize) |

### Crisis Rows

Rows where the **Krisis** column shows "Ya" are highlighted with a light red background. These respondents:
- Answered item 21 ("Saya rasa hidup ini tidak bererti lagi") as 1 or higher, **OR**
- Answered item 10 ("Saya rasa tidak ada apa yang saya harapkan") as 2 or higher

⚠️ **Action:** Consider reaching out to these respondents for a follow-up conversation or assessment.

---

## Understanding the Scores

### What is a "Raw Score"?

Each subscale (Stress, Anxiety, Depression) has 7 questions. Each question is scored 0–3:
- **0** = Tidak pernah sama sekali (Never)
- **1** = Jarang (Rarely)
- **2** = Kerap (Often)
- **3** = Sangat kerap (Very often)

**Raw Score** = sum of those 7 responses (range: 0–21)

### Severity Bands (SKOR SARINGAN)

The cutoff tables from the official DASS-21 booklet:

#### Kemurungan (Depression)
| Band | Range |
|------|-------|
| Normal | 0–5 |
| Ringan | 6–7 |
| Sederhana | 8–10 |
| Teruk | 11–14 |
| Sangat Teruk | 15+ |

#### Anzieti (Anxiety)
| Band | Range |
|------|-------|
| Normal | 0–4 |
| Ringan | 5–6 |
| Sederhana | 7–8 |
| Teruk | 9–10 |
| Sangat Teruk | 11+ |

#### Stres (Stress)
| Band | Range |
|------|-------|
| Normal | 0–7 |
| Ringan | 8–9 |
| Sederhana | 10–13 |
| Teruk | 14–17 |
| Sangat Teruk | 18+ |

---

## Interpreting a Screening Result

### Example: Stres 14 · Teruk

- **Raw score of 14** on the Stress subscale
- Falls in the **Teruk (Severe)** band
- Indicates the respondent is experiencing significant stress over the past week

**Next step:** Consider a counselor-led assessment conversation.

### Example: Kemurungan 2 · Normal

- **Raw score of 2** on the Depression subscale
- Firmly in the **Normal** band
- Low depressive symptoms reported

**Next step:** Monitor on follow-up screenings; no immediate action needed.

---

## How Data is Collected

✅ **Anonymous**: Responses are NOT linked to the respondent's name or ID.  
✅ **Session-based**: Each screening has a unique session UUID (visible as a column in the DB, if exported).  
✅ **Private**: Respondents don't need to log in.  
⚠️ **Important**: DASS-21 is a **screening tool, not a diagnosis** — results should inform further assessment, not replace clinical judgment.

---

## Logging Out

Click **Log Keluar** (Logout) in the top-right corner to end your session.

---

## Troubleshooting

### Table shows "Tiada saringan direkodkan lagi"

No screening data has been submitted yet. Share the screening link with respondents:
- **URL:** `https://yourapp.domain/` (the home page)
- **QR Code:** Generate from your institution's portal or web server

### "Ralat memuatkan data"

Your database connection may have timed out. Try:
1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Log out and log back in**
3. If the issue persists, contact your system administrator

### Can't log in

- Verify your **email address** is correct
- Check that your account was registered in `admin_profiles` (your admin should confirm)
- Try **resetting your password** via the login page (if a reset option appears)

---

## Best Practices

1. **Regular reviews**: Check the dashboard weekly to spot trends
2. **Crisis response**: Prioritize the "Bendera Krisis" red cases — these respondents may benefit from outreach
3. **Aggregate insights**: Use the summary cards to understand population-level stress, anxiety, and depression patterns
4. **Follow-ups**: Combine dashboard data with direct counselor assessments — screenings are one input, not the full picture
5. **Privacy**: Never share individual scores publicly; use aggregated/anonymized data only

---

## Questions or Feedback?

Contact your system administrator or refer to the project documentation in:
- `SETUP_SUPABASE.md` — database and auth setup
- `lib/scoring.ts` — scoring algorithm details
- `supabase/migrations/001_init.sql` — database schema and RLS policies
