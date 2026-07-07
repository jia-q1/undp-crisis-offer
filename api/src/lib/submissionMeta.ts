import type { Submission } from "@undp-crisis-offer/shared";
import type { SubmissionRecordMeta } from "../storage/pdfStorage";
import { buildInvestmentDetailsText, buildOfferDetailsText, buildRoiDetailsText } from "./submissionText";

function slot(items: { headline: string; detail: string }[], index: number): { headline: string; detail: string } {
  return items[index] ?? { headline: "", detail: "" };
}

export function buildSubmissionRecordMeta(
  submission: Submission,
  opts: { totalAmountUsdMillions: number; submittedAt: string }
): SubmissionRecordMeta {
  const rc = submission.situation.realityCheck;
  const rs = submission.situation.results;

  return {
    country: submission.meta.country,
    submittedByName: submission.meta.submittedByName,
    submittedByRole: submission.meta.submittedByRole,
    submittedByEmail: submission.meta.submittedByEmail,
    submittedAt: opts.submittedAt,
    totalAmountUsdMillions: opts.totalAmountUsdMillions,

    challenge: submission.situation.challenge,
    advantageNarrative: submission.advantage.narrative,
    offerIntro: submission.offer.intro,
    roiOverallImpact: submission.returnOnInvestment.overallImpact,
    roiClosingStatement: submission.returnOnInvestment.closingStatement ?? "",
    contactName: submission.contact.name,
    contactEmail: submission.contact.email,
    contactLink: submission.contact.link ?? "",

    realityCheck1Headline: slot(rc, 0).headline,
    realityCheck1Detail: slot(rc, 0).detail,
    realityCheck2Headline: slot(rc, 1).headline,
    realityCheck2Detail: slot(rc, 1).detail,
    realityCheck3Headline: slot(rc, 2).headline,
    realityCheck3Detail: slot(rc, 2).detail,
    realityCheck4Headline: slot(rc, 3).headline,
    realityCheck4Detail: slot(rc, 3).detail,
    realityCheck5Headline: slot(rc, 4).headline,
    realityCheck5Detail: slot(rc, 4).detail,
    realityCheck6Headline: slot(rc, 5).headline,
    realityCheck6Detail: slot(rc, 5).detail,

    result1Headline: slot(rs, 0).headline,
    result1Detail: slot(rs, 0).detail,
    result2Headline: slot(rs, 1).headline,
    result2Detail: slot(rs, 1).detail,
    result3Headline: slot(rs, 2).headline,
    result3Detail: slot(rs, 2).detail,
    result4Headline: slot(rs, 3).headline,
    result4Detail: slot(rs, 3).detail,
    result5Headline: slot(rs, 4).headline,
    result5Detail: slot(rs, 4).detail,
    result6Headline: slot(rs, 5).headline,
    result6Detail: slot(rs, 5).detail,

    offerDetailsText: buildOfferDetailsText(submission),
    investmentDetailsText: buildInvestmentDetailsText(submission),
    roiDetailsText: buildRoiDetailsText(submission),
  };
}
