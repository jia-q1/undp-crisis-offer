import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { OFFER_ROWS, Submission, computeInvestmentTotals, investmentRowLabel } from "@undp-crisis-offer/shared";
import { PdfLayout } from "./layout";

const CCAA_IMAGE_PATH = path.join(__dirname, "assets", "CCAA.png");

export async function generateSubmissionPdf(submission: Submission): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${submission.meta.country} - Investing Beyond Crisis`);
  doc.setAuthor("UNDP");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ccaaImageBytes = fs.readFileSync(CCAA_IMAGE_PATH);
  const ccaaImage = await doc.embedPng(ccaaImageBytes);

  const layout = new PdfLayout(doc, { regular, bold });

  layout.headerImage(ccaaImage);
  layout.title(`${submission.meta.country} – Investing Beyond Crisis`);
  layout.paragraph(
    `Submitted by ${submission.meta.submittedByName}, ${submission.meta.submittedByRole} (${submission.meta.submittedByEmail})`,
    { size: 9 }
  );
  layout.spacer(4);

  // 1) Situation on the ground
  layout.sectionHeading("1) The Situation on the Ground: The Challenge and Why It Matters Now");
  layout.paragraph(submission.situation.challenge);

  layout.subHeading("At a Glance");
  for (const indicator of submission.situation.realityCheck) {
    layout.bullet(indicator.headline, indicator.detail);
  }

  layout.subHeading("Results Speak for Themselves");
  for (const result of submission.situation.results) {
    layout.bullet(result.headline, result.detail);
  }

  // 2) UNDP's advantage
  layout.sectionHeading("2) UNDP's Advantage – Why UNDP, Why Now");
  layout.paragraph(submission.advantage.narrative);

  // 3) The offer
  layout.sectionHeading("3) The Offer: What UNDP Will Do");
  layout.paragraph(submission.offer.intro);
  layout.table(
    ["Context", ...submission.offer.columnLabels],
    OFFER_ROWS.map((label, rowIdx) => [label, ...submission.offer.rows[rowIdx]])
  );

  // 4) The investment
  layout.sectionHeading("4) The Investment");
  layout.paragraph(
    `Delivering this integrated area-based approach in ${submission.investment.districtsLabel} priority districts in ${submission.investment.provincesLabel} will require US$ ${submission.investment.totalAmountUsdMillions} million ${submission.investment.durationLabel}.`
  );
  layout.paragraph(submission.investment.selectionCriteria);
  layout.subHeading("Indicative Investment Allocation");

  const { rowTotals, columnTotals, grandTotal } = computeInvestmentTotals(submission.investment);
  const fmt = (n: number) => `US$${n}m`;
  const headers = ["Operational component", ...submission.investment.periodLabels, "Total"];
  const rows = submission.investment.rows.map((row, i) => {
    const { context, column } = investmentRowLabel(i, submission.offer.columnLabels);
    return [`${context}: ${column}`, ...row.map(fmt), fmt(rowTotals[i])];
  });
  rows.push(["Total", ...columnTotals.map(fmt), fmt(grandTotal)]);
  layout.table(headers, rows, { boldLastRow: true, boldLastCol: true });

  // 5) Return on investment
  layout.sectionHeading("5) The Return (of Investment): What Success Will Look Like in 24–36 Months");
  layout.paragraph(submission.returnOnInvestment.overallImpact);
  for (const group of submission.returnOnInvestment.outcomeGroups) {
    layout.subHeading(group.title);
    layout.paragraph(group.points);
  }
  if (submission.returnOnInvestment.closingStatement) {
    layout.paragraph(submission.returnOnInvestment.closingStatement);
  }

  // Contact
  layout.sectionHeading("For More Information");
  const contactLine = submission.contact.link
    ? `${submission.contact.name} — ${submission.contact.email} — ${submission.contact.link}`
    : `${submission.contact.name} — ${submission.contact.email}`;
  layout.paragraph(contactLine);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
