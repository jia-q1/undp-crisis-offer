import { INVESTMENT_PERIODS, OFFER_ROWS, computeInvestmentTotals, offerRowTotal, type Submission } from "@undp-crisis-offer/shared";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function paragraph(text?: string): string {
  return `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#1e293b;white-space:pre-wrap;">${escapeHtml(text || "")}</p>`;
}

function bulletList(items: { headline: string; detail: string }[]): string {
  const lis = items
    .map((item) => `<li style="margin-bottom:4px;"><strong>${escapeHtml(item.headline)}</strong> ${escapeHtml(item.detail)}</li>`)
    .join("");
  return `<ul style="margin:0 0 8px;padding-left:20px;font-size:14px;color:#1e293b;">${lis}</ul>`;
}

function section(title: string, innerHtml: string): string {
  return `
    <tr>
      <td style="padding:16px 0;border-top:1px solid #e2e8f0;">
        <h2 style="margin:0 0 8px;font-size:16px;color:#1F3F77;">${escapeHtml(title)}</h2>
        ${innerHtml}
      </td>
    </tr>`;
}

/** Renders an HTML summary of the submission for the confirmation email body. */
export function buildSubmissionEmailHtml(submission: Submission): string {
  const { grandTotal } = computeInvestmentTotals(submission.investment);

  const investmentItems = OFFER_ROWS.flatMap((contextLabel, groupIndex) =>
    submission.investment.rows[groupIndex].map((offer) => {
      const rowLabel = offer.label ? `${contextLabel}: ${offer.label}` : contextLabel;
      const amounts = offer.amounts.map((v) => `US$${v || 0}m`).join(" / ");
      return { headline: rowLabel, detail: `${amounts} — Total US$${offerRowTotal(offer)}m` };
    })
  );

  const roiItems = submission.returnOnInvestment.outcomeGroups.map((g) => ({ headline: g.title, detail: g.points }));

  const contactLine = submission.contact.link
    ? `${submission.contact.name} — ${submission.contact.email} — ${submission.contact.link}`
    : `${submission.contact.name} — ${submission.contact.email}`;

  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
  <p style="font-size:14px;color:#1e293b;">
    Thank you for submitting the Country Crisis Action Agenda for <strong>${escapeHtml(submission.meta.country)}</strong>.
    The full PDF is attached — here's a summary of what you submitted:
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${section(
      "Situation on the ground",
      paragraph(submission.situation.challenge) + bulletList(submission.situation.realityCheck) + bulletList(submission.situation.results)
    )}
    ${section("UNDP's advantage", paragraph(submission.advantage.narrative))}
    ${section(
      "The offer",
      paragraph(submission.offer.intro) +
        `<p style="margin:0 0 8px;font-size:14px;color:#1e293b;"><strong>Columns:</strong> ${escapeHtml(submission.offer.columnLabels.join(", "))}</p>`
    )}
    ${section(
      "Indicative investment allocation",
      bulletList(investmentItems) +
        `<p style="margin:0;font-size:14px;color:#1e293b;"><strong>Grand total:</strong> US$${grandTotal}m across ${INVESTMENT_PERIODS.join(", ")}</p>`
    )}
    ${section(
      "Return on investment",
      paragraph(submission.returnOnInvestment.overallImpact) + bulletList(roiItems)
    )}
    ${section("Contact", paragraph(contactLine))}
  </table>
</div>`;
}
