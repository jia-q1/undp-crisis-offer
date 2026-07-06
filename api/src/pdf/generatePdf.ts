import { PDFDocument, StandardFonts } from "pdf-lib";
import { OFFER_MATRIX, Submission, computeInvestmentTotals } from "@undp-crisis-offer/shared";
import { PdfLayout } from "./layout";

export async function generateSubmissionPdf(submission: Submission): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${submission.meta.country} - Investing Beyond Crisis`);
  doc.setAuthor("UNDP");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const layout = new PdfLayout(doc, { regular, bold });

  layout.title(`${submission.meta.country} – Investing Beyond Crisis`);
  layout.paragraph(
    `Submitted by ${submission.meta.submittedByName}, ${submission.meta.submittedByRole} (${submission.meta.submittedByEmail})`,
    { size: 9 }
  );
  layout.spacer(4);

  // 1) Situation on the ground
  layout.sectionHeading("1) The situation on the ground: The challenge and why it matters now");
  layout.paragraph(submission.situation.challenge);

  layout.subHeading("At a glance");
  for (const stat of submission.situation.realityCheck) {
    layout.bullet(stat.headline, stat.detail);
  }

  layout.subHeading("Results speak for themselves");
  for (const result of submission.situation.results) {
    layout.bullet(result.headline, result.detail);
  }

  // 2) UNDP's advantage
  layout.sectionHeading("2) UNDP's advantage – why UNDP, why now");
  layout.paragraph(submission.advantage.narrative);

  // 3) The offer
  layout.sectionHeading("3) The offer: What UNDP will do");
  layout.paragraph(submission.offer.intro);
  submission.offer.blocks.forEach((block, i) => {
    const { phase, pillar } = OFFER_MATRIX[i];
    layout.subHeading(`${phase} / ${pillar}`);
    layout.paragraph(block.tagline, { size: 10.5 });
    layout.paragraph(block.description);
  });

  // 4) The investment
  layout.sectionHeading("4) The Investment");
  layout.paragraph(
    `Delivering this integrated area-based approach in ${submission.investment.districtsLabel} priority districts in ${submission.investment.provincesLabel} will require US$ ${submission.investment.totalAmountUsdMillions} million ${submission.investment.durationLabel}.`
  );
  layout.paragraph(submission.investment.selectionCriteria);
  layout.subHeading("Indicative investment allocation");

  const { rowTotals, columnTotals, grandTotal } = computeInvestmentTotals(submission.investment);
  const fmt = (n: number) => `US$${n}m`;
  const headers = ["Operational component", ...submission.investment.periodLabels, "Total"];
  const rows = submission.investment.rows.map((row, i) => {
    const { phase, pillar } = OFFER_MATRIX[i];
    return [`${phase}: ${pillar}`, ...row.map(fmt), fmt(rowTotals[i])];
  });
  rows.push(["Total", ...columnTotals.map(fmt), fmt(grandTotal)]);
  layout.table(headers, rows, { boldLastRow: true, boldLastCol: true });

  // 5) Return on investment
  layout.sectionHeading("5) The Return (of investment): What success will look like in 24–36 months");
  layout.paragraph(submission.returnOnInvestment.overallImpact);
  for (const group of submission.returnOnInvestment.outcomeGroups) {
    layout.subHeading(group.title);
    if (group.roiHighlight) {
      layout.paragraph(`Return on investment: ${group.roiHighlight}`, { size: 10.5 });
    }
    for (const bullet of group.bullets) {
      layout.simpleBullet(bullet);
    }
  }
  if (submission.returnOnInvestment.closingStatement) {
    layout.paragraph(submission.returnOnInvestment.closingStatement);
  }

  // Contact
  layout.sectionHeading("For more information");
  const contactLine = submission.contact.link
    ? `${submission.contact.name} — ${submission.contact.email} — ${submission.contact.link}`
    : `${submission.contact.name} — ${submission.contact.email}`;
  layout.paragraph(contactLine);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
