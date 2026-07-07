import { z } from "zod";

/**
 * Single source of truth for the "Investing Beyond Crisis" country offer form.
 * Modeled directly on the Afghanistan example doc. Both the React client and
 * the Express API import this so validation never drifts between the two.
 */

export const OFFER_ROWS = ["Prepare and Prevent", "Respond and Recover", "Transition and Transform"] as const;

export const INVESTMENT_PERIODS = ["Mid-2026", "2027", "2028", "Mid-2029"] as const;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function longText(maxWords: number) {
  return z
    .string()
    .min(1, "Required")
    .refine((val) => countWords(val) <= maxWords, { message: `Keep this under ${maxWords} words` });
}

const indicatorItemSchema = z.object({
  headline: z.string().min(1, "Required"),
  detail: z.string().min(1, "Required"),
});

const offerRowSchema = z.array(z.string().min(1, "Required"));

const investmentOfferSchema = z.object({
  label: z.string().min(1, "Required"),
  amounts: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});

const investmentGroupSchema = z.array(investmentOfferSchema).min(1, "Add at least one offer");

const outcomeGroupSchema = z.object({
  title: z.string().min(1, "Required"),
  points: z.string().min(1, "Required"),
});

export const submissionSchema = z.object({
  meta: z.object({
    country: z.string().min(1, "Required"),
    submittedByName: z.string().min(1, "Required"),
    submittedByRole: z.string().min(1, "Required"),
    submittedByEmail: z.string().email("Enter a valid email"),
  }),

  situation: z.object({
    challenge: longText(500),
    realityCheck: z.array(indicatorItemSchema).min(3, "Add at least 3 indicators").max(6, "Add at most 6 indicators"),
    results: z.array(indicatorItemSchema).min(3, "Add at least 3 results").max(6, "Add at most 6 results"),
  }),

  advantage: z.object({
    narrative: longText(500),
  }),

  offer: z.object({
    intro: longText(500),
    columnLabels: z.array(z.string().min(1, "Required")).min(1, "Add at least one column"),
    rows: z.tuple([offerRowSchema, offerRowSchema, offerRowSchema]),
  }),

  investment: z.object({
    rows: z.tuple([investmentGroupSchema, investmentGroupSchema, investmentGroupSchema]),
  }),

  returnOnInvestment: z.object({
    overallImpact: longText(500),
    outcomeGroups: z.array(outcomeGroupSchema).min(1, "Add at least one return on investment"),
    closingStatement: z.string().optional().default(""),
  }),

  contact: z.object({
    name: z.string().min(1, "Required"),
    email: z.string().email("Enter a valid email"),
    link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  }),
});

export type Submission = z.infer<typeof submissionSchema>;
export type IndicatorItem = z.infer<typeof indicatorItemSchema>;
export type OutcomeGroup = z.infer<typeof outcomeGroupSchema>;
export type InvestmentOffer = z.infer<typeof investmentOfferSchema>;

export function offerRowTotal(offer: InvestmentOffer): number {
  return offer.amounts.reduce((a, b) => a + b, 0);
}

export function computeInvestmentTotals(investment: Submission["investment"]) {
  const groupTotals = investment.rows.map((offers) =>
    offers.reduce((sum, offer) => sum + offerRowTotal(offer), 0)
  );
  const periodTotals = [0, 1, 2, 3].map((periodIdx) =>
    investment.rows.reduce(
      (sum, offers) => sum + offers.reduce((s, offer) => s + offer.amounts[periodIdx], 0),
      0
    )
  );
  const grandTotal = groupTotals.reduce((a, b) => a + b, 0);
  return { groupTotals, periodTotals, grandTotal };
}

export const emptySubmission: Submission = {
  meta: { country: "", submittedByName: "", submittedByRole: "", submittedByEmail: "" },
  situation: {
    challenge: "",
    realityCheck: [
      { headline: "", detail: "" },
      { headline: "", detail: "" },
      { headline: "", detail: "" },
    ],
    results: [
      { headline: "", detail: "" },
      { headline: "", detail: "" },
      { headline: "", detail: "" },
    ],
  },
  advantage: { narrative: "" },
  offer: {
    intro: "",
    columnLabels: ["", ""],
    rows: [
      ["", ""],
      ["", ""],
      ["", ""],
    ],
  },
  investment: {
    rows: [
      [{ label: "", amounts: [0, 0, 0, 0] }, { label: "", amounts: [0, 0, 0, 0] }],
      [{ label: "", amounts: [0, 0, 0, 0] }, { label: "", amounts: [0, 0, 0, 0] }],
      [{ label: "", amounts: [0, 0, 0, 0] }, { label: "", amounts: [0, 0, 0, 0] }],
    ],
  },
  returnOnInvestment: { overallImpact: "", outcomeGroups: [{ title: "", points: "" }], closingStatement: "" },
  contact: { name: "", email: "", link: "" },
};
