import { z } from "zod";

/**
 * Single source of truth for the "Investing Beyond Crisis" country offer form.
 * Modeled directly on the Afghanistan example doc. Both the React client and
 * the Express API import this so validation never drifts between the two.
 */

export const OFFER_MATRIX = [
  { phase: "Prepare and Prevent", pillar: "Essential services, infrastructure and local systems" },
  { phase: "Prepare and Prevent", pillar: "Livelihoods, jobs and economies" },
  { phase: "Respond and Recover", pillar: "Essential services, infrastructure and local systems" },
  { phase: "Respond and Recover", pillar: "Livelihoods, jobs and economies" },
] as const;

const statItemSchema = z.object({
  headline: z.string().min(1, "Required"),
  detail: z.string().min(1, "Required"),
});

const offerBlockSchema = z.object({
  tagline: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

const outcomeGroupSchema = z.object({
  title: z.string().min(1, "Required"),
  roiHighlight: z.string().optional().default(""),
  bullets: z.array(z.string().min(1)).min(1, "Add at least one point"),
});

export const submissionSchema = z.object({
  meta: z.object({
    country: z.string().min(1, "Required"),
    submittedByName: z.string().min(1, "Required"),
    submittedByRole: z.string().min(1, "Required"),
    submittedByEmail: z.string().email("Enter a valid email"),
  }),

  situation: z.object({
    challenge: z.string().min(1, "Required"),
    realityCheck: z.array(statItemSchema).min(1, "Add at least one stat"),
    results: z.array(statItemSchema).min(1, "Add at least one result"),
  }),

  advantage: z.object({
    narrative: z.string().min(1, "Required"),
  }),

  offer: z.object({
    intro: z.string().min(1, "Required"),
    blocks: z.tuple([offerBlockSchema, offerBlockSchema, offerBlockSchema, offerBlockSchema]),
  }),

  investment: z.object({
    totalAmountUsdMillions: z.number().positive("Enter a positive number"),
    durationLabel: z.string().min(1, "Required"),
    districtsLabel: z.string().min(1, "Required"),
    provincesLabel: z.string().min(1, "Required"),
    selectionCriteria: z.string().min(1, "Required"),
    periodLabels: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
    rows: z.tuple([
      z.tuple([z.number(), z.number(), z.number(), z.number()]),
      z.tuple([z.number(), z.number(), z.number(), z.number()]),
      z.tuple([z.number(), z.number(), z.number(), z.number()]),
      z.tuple([z.number(), z.number(), z.number(), z.number()]),
    ]),
  }),

  returnOnInvestment: z.object({
    overallImpact: z.string().min(1, "Required"),
    outcomeGroups: z.array(outcomeGroupSchema).min(1, "Add at least one outcome group"),
    closingStatement: z.string().optional().default(""),
  }),

  contact: z.object({
    name: z.string().min(1, "Required"),
    email: z.string().email("Enter a valid email"),
    link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  }),
});

export type Submission = z.infer<typeof submissionSchema>;
export type StatItem = z.infer<typeof statItemSchema>;
export type OfferBlock = z.infer<typeof offerBlockSchema>;
export type OutcomeGroup = z.infer<typeof outcomeGroupSchema>;

export function computeInvestmentTotals(investment: Submission["investment"]) {
  const rowTotals = investment.rows.map((row) => row.reduce((a, b) => a + b, 0));
  const columnTotals = [0, 1, 2, 3].map((colIdx) =>
    investment.rows.reduce((sum, row) => sum + row[colIdx], 0)
  );
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);
  return { rowTotals, columnTotals, grandTotal };
}

export const emptySubmission: Submission = {
  meta: { country: "", submittedByName: "", submittedByRole: "", submittedByEmail: "" },
  situation: { challenge: "", realityCheck: [], results: [] },
  advantage: { narrative: "" },
  offer: {
    intro: "",
    blocks: [
      { tagline: "", description: "" },
      { tagline: "", description: "" },
      { tagline: "", description: "" },
      { tagline: "", description: "" },
    ],
  },
  investment: {
    totalAmountUsdMillions: 0,
    durationLabel: "",
    districtsLabel: "",
    provincesLabel: "",
    selectionCriteria: "",
    periodLabels: ["", "", "", ""],
    rows: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  returnOnInvestment: { overallImpact: "", outcomeGroups: [], closingStatement: "" },
  contact: { name: "", email: "", link: "" },
};
