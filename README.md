# AVA RESERVE — Auto Shop Booking Website
### Full-Stack Next.js + Supabase + Vercel

---

## What's Included

- **Home page** — hero, features, service highlights
- **Book a Bay** — live calendar, real-time slot availability, booking form
- **Pricing** — 3-tier membership cards + pay-per-use rates
- **Gallery** — admin photo upload to cloud storage
- **User Dashboard** — bookings, profile, membership management
- **Admin Panel** — manage all bookings, members, gallery, settings
- **Auth** — Supabase email/password login + signup
- **Database** — PostgreSQL via Supabase with Row Level Security

---

## STEP 1 — Create a Supabase Project (Free)

1. Go to **https://supabase.com** → Sign up (free)
2. Click **New Project**
3. Choose a name (e.g. `ava-reserve`), set a strong database password, pick a region
4. Wait ~2 minutes for it to provision

---

## STEP 2 — Set Up the Database

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase-schema.sql` from this project
4. Paste the entire contents into the SQL editor
5. Click **Run** (green button)

You should see: `Success. No rows returned.`

---

## STEP 3 — Get Your API Keys

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public key** (long JWT string)
3. Open the file `.env.example` in this project
4. Create a copy named `.env.local`
5. Paste your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## STEP 4 — Set Up Storage (for Gallery Photos)

The SQL file already creates the storage bucket, but verify:

1. In Supabase, go to **Storage** in the left sidebar
2. You should see a bucket named `ava-reserve-images`
3. If not, click **New Bucket**, name it `ava-reserve-images`, check **Public bucket**

---

## STEP 5 — Run Locally (Optional, to test)

You need Node.js installed (https://nodejs.org — download LTS version).

Open a terminal in the project folder and run:

```bash
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## STEP 6 — Deploy to Vercel (Free Hosting)

Vercel is the best host for Next.js — free tier is generous.

### Option A: Deploy via GitHub (Recommended)

1. Create a free account at **https://github.com**
2. Create a new repository named `ava-reserve`
3. Upload all these project files to the repo
4. Go to **https://vercel.com** → Sign up with GitHub
5. Click **New Project** → Import your `ava-reserve` repo
6. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **Deploy**

Your site will be live at `https://ava-reserve.vercel.app` (or similar) in ~2 minutes.

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
# Follow the prompts, add env vars when asked
```

---

## STEP 7 — Make Your First Admin Account

1. Open your live site
2. Click **Sign In** → **Create Account**
3. Register with your email
4. Check your email and click the confirmation link
5. Go back to Supabase → **SQL Editor** → run:

```sql
-- Replace the email with yours
update public.profiles 
set is_admin = true 
where id = (
  select id from auth.users where email = 'your@email.com'
);
```

You now have full admin access to the Admin Panel.

---

## STEP 8 — Connect a Custom Domain (Optional)

1. Buy a domain at Namecheap, GoDaddy, or Cloudflare (~$10–15/year)
2. In Vercel → Your Project → **Settings → Domains**
3. Add your domain and follow the DNS instructions
4. Takes 5–30 minutes to go live

---

## Project File Structure

```
ava-reserve/
├── pages/
│   ├── _app.js          ← App wrapper (auth + toast)
│   ├── index.js         ← Home page
│   ├── book.js          ← Calendar + booking
│   ├── pricing.js       ← Tier plans
│   ├── gallery.js       ← Photo gallery
│   ├── dashboard.js     ← User dashboard
│   └── admin.js         ← Admin panel
├── components/
│   ├── Navbar.js        ← Navigation bar
│   └── AuthModal.js     ← Login/register modal
├── lib/
│   ├── supabase.js      ← Database + auth functions
│   └── AuthContext.js   ← React auth state
├── styles/
│   └── globals.css      ← All styles (edit colors here)
├── supabase-schema.sql  ← Run this in Supabase SQL editor
├── .env.example         ← Copy to .env.local and fill in
├── next.config.js       ← Next.js config
└── package.json         ← Dependencies
```

---

## Editing Colors

Open `styles/globals.css` and find the `:root { }` block at the top:

```css
:root {
  --red:        #C0272D;   ← Main brand color (change this)
  --dark:       #1A1A1A;   ← Navbar/header background
  --gray:       #F4F4F2;   ← Page background
  --white:      #FFFFFF;   ← Card surfaces
  ...
}
```

Change any value — it updates everywhere automatically.

---

## Monthly Costs

| Service | Free Tier Limit | Cost After |
|---------|----------------|------------|
| Supabase | 500MB DB, 1GB storage, 50k users | $25/mo |
| Vercel | 100GB bandwidth, unlimited deploys | $20/mo |
| Custom domain | — | ~$12/year |
| **Total to start** | **$0/month** | — |

---

## Support

Built with: Next.js 14 · Supabase · Vercel · React Hot Toast · date-fns
