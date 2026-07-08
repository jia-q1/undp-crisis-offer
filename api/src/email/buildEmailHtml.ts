function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * The confirmation email body. Deliberately simple — full detail lives in the
 * attached PDF, so this is just a receipt: greeting, confirmation, a display
 * ID for reference, and the country office.
 */
export function buildConfirmationEmailHtml(params: { name: string; country: string; submissionId: string }): string {
  return `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1e293b;line-height:1.6;">
  <p>Dear ${escapeHtml(params.name)},</p>
  <p>Thank you for submitting your response to the Investing Beyond Crisis Country Office Survey.</p>
  <p>Your submission has been received successfully.</p>
  <p>
    Submission ID: ${escapeHtml(params.submissionId)}<br />
    Country Office: ${escapeHtml(params.country.toUpperCase())}
  </p>
  <p>Kind regards,<br />Crisis Bureau</p>
</div>`;
}
