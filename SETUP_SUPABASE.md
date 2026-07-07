# SaringMinda — Supabase Setup Guide

This guide walks you through configuring Supabase to power the DASS-21 screening app, applying the database schema, and accessing the counselor dashboard.

## Prerequisites

- A Supabase project created (free tier is fine)
- `.env.local` file in the project root (copy from `.env.local.example`)
- Access to the Supabase Dashboard

---

## 1. Get Your Supabase Credentials

1. **Sign in** to [Supabase Dashboard](https://app.supabase.com)
2. **Select your project**
3. Go to **Settings → API** (left sidebar)
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Paste into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

6. **Save and restart** `npm run dev`

---

## 2. Apply the Database Schema

The schema lives in `supabase/migrations/001_init.sql`. You have two options:

### Option A: SQL Editor (Quickest for Testing)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/001_init.sql` locally and copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**
6. Verify: you should see green checkmarks for all statements

### Option B: Supabase CLI (Recommended for Production)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Log in
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase migration push --name init
```

---

## 3. Verify the Schema Was Applied

In Supabase Dashboard → **Table Editor**:

- [ ] `questions` table (21 rows, with `text_ms` and `subscale`)
- [ ] `responses` table (empty, waiting for screening data)
- [ ] `screening_results` table (empty, waiting for aggregate results)
- [ ] `admin_profiles` table (empty, you'll add counselors here)

---

## 4. Create Your First Counselor Account

### Step 1: Create an Auth User

1. In Supabase Dashboard, go to **Authentication → Users**
2. Click **Add User**
3. Enter:
   - **Email**: `counselor@yourschool.edu.my`
   - **Password**: A strong password (the counselor can reset it later)
4. Click **Create User**
5. Copy the **User ID** (UUID, looks like `f47ac10b-58cc-4372-a567-0e02b2c3d479`)

### Step 2: Register in admin_profiles

1. Go to **SQL Editor**
2. Click **New Query**
3. Paste:
   ```sql
   insert into admin_profiles (id, email, role)
   values ('<paste-user-id-here>', 'counselor@yourschool.edu.my', 'counselor');
   ```
4. Replace `<paste-user-id-here>` with the UUID from Step 1
5. Click **Run**

✅ The counselor now has access to `/admin`.

---

## 5. Access the Counselor Dashboard

1. **Start the app**: `npm run dev`
2. **Visit**: http://localhost:3000/admin/login
3. **Log in** with the email and password you created
4. You should see:
   - Summary cards (total screenings, crisis flags, elevated counts per subscale)
   - Table of recent screening results
   - Crisis cases highlighted in red

---

## 6. Test the Full Flow (Anonymous Respondent)

1. **Visit**: http://localhost:3000
2. Read the consent panel and tick **"Saya faham dan bersetuju"**
3. Click **"Mula Saringan"**
4. Answer all 21 items (takes ~5 minutes)
5. View your results on `/keputusan`
6. **As the counselor**, log into `/admin` and refresh — your screening should appear in the table

---

## 7. Row-Level Security (RLS) Overview

The database enforces:

| Role | Can INSERT | Can SELECT |
|------|-----------|-----------|
| **Anonymous** | ✅ `responses` + `screening_results` | ❌ Nothing (RLS hides it) |
| **Authenticated** (in `admin_profiles`) | ✅ Everything | ✅ Everything |

This means:
- Respondents submit screening data **anonymously** — their responses are keyed only by a session UUID, never logged in
- Counselors can only see data **if they're in the `admin_profiles` table** (the `is_staff()` function checks this)
- A random person with your anon key cannot read anyone's responses

### Verify RLS is Working

```bash
npm run test:rls
```

This test:
1. Inserts a test row as anon
2. Tries to read it back as anon
3. Asserts it's invisible (RLS is working)

---

## 8. Creating More Counselor Accounts

Repeat steps **4.1** and **4.2**:

```sql
insert into admin_profiles (id, email, role)
values ('<user-id-2>', 'another@yourschool.edu.my', 'counselor');
```

All counselors see the same data (there's no per-user filtering on `/admin` — all see all screenings).

---

## 9. Environment Checklist

Before deploying, verify:

- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local` is **in `.gitignore`** (never commit secrets)
- [ ] Schema was applied (21 questions are seeded)
- [ ] At least one counselor account exists in `admin_profiles`
- [ ] `npm run test:rls` passes (RLS is enforcing anon insert-only)
- [ ] `/admin/login` loads without "Supabase belum dikonfigurasi" message

---

## 10. Troubleshooting

### "Supabase belum dikonfigurasi" on `/admin`

- Check `.env.local` has both URL and anon key
- Restart `npm run dev`
- Browser DevTools → Console for any errors

### "Tiada Akses" on `/admin` after logging in

- Your email is not in `admin_profiles`
- Verify you ran the `insert into admin_profiles` SQL above
- Your user ID in that insert must match your auth user's ID exactly

### No questions appear on `/saring`

- If Supabase is configured, it should fetch from the DB
- If the DB fetch fails, it falls back to the bundled 21 items
- Check Supabase Dashboard → Table Editor → `questions` (should have 21 rows)

### RLS test says anon can still SELECT

- RLS may not be enabled on the table
- Go to Supabase Dashboard → Table Editor → `responses` → **Row Security** toggle (should be **ON**)
- Repeat for `screening_results` and `admin_profiles`

---

## 11. Next Steps

Once Supabase is configured:

1. **Deploy the app** (Vercel, Netlify, or your hosting)
2. **Share the public URL** with respondents (e.g., `https://yourapp.vercel.app`)
3. **Counselors log in** at `/admin` to view aggregated results
4. Consider **CSV export** or **trend charts** for deeper analysis (future enhancements)

---

## Questions?

Refer back to:
- `lib/scoring.ts` — how scores are calculated
- `lib/supabase.ts` — how data is saved (client-side, anon)
- `app/admin/page.tsx` — the dashboard query and display logic
- `supabase/migrations/001_init.sql` — the schema and RLS policies
