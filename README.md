# Find My Marker

A public log of research reagent results — antibodies, primers, kits,
and more — reported by the researchers who actually used them:
pass/fail, by marker, vendor, model system, and technique.

This README assumes zero prior setup. Follow it top to bottom.

---

## Already have this running live? Read this first

If you already set up Supabase and deployed an earlier version of this
project, don't re-run `supabase/schema.sql` — it would try to recreate
tables that already exist. Instead, run these two files once in your
Supabase SQL Editor, in order:

1. `supabase/migration_to_v5.sql` (if you haven't already) — adds
   categories, research areas, the profiles table, and DOI links.
2. `supabase/migration_v6_orcid.sql` — adds the optional ORCID iD field.

Both only add/rename columns, so your existing reports are kept.

**Also note:** this version switches from magic-link sign-in to email +
password. Anyone who signed in before (including you) will need to use
the "Forgot password?" link once to set a password for their existing
account — their account and past reports aren't affected.

---

## 1. Create your Supabase project (database + login system)

1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Give it any name, set a database password (save
   it somewhere), pick the region closest to you, and click **Create**.
   Wait ~2 minutes while it provisions.
3. In the left sidebar, go to **SQL Editor** → **New query**.
4. Open the file `supabase/schema.sql` in this project, copy its full
   contents, paste into the SQL editor, and click **Run**. This creates
   the `entries` table and the security rules.
5. In the left sidebar, go to **Project Settings** → **API**. You'll see
   two values you need:
   - **Project URL**
   - **anon public** key
   Keep this tab open — you'll paste these in step 3 below.
6. Still in Supabase, go to **Authentication** → **Providers**, confirm
   **Email** is enabled (it is by default). Then go to
   **Authentication** → **URL Configuration** and add your site URL
   (for local testing: `http://localhost:3000`; add your real domain
   later once deployed, e.g. `https://your-app.vercel.app`) to
   **Redirect URLs**.

## 2. Run it on your own computer first

You'll need [Node.js](https://nodejs.org) installed (the LTS version).

```bash
npm install
```

## 3. Add your Supabase keys

Copy `.env.example` to a new file called `.env.local`, then paste in the
two values from step 1.5:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
```

## 4. Start the app locally

```bash
npm run dev
```

Open http://localhost:3000 — you should see the homepage. Try signing in
(top right) with your own email, click the link Supabase emails you, and
then submit a test report.

If something looks broken, check the terminal for an error message first.

---

## 5. Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Then on github.com: click **New repository**, name it (e.g.
`reality-check`), leave it empty (no README/gitignore), and click
**Create repository**. GitHub will show you commands like these — run
them in your project folder:

```bash
git remote add origin https://github.com/YOUR-USERNAME/reality-check.git
git branch -M main
git push -u origin main
```

## 6. Deploy it publicly with Vercel

1. Go to https://vercel.com and sign up using your GitHub account.
2. Click **Add New** → **Project**, and import the repo you just pushed.
3. Before clicking Deploy, open **Environment Variables** and add the
   same two values from step 3 (`NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Click **Deploy**. In ~1 minute you'll get a live URL like
   `reality-check.vercel.app`.
5. Go back to Supabase → **Authentication** → **URL Configuration** and
   add that live URL to **Redirect URLs**, so sign-in emails work in
   production too.

That's it — the app is now live and anyone can use it. A custom domain
can be added later from the Vercel project's **Domains** tab.

---

## Project structure

```
app/
  page.js              Home page — search & browse reports
  submit/page.js        Report form (requires sign-in)
  login/page.js          Email sign-in
  auth/callback/route.js Finishes the email verification flow
  EntryCard.js            The report "card" UI
  NavAuth.js               Shows sign in/out state in the header
lib/
  supabaseClient.js      Supabase client for the browser
  supabaseServer.js       Supabase client for server-side code
supabase/
  schema.sql              Database table + security rules (run this once)
middleware.js              Keeps your login session working
```

## Next steps / ideas once this is live

- Add a report count or "X labs confirmed" badge to popular targets
- Let users flag entries as outdated
- Add basic profanity/spam filtering on notes before insert
