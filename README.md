# Newborn Companion

A companion to help parents manage baby documentation, keep the context from appointments, and track health data over time — through the first twelve weeks with a newborn.

A single-file, offline-first web app. No build step, no server, no account, no data leaving your device.

Built for my own family during paternity leave, published in case it's useful to someone else.

---

> ### ⚠️ Not medical advice
>
> This app provides **general information only**. It is not medical advice, not a diagnosis, and not a substitute for your midwife, health visitor, or GP. It is **not affiliated with the NHS** or any healthcare provider.
>
> If you are worried about your baby or yourself, contact your midwife, health visitor or GP. In the UK call **111** for urgent advice, or **999** in an emergency.
>
> Guidance here is UK-oriented and reflects general NHS public guidance on typical newborn patterns. Always defer to your own clinical team — they know your baby, this app doesn't.

---

## What it does

- **Appointments** — log midwife, health visitor, hospital and GP visits, including a notes field for *what was actually said*. The thing you always forget by the time you get home.
- **Data** — track weight, jaundice (bilirubin) levels, temperature or anything else over time, with trend charts. The weight chart plots your baby's birth weight as a reference line and shades the typical regain window.
- **Guide** — week-by-week context for weeks 1–12: feeding, sleep, health checks due, and what "normal" tends to look like. Automatically follows your baby's current age.
- **Crying decoder** — the common reasons a newborn cries, most to least likely, plus red-flag symptoms that mean *call 111 now*.
- **Support** — signposting for both parents (PANDAS Foundation, Mind, Home-Start, Samaritans, NHS 111), with separate sections for mum and dad. Postnatal depression in fathers is under-recognised and under-diagnosed.
- **Search** — search everything you've logged: "jaundice", "midwife", a date, a name.
- **Born early?** — enter gestational age at birth and the app shows adjusted age alongside actual age, and follows adjusted age for the week-by-week guide.

## Privacy

**Everything stays on your device.** All data is held in your browser's `localStorage`. There is no server, no account, no analytics, no network requests of any kind. Nothing is ever transmitted anywhere.

The trade-off: clearing your browser data or switching phones **will lose everything**. Use **Settings → Export backup** regularly. Exported backup files contain real health data — keep them somewhere private (they're git-ignored in this repo for that reason).

## Running it

No build step, no dependencies, no server.

```
open index.html
```

Or open the file in any modern browser. On a phone, use your browser's **Add to Home Screen** to get an app-like icon and full-screen launch.

## Design notes

- Single file, vanilla JS, no framework or build tooling — it should still open and work in ten years.
- Warm, calm palette with automatic light/dark mode. Designed for one-handed use at 3am.
- Charts are hand-rolled SVG — no charting library.
- Accessibility: labelled form fields, keyboard-dismissable dialogs, 44px touch targets, WCAG AA text contrast. Some decorative pastel section badges still fall short of AA and are on the list.

## Status and roadmap

Working and in daily use, but deliberately minimal. Known limitations:

- **No sync** — two parents on two phones means two separate sets of data.
- **No cloud backup** — manual JSON export is the only safety net.
- Content covers weeks 1–12 only.

The planned next step is a hosted version (Next.js + Supabase) with real password-protected accounts, cloud backup, and up to two linked parents sharing one baby's records.

## Contributing

This is a personal project, so I may be slow to respond. Corrections to the health guidance are especially welcome — **please include a source** so it can be verified. Every factual claim in here should be checkable against NHS or equivalent public guidance.

## Licence

MIT — see [LICENSE](LICENSE). Provided with no warranty of any kind; see the disclaimer above.
