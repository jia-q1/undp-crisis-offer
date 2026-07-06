/**
 * Excerpts from the Afghanistan "Investing Beyond Crisis" example doc,
 * mapped to the form step they illustrate. Shown in the reference panel
 * so people can see what a filled-in answer looks like for that question.
 */

export type RefBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: { headline?: string; detail: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "offerBlocks"; items: { label: string; tagline: string; description: string }[] };

export interface ReferenceEntry {
  title: string;
  blocks: RefBlock[];
}

export const REFERENCE_CONTENT: Record<string, ReferenceEntry> = {
  challenge: {
    title: "1) The situation on the ground",
    blocks: [
      {
        type: "paragraph",
        text: "Afghanistan is facing overlapping, mutually reinforcing crises that are pushing communities and local systems to a breaking point: economic fragility, large-scale returns and displacement, climate shocks, and severe restrictions for women and girls.",
      },
      {
        type: "paragraph",
        text: "These pressures are most acute in areas of high returns, where millions of people are arriving in communities with limited capacity to absorb them. Livelihoods are shrinking, services are strained and natural resources are under increasing pressure.",
      },
      {
        type: "paragraph",
        text: "Humanitarian support remains essential, but on its own, it is not enough. Without sustained investment in local recovery, livelihoods and economic opportunity, local systems will continue to erode.",
      },
    ],
  },

  realityCheck: {
    title: "At a glance",
    blocks: [
      {
        type: "bullets",
        items: [
          { headline: "Basic needs under severe pressure.", detail: "3 in 4 Afghans (28.9 million people) cannot meet basic needs." },
          { headline: "The scale of returnees is unprecedented.", detail: "5.9 million Afghans have returned since 2023 (14% of the population)." },
          { headline: "Restrictions on women and girls", detail: "are one of the most significant, avoidable drivers of the crisis. An estimated 3.8 million girls aged 7-18 are out of school." },
          { headline: "Lifting bans on women", detail: "could add up to $5.4B to GDP. Only 24% of women participate in the labor force (vs. 89% for men)." },
          { headline: "Climate shocks are hitting Afghans hard.", detail: "Drought affected 64% of households in 2025." },
        ],
      },
    ],
  },

  results: {
    title: "Results speak for themselves",
    blocks: [
      {
        type: "bullets",
        items: [
          { headline: "Women and girls at the center.", detail: "Over 90% of UNDP's portfolio directly benefits women and girls." },
          { headline: "Supporting women-led businesses.", detail: "Since 2022, UNDP has supported over 83,000 women-led enterprises, creating nearly 500,000 jobs." },
          { headline: "Rebuilding local infrastructure", detail: "benefiting 6.4 million people." },
          { headline: "Protecting essential services.", detail: "In 2025 alone, nearly 2 million people accessed healthcare." },
          { headline: "Restoring access to finance systems.", detail: "A US$6.1 million access-to-finance will mobilise US$30 million in lending." },
        ],
      },
    ],
  },

  advantage: {
    title: "2) UNDP's advantage – why UNDP, why now",
    blocks: [
      {
        type: "paragraph",
        text: "UNDP's comparative advantage lies in connecting immediate support with local recovery and longer-term stability, operating in the continuum, before, during and after shocks.",
      },
      {
        type: "paragraph",
        text: "With nearly 50 years of presence in Afghanistan, UNDP brings established delivery platforms and deep understanding of local contexts, enabling tailored areas-based responses.",
      },
      {
        type: "paragraph",
        text: "UNDP delivers integrated solutions that link livelihoods, community infrastructure, renewable energy, climate adaptation, water management and private-sector engagement.",
      },
    ],
  },

  offerIntro: {
    title: "3) The offer: What UNDP will do",
    blocks: [
      {
        type: "paragraph",
        text: "In Afghanistan UNDP adapts its global beyond crisis framework into a 2x2 operational crisis model tailored to country realities.",
      },
      {
        type: "paragraph",
        text: "It will focus on what matters most at district level: keeping essential services running and helping local economies hold and recover under pressure, across two phases: Prepare and Prevent, and Respond and Recover.",
      },
    ],
  },

  offerBlocks: {
    title: "The offer: four components",
    blocks: [
      {
        type: "offerBlocks",
        items: [
          {
            label: "Prepare and Prevent / Essential services",
            tagline: "Essential systems that keep services running and infrastructure standing when shocks hit",
            description: "UNDP acts early to keep essential services from failing — fixing water and irrigation systems, community access roads, and supporting renewable energy for schools and health facilities.",
          },
          {
            label: "Prepare and Prevent / Livelihoods",
            tagline: "Stronger jobs and businesses that bounce back — keeping economies stable through crises",
            description: "UNDP helps people hold on to their livelihoods before shocks harden into deeper poverty — strengthening local markets, supporting small businesses and farmers, targeting women-led ones.",
          },
          {
            label: "Respond and Recover / Essential services",
            tagline: "Getting services back and infrastructure running, helping communities recover",
            description: "Where shocks have already hit, UNDP works to restore essential services quickly — repairing water systems, roads, clinics, schools, and access to energy.",
          },
          {
            label: "Respond and Recover / Livelihoods",
            tagline: "Restart livelihoods and rebuild economies",
            description: "UNDP helps restart local economies by supporting livelihoods, creating immediate employment through skilling, and helping businesses and farmers get back to work.",
          },
        ],
      },
    ],
  },

  investmentNarrative: {
    title: "4) The Investment",
    blocks: [
      {
        type: "paragraph",
        text: "Delivering this integrated area-based approach in 200-250 priority districts in 24 provinces will require US$ 350 million over three years (mid-2026 to mid-2029).",
      },
      {
        type: "paragraph",
        text: "These will be selected based on return pressures, poverty, service deficits, climate and disaster risks, local economic conditions, and social cohesion vulnerabilities.",
      },
    ],
  },

  investmentTable: {
    title: "Indicative investment allocation",
    blocks: [
      {
        type: "table",
        headers: ["Operational component", "Total"],
        rows: [
          ["Prepare and Prevent: services, infrastructure", "US$120m"],
          ["Prepare and Prevent: Livelihoods, jobs", "US$87m"],
          ["Respond and Recover: Services, infrastructure", "US$85m"],
          ["Respond and Recover: Livelihoods, jobs", "US$58m"],
          ["Total (across Mid 2026 – Mid 2029)", "US$350m"],
        ],
      },
    ],
  },

  roi: {
    title: "5) The Return: What success looks like in 24–36 months",
    blocks: [
      {
        type: "paragraph",
        text: "Overall, the investment is expected to directly benefit approximately 7 million people across the four operational components, while improved infrastructure and services will indirectly benefit an estimated 22-25 million people.",
      },
      {
        type: "bullets",
        items: [
          { headline: "More resilient communities and local systems.", detail: "Around 2 million people will gain improved access to essential services and resilient infrastructure." },
          { headline: "Local economies are generating jobs and opportunities.", detail: "Return on investment: US$145 million will help create or sustain 100,000 jobs, strengthen 25,000 MSMEs." },
          { headline: "A scalable, area-based model.", detail: "Integrated recovery packages delivered in 200-250 districts, providing a model for scale-up in similar crisis settings." },
        ],
      },
    ],
  },
};

export function hasReference(stepId: string): boolean {
  return stepId in REFERENCE_CONTENT;
}
