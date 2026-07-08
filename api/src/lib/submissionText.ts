import { INVESTMENT_PERIODS, OFFER_ROWS, computeInvestmentTotals, offerRowTotal, type Submission } from "@undp-crisis-offer/shared";

/** Plain-text rendering of the offer intro + every column/row cell. */
export function buildOfferDetailsText(submission: Submission): string {
  return [
    submission.offer.intro,
    `Columns: ${submission.offer.columnLabels.join(", ")}`,
    ...OFFER_ROWS.flatMap((label, rowIdx) =>
      submission.offer.rows[rowIdx].map((cell, colIdx) => `${label} / ${submission.offer.columnLabels[colIdx]}: ${cell}`)
    ),
  ].join("\n");
}

/** Plain-text rendering of every investment line item plus the grand total. */
export function buildInvestmentDetailsText(submission: Submission): string {
  const { grandTotal } = computeInvestmentTotals(submission.investment);
  const lines = OFFER_ROWS.flatMap((contextLabel, groupIndex) =>
    submission.investment.rows[groupIndex].map((offer) => {
      const rowLabel = offer.label ? `${contextLabel}: ${offer.label}` : contextLabel;
      const amounts = offer.amounts.map((v) => `US$${v || 0}m`).join(" / ");
      return `${rowLabel}: ${amounts} (Total US$${offerRowTotal(offer)}m)`;
    })
  );
  lines.push(`Grand total: US$${grandTotal}m across ${INVESTMENT_PERIODS.join(", ")}`);
  return lines.join("\n");
}

/** Plain-text rendering of every return-on-investment group. */
export function buildRoiDetailsText(submission: Submission): string {
  return submission.returnOnInvestment.outcomeGroups.map((g) => `${g.title}: ${g.points}`).join("\n");
}
