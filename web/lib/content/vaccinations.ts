// The routine NHS childhood immunisation schedule, up to the preschool
// booster. Kept as static code, same pattern as WEEK_GUIDE — this is
// reference content, not something a family edits.
//
// The schedule does shift over time (dose composition, timing) and varies
// slightly by UK nation, so this is a "here's roughly when" checklist, not
// a guarantee of what your GP/health visitor will offer — the page itself
// says as much. Annual/seasonal items (e.g. the 2–3 year flu nasal spray)
// are deliberately left out: they repeat every year rather than being a
// one-off dose, which doesn't fit this same-shape-forever checklist.

export interface VaccinationScheduleItem {
  key: string;
  ageLabel: string;
  ageWeeksMin: number;
  vaccines: string[];
}

export const VACCINATION_SCHEDULE: VaccinationScheduleItem[] = [
  {
    key: "8-weeks",
    ageLabel: "8 weeks",
    ageWeeksMin: 8,
    vaccines: ["6-in-1 (1st dose)", "Rotavirus (1st dose)", "MenB (1st dose)"],
  },
  {
    key: "12-weeks",
    ageLabel: "12 weeks",
    ageWeeksMin: 12,
    vaccines: ["6-in-1 (2nd dose)", "Pneumococcal (PCV)", "Rotavirus (2nd dose)"],
  },
  {
    key: "16-weeks",
    ageLabel: "16 weeks",
    ageWeeksMin: 16,
    vaccines: ["6-in-1 (3rd dose)", "MenB (2nd dose)"],
  },
  {
    key: "1-year",
    ageLabel: "1 year",
    ageWeeksMin: 52,
    vaccines: ["Hib/MenC", "MMR (1st dose)", "PCV booster", "MenB (3rd dose)"],
  },
  {
    key: "3y4m",
    ageLabel: "3 years, 4 months",
    ageWeeksMin: 174,
    vaccines: ["MMR (2nd dose)", "4-in-1 preschool booster"],
  },
];
