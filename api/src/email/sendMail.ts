import { ConfidentialClientApplication } from "@azure/msal-node";

interface SendMailParams {
  toEmail: string;
  toName: string;
  subject: string;
  bodyHtml: string;
  attachment: { fileName: string; contentBytes: Buffer };
}

/**
 * Sends the confirmation email (with PDF attached) via Microsoft Graph,
 * reusing the same Azure AD app registration as SharePoint storage.
 * Requires application permission Mail.Send + a mailbox to send from
 * (GRAPH_SENDER_EMAIL). No-ops with a console log until configured, so the
 * rest of the flow is testable without Azure AD credentials.
 */
export async function sendSubmissionEmail(params: SendMailParams): Promise<{ sent: boolean }> {
  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, GRAPH_SENDER_EMAIL, INTERNAL_NOTIFY_EMAIL } =
    process.env;

  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !GRAPH_SENDER_EMAIL) {
    console.log(
      `[sendSubmissionEmail] Azure AD mail not configured — skipping send to ${params.toEmail}. ` +
        `Set AZURE_TENANT_ID/AZURE_CLIENT_ID/AZURE_CLIENT_SECRET/GRAPH_SENDER_EMAIL to enable.`
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

  const recipients = [{ emailAddress: { address: params.toEmail, name: params.toName } }];
  if (INTERNAL_NOTIFY_EMAIL) {
    recipients.push({ emailAddress: { address: INTERNAL_NOTIFY_EMAIL, name: "UNDP Crisis Offers" } });
  }

  const message = {
    message: {
      subject: params.subject,
      body: { contentType: "HTML", content: params.bodyHtml },
      toRecipients: recipients,
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
