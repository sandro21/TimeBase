# TimeBase

**Turn your calendar into insights** — no accounts, no server-side calendar storage. Upload an `.ics` file and explore how you actually spend your time: filters, charts, and stats that stay in the browser.

## Why I built it

Calendars hold a honest picture of priorities, but they are hard to “read” at a glance. TimeBase makes patterns visible — busy stretches, activity mix, and trends — so you can demo something useful in minutes at a hackathon and keep iterating on real data.

## Try it locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000), upload a calendar export, and click around. Good demo flow: upload → dashboard → activity view → filters.

## What’s inside

- **Privacy-first parsing** — iCal is processed on the client; bring your own file for demos.
- **Analytics & visuals** — dashboards, time breakdowns, and calendar-oriented charts.
- **Filtering & exploration** — slice events without leaving the app.
- **Optional AI chat** — add a Gemini key if you want conversational help over your stats.

## Environment (optional)

For the chat feature, create `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
```

Without it, the rest of the app still runs.

## Stack

Next.js (App Router), React, Tailwind CSS — familiar tools so teammates can jump in fast.

---

*Built for hackathons: quick setup, clear story, and a demo that works offline from a sample `.ics`.*
