// Ported verbatim from the original index.html WEEK_GUIDE. Source field
// added per topic per the Phase A plan (months beyond week 12 are a
// follow-up content-authoring pass, not part of this build).
export interface GuideTopic {
  icon: string;
  title: string;
  teaser: string;
  text: string;
  source: { org: string; url?: string };
}

export interface GuidePeriod {
  key: string;
  chip: string;
  range: string;
  tag: string;
  topics: GuideTopic[];
}

const NHS = { org: "NHS Start4Life", url: "https://www.nhs.uk/start-for-life/" };
const LULLABY = { org: "The Lullaby Trust", url: "https://www.lullabytrust.org.uk/" };

export const WEEK_GUIDE: GuidePeriod[] = [
  {
    key: "w1",
    chip: "Wk 1",
    range: "Week 1 (Days 1–7)",
    tag: "The blur",
    topics: [
      {
        icon: "🍼",
        title: "Feeding",
        teaser: "Every 2–3 hours, round the clock",
        text: "Feeding roughly every 2–3 hours round the clock, including cluster feeding in the evenings, is normal and helps build your milk supply — not a sign anything's wrong.",
        source: NHS,
      },
      {
        icon: "😴",
        title: "Sleep",
        teaser: "16–18 hrs a day, in short bursts",
        text: "Newborns sleep 16–18 hours a day, but only in short 1–3 hour stretches — there's no day/night rhythm yet. That comes later.",
        source: NHS,
      },
      {
        icon: "🩺",
        title: "Health & checks",
        teaser: "Weight, jaundice, heel prick",
        text: "Weight loss of up to ~10% of birth weight in the first few days is expected — your midwife will weigh baby around day 5 to confirm they're heading back up. Jaundice is common from day 2–3 as their liver catches up; it's checked at the newborn exam within 72 hours. Around day 5–8, the heel prick (newborn blood spot) test screens for several rare conditions.",
        source: NHS,
      },
      {
        icon: "🛏️",
        title: "Safe sleep",
        teaser: "Every sleep, every time",
        text: "Always place baby on their back to sleep, in their own clear, flat sleep space in the same room as you for the first 6 months. Feet-to-foot, no loose bedding, cot bumpers, or soft toys, and keep the room smoke-free — these steps significantly reduce the risk of SIDS.",
        source: LULLABY,
      },
      {
        icon: "😢",
        title: "Crying & mood",
        teaser: "Mostly hunger, comfort, tiredness",
        text: "Crying is mostly hunger, needing a nappy change, wanting to be held, or being overtired — they can't be 'spoiled' at this age.",
        source: NHS,
      },
    ],
  },
  {
    key: "w2",
    chip: "Wk 2",
    range: "Week 2",
    tag: "Finding a rhythm",
    topics: [
      {
        icon: "🍼",
        title: "Feeding",
        teaser: "Watch for a growth spurt",
        text: "Feeds are still frequent and unpredictable. Growth spurts (common around 1–3 weeks) can mean a sudden run of extra-hungry days — feeding on demand through it settles supply within days.",
        source: NHS,
      },
      {
        icon: "😴",
        title: "Sleep",
        teaser: "Short awake windows",
        text: "Awake windows are short — most newborns can only manage 45–60 minutes awake before overtiredness kicks in and settling gets harder.",
        source: NHS,
      },
      {
        icon: "🩺",
        title: "Health & checks",
        teaser: "Birth weight regained; jaundice fading",
        text: "Most babies are back to (or past) birth weight by 2–3 weeks — a healthy sign feeding is going well. Jaundice usually fades by around 2 weeks; if it's getting worse, spreading, or baby seems very sleepy or hard to wake, contact your midwife or GP the same day.",
        source: NHS,
      },
      {
        icon: "🤸",
        title: "Tummy time",
        teaser: "A few minutes, a few times a day",
        text: "Start short, supervised tummy time while baby is awake and alert — a couple of minutes, a few times a day is plenty at this age. It builds the neck and shoulder strength baby will need for head control. Stop if baby gets upset; little and often beats one long session.",
        source: NHS,
      },
    ],
  },
  {
    key: "w34",
    chip: "Wk 3–4",
    range: "Weeks 3–4",
    tag: "A little more predictable",
    topics: [
      {
        icon: "😴",
        title: "Sleep",
        teaser: "Loose patterns start to form",
        text: "You may start to notice loose patterns forming (not a routine yet) — a slightly longer stretch of sleep, a fussier time of evening.",
        source: NHS,
      },
      {
        icon: "😢",
        title: "Crying & mood",
        teaser: "Evening fussiness peaks",
        text: "Evening fussiness and cluster feeding peaking around 3–6 weeks is common and usually settles by 3 months — exhausting, but not usually a sign of a problem.",
        source: NHS,
      },
      {
        icon: "💛",
        title: "You",
        teaser: "Baby blues vs something more",
        text: "This is a common stretch for the 'baby blues' to have passed, but postnatal depression or anxiety to start showing in either parent — worth a look at the Support tab.",
        source: NHS,
      },
    ],
  },
  {
    key: "w56",
    chip: "Wk 5–6",
    range: "Weeks 5–6",
    tag: "The 6-week check",
    topics: [
      {
        icon: "🩺",
        title: "Health & checks",
        teaser: "6–8 week physical check",
        text: "Around 6–8 weeks, baby has their physical check (the NIPE follow-up) — heart, hips, eyes, testes if applicable, and general development. You'll usually have your own 6-week postnatal check too, covering physical and emotional recovery. First routine vaccinations are usually due at 8 weeks.",
        source: NHS,
      },
      {
        icon: "😴",
        title: "Sleep",
        teaser: "Maybe a longer stretch",
        text: "Some babies start settling into slightly longer night stretches around now — plenty don't, and that's still normal.",
        source: NHS,
      },
    ],
  },
  {
    key: "w78",
    chip: "Wk 7–8",
    range: "Weeks 7–8",
    tag: "More alert",
    topics: [
      {
        icon: "👀",
        title: "Development",
        teaser: "Tracking faces, early smiles",
        text: "Baby is likely more visually alert, tracking faces, and may offer early smiles.",
        source: NHS,
      },
      {
        icon: "😢",
        title: "Crying & mood",
        teaser: "Colic/reflux can peak now",
        text: "Wind, reflux-type discomfort or 'colic' (crying for 3+ hours a day, 3+ days a week) can peak around 6 weeks and usually improves by 3–4 months — worth flagging to your health visitor or GP if it's relentless.",
        source: NHS,
      },
    ],
  },
  {
    key: "w912",
    chip: "Wk 9–12",
    range: "Weeks 9–12",
    tag: "Turning a corner",
    topics: [
      {
        icon: "👀",
        title: "Development",
        teaser: "Through the fog",
        text: "Many families start to feel like they're 'through the fog' around 12 weeks, though every baby is different.",
        source: NHS,
      },
      {
        icon: "🍼",
        title: "Feeding",
        teaser: "Getting more efficient",
        text: "Feeding gets more efficient and awake windows stretch a little longer — you'll likely know your own baby's cues far better than any generic guide by now.",
        source: NHS,
      },
    ],
  },
];
