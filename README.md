# Myanmar Economic Insights (MEI) — website

Name: **Myanmar Economic Insights (MEI)**, also published as **Burma/Myanmar EI**. All three names can be changed in Vercel's environment variables without touching the code.

It's built with Next.js and hosted on Vercel, with posts stored in Supabase. The whole site is organised around the five areas we track: **The Price Desk, Trade & Supply Chain, Business Climate, Money & Banking, and Conflict & Illicit Economy**.

| Page | What it shows |
|---|---|
| `/` | Today's summary, one card for each of the five areas (latest number and note), the latest Business Weekly, and the kyat chart |
| `/c/prices` `/c/trade` `/c/business` `/c/money` `/c/conflict` | One page per area: what we track there, its latest figures, and every update in that area over time |
| `/data` | Public data explorer. Visitors can search, filter by area, item, place and date, sort any column, and download as CSV. Filtered views can be shared as links. |
| `/api/data` | Free daily data feed (CSV or JSON) with the same filters |
| `/daily`, `/weekly`, `/p/<slug>` | Archives and full posts, with one section for each area |

When the Supabase settings aren't filled in, the site shows the archive of published Business Weekly issues (content/archive.json) with a yellow preview banner.

## One-time setup

1. **Supabase.** Create a Supabase project for the site. In SQL Editor run `supabase/schema.sql`, then `supabase/archive.sql` to load the past issues. Note the project URL, anon key and service_role key.
2. **Vercel.** Add New → Project → import this repository. Set env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POST_SECRET` (24+ random characters), optionally `CRON_SECRET`.
3. **Domain** (optional): connect it in the Vercel project settings.

## How daily posts arrive

The scheduled task sends each summary to the website, never straight to Supabase. A post contains **one section for each area**; any area with no news that day can be left out.

```bash
curl -X POST https://YOUR-SITE.vercel.app/api/posts \
  -H "Authorization: Bearer $POST_SECRET" -H "Content-Type: application/json" \
  -d '{
    "slug": "2026-11-20-daily", "kind": "daily",
    "title": "Kyat ...", "dek": "One-line summary",
    "period_start": "2026-11-20", "period_end": "2026-11-20",
    "sections": [
      {"category":"prices",  "value":"×2",     "label":"Ayeyarwady petrol", "source":"DVB, 20 Nov", "text_md":"Why it moved ..."},
      {"category":"trade",   "value":"Closed", "label":"Muse gate",         "source":"...",         "text_md":"..."},
      {"category":"business","text_md":"..."},
      {"category":"money",   "value":"K4,760", "label":"Street MMK/USD",    "source":"DVB, 20 Nov", "text_md":"..."},
      {"category":"conflict","text_md":"..."}
    ],
    "sources": [{"name":"DVB","url":"https://...","date":"2026-11-20"}]
  }'
```

- Each `category` must be one of `prices`, `trade`, `business`, `money` or `conflict`, and each can appear only once per post.
- A headline `value` must come with a `source`.
- Sending the same `slug` again updates that post instead of creating a duplicate.
- To save a post without publishing it, add `"status": "draft"`.

Tracked figures (basket prices, exchange rates, levies and so on) go to `/api/indicators`. They feed the area pages, the kyat chart and the Data explorer. Each figure needs a `category` and a `source`:

```bash
curl -X POST https://YOUR-SITE.vercel.app/api/indicators \
  -H "Authorization: Bearer $POST_SECRET" -H "Content-Type: application/json" \
  -d '{"observations":[
    {"key":"mmk_usd_street","category":"money","label":"Street rate","value":4760,"unit":"MMK per USD","observed_on":"2026-11-20","source":"DVB daily rate"},
    {"key":"palm_oil","category":"prices","label":"Palm oil","value":12500,"unit":"MMK per viss","location":"Yangon","observed_on":"2026-11-20","source":"DVB"}
  ]}'
```

Use the same `key` and `location` every day, for example `rice_low_grade` in Mandalay, so each item builds into a time series.

## Public data access

- `/api/data?format=csv` returns the full dataset as CSV; use `format=json` for JSON.
- Filters: `category`, `key`, `location`, `from`, `to` (dates as YYYY-MM-DD).
- It is read-only and refreshes within 5 minutes of each new post.

## Security

- The `service_role` key lives only in Vercel's settings. The scheduled task holds just `POST_SECRET`, which can add or update posts and data points and nothing else. To revoke it, change it in Vercel.
- The public can read published rows only, because row-level security is on.
- Raw HTML inside posts is ignored when the page is displayed.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in, or leave the Supabase values blank to see the archive preview
npm run dev
```

## Archive of past issues

`content/archive.json` holds Business Weekly Issues 8–11 (already published on the Facebook page) as posts and sourced indicator figures. To load them into Supabase, run `supabase/schema.sql` first, then `supabase/archive.sql` (regenerate it with `node scripts/archive-to-sql.mjs` after editing the JSON).

## Keep-alive

`vercel.json` runs a daily cron to `/api/keepalive`, which does one tiny read so a free Supabase project doesn't pause. Optionally set `CRON_SECRET`.
