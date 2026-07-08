import { ConfidentialClientApplication } from "@azure/msal-node";

interface SendMailParams {
  toEmail: string;
  toName: string;
  subject: string;
  bodyHtml: string;
  attachment: { fileName: string; contentBytes: Buffer };
}

/** Comma-separated EMAIL_CC_ADDRESSES env var, parsed into a clean list. */
export function getCcAddresses(): string[] {
  return (process.env.EMAIL_CC_ADDRESSES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Sends via an HTTP-triggered Power Automate flow instead of direct Graph API
 * access — no Azure AD app registration or admin consent required. The flow
 * is expected to accept `{ toEmail, toName, subject, bodyHtml, cc, fileName,
 * contentBase64 }` (cc is a single semicolon-separated string, ready to drop
 * straight into Outlook's "Cc" field) and send the mail.
 */
async function sendViaPowerAutomate(flowUrl: string, params: SendMailParams, cc: string[]): Promise<{ sent: boolean }> {
  const res = await fetch(flowUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toEmail: params.toEmail,
      toName: params.toName,
      subject: params.subject,
      bodyHtml: params.bodyHtml,
      cc: cc.join(";"),
      fileName: params.attachment.fileName,
      contentBase64: params.attachment.contentBytes.toString("base64"),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Power Automate email send failed (${res.status}): ${body}`);
  }

  return { sent: true };
}

/**
 * Sends the confirmation email (with PDF attached) to the submitter, cc'ing
 * whoever is listed in EMAIL_CC_ADDRESSES. Prefers an HTTP-triggered Power
 * Automate flow (POWER_AUTOMATE_EMAIL_URL) if set, then falls back to direct
 * Microsoft Graph access, reusing the same Azure AD app registration as
 * SharePoint storage (application permission Mail.Send + a mailbox to send
 * from, GRAPH_SENDER_EMAIL). No-ops with a console log until either is
 * configured, so the rest of the flow is testable without either credential.
 */
export async function sendSubmissionEmail(params: SendMailParams): Promise<{ sent: boolean }> {
  const { POWER_AUTOMATE_EMAIL_URL, AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, GRAPH_SENDER_EMAIL } =
    process.env;
  const cc = getCcAddresses();

  if (POWER_AUTOMATE_EMAIL_URL) {
    return sendViaPowerAutomate(POWER_AUTOMATE_EMAIL_URL, params, cc);
  }

  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !GRAPH_SENDER_EMAIL) {
    console.log(
      `[sendSubmissionEmail] Mail not configured — skipping send to ${params.toEmail}. ` +
        `Set POWER_AUTOMATE_EMAIL_URL, or AZURE_TENANT_ID/AZURE_CLIENT_ID/AZURE_CLIENT_SECRET/GRAPH_SENDER_EMAIL, to enable.`
    );
    return { sent: false };
  }

  const msal = new ConfidentialClientApplication({
    auth: {
      clientId: AZURE_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
      clientSecret: AZURE_CLIENT_SECRET,
    },
  });
  const token = await msal.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });
  if (!token?.accessToken) throw new Error("Failed to acquire Graph API token for mail");

  const message = {
    message: {
      subject: params.subject,
      body: { contentType: "HTML", content: params.bodyHtml },
      toRecipients: [{ emailAddress: { address: params.toEmail, name: params.toName } }],
      ccRecipients: cc.map((address) => ({ emailAddress: { address } })),
      attachments: [
        {
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: params.attachment.fileName,
          contentType: "application/pdf",
          contentBytes: params.attachment.contentBytes.toString("base64"),
        },
      ],
    },
    saveToSentItems: true,
  };

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(GRAPH_SENDER_EMAIL)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Graph sendMail failed (${res.status}): ${body}`);
  }

  return { sent: true };
}

/** True if a real send will be attempted (Power Automate or Graph configured). */
export function isEmailConfigured(): boolean {
  const { POWER_AUTOMATE_EMAIL_URL, AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, GRAPH_SENDER_EMAIL } =
    process.env;
  return Boolean(
    POWER_AUTOMATE_EMAIL_URL || (AZURE_TENANT_ID && AZURE_CLIENT_ID && AZURE_CLIENT_SECRET && GRAPH_SENDER_EMAIL)
  );
}
