# SaringMinda — DASS-21 Mental Health Screening App

A privacy-first, anonymous mental health screening platform using the DASS-21 (Depression, Anxiety, Stress Scale – 21 items). Built with Next.js 14, Tailwind CSS, Supabase, and the Melanau *terendak* visual identity.

**UI Language:** Bahasa Melayu  
**Screening Tool:** DASS-21 (⚠️ Screening tool, not a diagnostic instrument)

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Apply the Database Schema
Follow **[SETUP_SUPABASE.md](SETUP_SUPABASE.md)** to:
- Set up Supabase
- Apply migrations (`supabase/migrations/001_init.sql`)
- Create counselor accounts

### 4. Run Locally
```bash
npm run dev
```

Visit http://localhost:3000

---

## Core User Flows

### 🔵 Respondent (Anonymous User)

1. **`/`** — Landing page with informed-consent panel (verbatim disclaimer from KKM)
2. **`/saring`** — Complete the 21-item questionnaire (5 minutes)
3. **`/keputusan`** — View results with three severity gauges + action plan

**Privacy:** No login, no personal data collected. Results calculated client-side; submission keyed only by a session UUID (in-memory, not stored locally).

### 🔐 Counselor (Authenticated User)

1. **`/admin/login`** — Email + password authentication
2. **`/admin`** — Dashboard showing:
   - Summary cards (total screenings, crisis flags, elevated counts)
   - Table of results (sorted by date, crisis cases highlighted)
   - Access to all respondent data (keyed by session)

**Access Control:** Only users registered in the `admin_profiles` table can access `/admin` (enforced by Supabase RLS).

---

## Architecture & Key Files

### Pages

| Route | File | Role |
|-------|------|------|
| `/` | `app/page.tsx` | Consent gate + session start |
| `/saring` | `app/saring/page.tsx` | Questionnaire with Supabase fallback |
| `/keputusan` | `app/keputusan/page.tsx` | Results with gauges + crisis panel |
| `/admin/login` | `app/admin/login/page.tsx` | Counselor authentication |
| `/admin` | `app/admin/page.tsx` | Dashboard (requires auth + admin_profiles) |

### Core Logic

| Module | Purpose |
|--------|---------|
| `lib/scoring.ts` | Pure scoring function; band cutoffs from official DASS-21 booklet |
| `lib/session.ts` | In-memory session store (UUID + results; no persistence) |
| `lib/dass21.ts` | Item wording (Bahasa Melayu) + UI labels |
| `lib/supabase.ts` | Client for anon insertions; server client in `lib/supabaseServer.ts` |
| `lib/theme.ts` | Terendak design tokens (colors, fonts) |

### Components

| Component | Use |
|-----------|-----|
| `TerendakMotif.tsx` | Abstract conical hat SVG (subtle background element) |
| `LogoutButton.tsx` | Counselor sign-out |
| `WovenProgress` (in `/saring`) | 21-band progress indicator |
| `SeverityGauge` (in `/keputusan`) | Per-subscale horizontal severity bar |

### Database

| Table | Role | Public Access |
|-------|------|----------------|
| `questions` | DASS-21 items (21 rows, Bahasa Melayu) | Read-only (anon + auth) |
| `responses` | Raw item answers (21 per respondent) | Insert-only (anon) |
| `screening_results` | Aggregate scores + bands + crisis flag | Insert-only (anon) |
| `admin_profiles` | Counselor registrations (email, role) | Read-only (authenticated + in table) |

**RLS Enforces:** Anon can INSERT but not SELECT; only registered counselors can READ data.

### Tests

| Test | Purpose | Run |
|------|---------|-----|
| `tests/scoring.test.ts` | 12 unit tests: band boundaries, crisis logic | `npm test` |
| `tests/rls.check.ts` | Integration: anon insert visibility (optional) | `npm run test:rls` |

---

## Design System

### Terendak Palette

| Name | Hex | Use |
|------|-----|-----|
| **Nipah Gold** | `#C9962E` | Primary accent (buttons, headings) |
| **Woven Straw** | `#E8D9B0` | Borders, subtle fills |
| **Deep Lacquer Red** | `#8E2C21` | High-severity bands, crisis alerts |
| **Charcoal Black** | `#241F1C` | Text (default) |
| **Off-White Sago** | `#FAF6EC` | Page background |

### Typography

- **Display (headings):** Playfair Display serif (or fallback Georgia)
- **Body (text & forms):** Source Sans 3 humanist sans (or fallback Segoe UI)

### Responsive

Mobile-first design verified at 375px and 1440px breakpoints.

---

## Environment Variables

Required (create `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

The app degrades gracefully when unset (consent page, questionnaire, and results all work offline; Supabase saves become best-effort).

---

## Key Behaviors

### Consent Gate
- **Verbatim disclaimer:** "DASS-21 ialah alat saringan, bukan alat diagnosis. Keputusan ini bukan diagnosis klinikal…"
- Button disabled until checkbox ticked
- Session UUID generated on "Mula Saringan" (never stored locally)

### Questionnaire
- 21 items fetched from `questions` table; falls back to bundled wording if unreachable
- Pinned "SEMINGGU YANG LEPAS" banner (recall frame)
- All 21 answers required before submit
- Progress shown as 21 woven bands (alternating nipah/lacquer colors)

### Scoring
- **Raw score:** Sum of 7 items per subscale (0–21)
- **Crisis flag:** `(item 21 ≥ 1) OR (item 10 ≥ 2)` — independent of band severity
- **Bands:** Exact cutoffs from KKM booklet (e.g., Depression: 0–5=Normal, 6–7=Ringan, etc.)

### Results (`/keputusan`)
- Three horizontal gauges, each segmented by its own cutoff bands
- Calm (non-alarming) crisis support panel if flag set
- Pelan Tindakan (action plan) tailored to worst band
- Footer with crisis contacts + "bukan diagnosis" reminder

### Admin Dashboard
- Requires auth + entry in `admin_profiles`
- Summary cards + table of results (100 most recent)
- Crisis rows highlighted (red badge in "Krisis" column)
- No per-user filtering (all counselors see all data)

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in **Settings → Environment Variables**
4. Deploy

### Other Hosts (Netlify, Railway, etc.)

Same pattern: ensure Node 20+ and set the two `NEXT_PUBLIC_*` env vars.

---

## Guides

- **[SETUP_SUPABASE.md](SETUP_SUPABASE.md)** — Step-by-step Supabase configuration, counselor account creation, RLS verification
- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** — How counselors use the dashboard, interpreting results, best practices

---

## Ethics & Privacy

✅ **No Personal Data:** Respondents submit anonymously; no names, IDs, or identifiers collected  
✅ **Session-Scoped:** UUID in memory only; hard refresh wipes the session  
✅ **Secure:** Supabase RLS enforces anon insert-only; authenticated users must be in `admin_profiles` to read  
⚠️ **Screening, Not Diagnosis:** Clear messaging on every results page  
🚨 **Crisis Pathway:** If respondent signals crisis (item 21 ≥ 1 or item 10 ≥ 2), support panel shows HEAL hotline and Befrienders contacts

---

## Troubleshooting

### "Supabase belum dikonfigurasi" on `/admin`
- Check `.env.local` is in project root with both URL and anon key
- Restart `npm run dev`

### Can't log into `/admin`
- Email must be in `admin_profiles` (ask your admin)
- Verify the auth user exists in **Supabase Dashboard → Authentication → Users**

### Questionnaire shows "Tidak ada jawapan betul atau salah" but no items
- Items are fetched from `questions` table (empty or unreachable); app uses bundled fallback
- Check: `NEXT_PUBLIC_SUPABASE_URL` is correct, and `questions` table has 21 rows

### RLS test fails
- Ensure RLS is **enabled** on `responses` and `screening_results` tables (Supabase Dashboard → Table Editor → Row Security toggle)

---

## Future Enhancements

- CSV export for counselors
- Trend charts (screenings over time, band distribution)
- Per-session detail view (all 21 item responses)
- Email notifications for crisis cases
- Multi-language support

---

## License & Attribution

**DASS-21 Instrument:** Lovibond, S. H., & Lovibond, P. F. (1995). Manual for the Depression Anxiety Stress Scales. Psychology Foundation of Australia. *(Screening tool, not for diagnostic purposes.)*

**App:** SaringMinda | Terendak Design | KKM-compliant ethics guidelines

---

## Support

Questions? Refer to:
- `SETUP_SUPABASE.md` for configuration issues
- `ADMIN_GUIDE.md` for dashboard usage
- `tests/` for scoring correctness
- `lib/scoring.ts` for the algorithm

---

**Last Updated:** July 2026  
**Status:** Production-ready (pending your Supabase setup)
