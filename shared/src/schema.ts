import { z } from "zod";

/**
 * Single source of truth for the "Investing Beyond Crisis" country offer form.
 * Modeled directly on the Afghanistan example doc. Both the React client and
 * the Express API import this so validation never drifts between the two.
 */

export const OFFER_ROWS = ["Prepare and Prevent", "Respond and Recover", "Transition and Transform"] as const;

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
    totalAmountUsdMillions: z.number().positive("Enter a positive number"),
    durationLabel: z.string().min(1, "Required"),
    districtsLabel: z.string().min(1, "Required"),
    provincesLabel: z.string().min(1, "Required"),
    selectionCriteria: z.string().min(1, "Required"),
    periodLabels: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
    rows: z
      .array(z.tuple([z.number(), z.number(), z.number(), z.number()]))
      .min(1, "Add at least one row"),
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

export function investmentRowLabel(rowIndex: number, offerColumnLabels: readonly string[]) {
  const numColumns = offerColumnLabels.length || 1;
  const contextIndex = Math.floor(rowIndex / numColumns);
  const columnIndex = rowIndex % numColumns;
  return { context: OFFER_ROWS[contextIndex] ?? "", column: offerColumnLabels[columnIndex] ?? "" };
}

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
    columnLabels: [""],
    rows: [[""], [""], [""]],
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
    ],
  },
  returnOnInvestment: { overallImpact: "", outcomeGroups: [{ title: "", points: "" }], closingStatement: "" },
  contact: { name: "", email: "", link: "" },
};
