// Short, reassurance-toned answers to the questions new parents actually
// ask early on — general knowledge, not a diagnosis. Same register as
// CRYING_REASONS: "this is normal, here's why, here's when to check in."
export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Is it normal for my baby to lose weight in the first few days?",
    a: "Yes — most newborns lose up to about 10% of their birth weight in the first 3-5 days and are usually back to birth weight by around day 10-14. It's one of the things your midwife checks at home visits.",
  },
  {
    q: "How do I know if they're getting enough milk?",
    a: "Steady weight gain over time (not every single weigh-in), plenty of wet/dirty nappies, and settling after most feeds are the main signs — not how long a feed takes or how often they cry. Your health visitor can weigh and reassure you at any point, you don't need to wait for a scheduled check.",
  },
  {
    q: "Is it normal to feel like I have no idea what I'm doing?",
    a: "Yes, and it doesn't mean anything's wrong with you or your baby. Almost everyone feels this way in the early weeks — it gets easier as you both learn each other, not because you suddenly become an expert.",
  },
  {
    q: "Is it OK that they only sleep in short bursts?",
    a: "Newborn sleep is genuinely fragmented and doesn't settle into longer stretches for weeks or months — that's normal development, not a problem to fix. It gradually lengthens on its own.",
  },
  {
    q: "Do I need to stick to a strict feeding/sleeping routine?",
    a: "Not in the newborn weeks — feeding and settling 'on demand' (following their cues rather than a clock) is what's recommended early on. Looser patterns tend to emerge naturally over the following months.",
  },
];
