// Ported verbatim from the original index.html CRYING_REASONS.
export interface CryingReason {
  icon: string;
  reason: string;
  detail: string;
}

export const CRYING_REASONS: CryingReason[] = [
  {
    icon: "🍼",
    reason: "Hungry / due a feed",
    detail:
      "The most common reason at this age. Early cues: rooting, hands to mouth, smacking lips — crying is often a late hunger sign. Offer a feed even if it 'shouldn't' be time yet.",
  },
  {
    icon: "📈",
    reason: "Growth spurt",
    detail:
      "Sudden runs of wanting to feed much more often (common around 1–3 weeks, 6 weeks, 3 months). Feeding 'on demand' through it settles supply within a few days.",
  },
  {
    icon: "😴",
    reason: "Overtired",
    detail:
      "Newborns often manage only 45–90 minutes awake before they need to sleep again. Overtired crying can look like fighting sleep rather than wanting it — a calm, low-stimulation wind-down often helps more than more activity.",
  },
  {
    icon: "🧷",
    reason: "Needs a nappy change",
    detail: "Quick to check and quick to fix.",
  },
  {
    icon: "🤗",
    reason: "Wants to be held",
    detail:
      "Newborns are wired to want closeness — skin-to-skin, gentle motion, or being worn/carried is a legitimate need, not a bad habit.",
  },
  {
    icon: "💨",
    reason: "Wind or tummy ache",
    detail:
      "Often shows as drawing knees up, arching, or grimacing. Try upright winding after feeds, or a gentle bicycle-leg motion.",
  },
  {
    icon: "🌡️",
    reason: "Too hot or cold",
    detail:
      "Check the back of baby's neck or chest — hands and feet are normally cooler and aren't a reliable guide.",
  },
  {
    icon: "✨",
    reason: "Overstimulated",
    detail:
      "Bright lights, noise, or too much handling/visitors can tip a baby into inconsolable crying. A quiet, dim room can help more than trying to soothe harder.",
  },
  {
    icon: "😣",
    reason: "Reflux or colic",
    detail:
      "Crying that's intense, often evenings, hard to soothe, sometimes with arching or spitting up. Common and usually improves by 3–4 months — mention it to your health visitor or GP if it's frequent or affecting feeding/weight.",
  },
];
