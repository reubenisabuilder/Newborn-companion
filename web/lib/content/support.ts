// Ported verbatim from the original index.html SUPPORT.
export interface SupportOrg {
  name: string;
  desc: string;
  contact?: string;
  url?: string;
}

export const SUPPORT: { mum: SupportOrg[]; dad: SupportOrg[]; general: SupportOrg[] } = {
  mum: [
    {
      name: "PANDAS Foundation",
      desc: "Free WhatsApp support for pre- and postnatal mental illness, for parents and partners.",
      contact: "WhatsApp 07903 508334 · Mon–Fri 9am–5pm (excl. bank holidays)",
      url: "https://pandasfoundation.org.uk/",
    },
    {
      name: "Mind — postnatal & perinatal mental health",
      desc: "Information and contacts on postnatal depression and perinatal mental illness.",
      url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/postnatal-depression-and-perinatal-mental-health/",
    },
    {
      name: "Your health visitor or GP",
      desc: "Ask to be screened for postnatal depression/anxiety at any point — you don't need to wait for your 6-week check.",
    },
  ],
  dad: [
    {
      name: "PANDAS Foundation — support for dads",
      desc: "Same free WhatsApp service, with volunteers experienced in supporting fathers and partners.",
      contact: "WhatsApp 07903 508334 · Mon–Fri 9am–5pm (excl. bank holidays)",
      url: "https://pandasfoundation.org.uk/how-we-can-support-you/support-for-dads/",
    },
    {
      name: "Home-Start",
      desc: "Local family support and peer volunteers for families with young children.",
      url: "https://www.home-start.org.uk/",
    },
    {
      name: "Mind — postnatal & perinatal mental health",
      desc: "Partners and dads can experience postnatal depression too — it's under-recognised and under-diagnosed.",
      url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/postnatal-depression-and-perinatal-mental-health/",
    },
  ],
  general: [
    {
      name: "Samaritans",
      desc: "Free, 24/7, confidential support if things feel overwhelming — you don't need to be in crisis to call.",
      contact: "116 123",
      url: "https://www.samaritans.org/",
    },
    {
      name: "NHS 111",
      desc: "For urgent (non-emergency) health worries about you or baby, day or night.",
      contact: "Call 111",
      url: "https://111.nhs.uk/",
    },
  ],
};
