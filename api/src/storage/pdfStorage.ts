import { ConfidentialClientApplication } from "@azure/msal-node";

export type PdfStorageResult =
  | { backend: "POSTGRES" }
  | { backend: "SHAREPOINT"; url: string };

/**
 * Every individual form answer, flattened to plain top-level scalars — for
 * backends that want to record a fully browsable index (e.g. a SharePoint
 * list item), not just a PDF. Deliberately flat (no nested arrays/objects):
 * reality-check/results indicators are capped at the form's own max of 6 and
 * sent as individually-numbered fields, and the uncapped repeating sections
 * (offer cells, investment line items, ROI groups) are each rendered as a
 * single readable text block instead. This means the receiving Power
 * Automate flow never needs to loop over an array to read this payload.
 */
export interface SubmissionRecordMeta {
  country: string;
  submittedByName: string;
  submittedByRole: string;
  submittedByEmail: string;
  submittedAt: string; // ISO timestamp
  totalAmountUsdMillions: number;

  challenge: string;
  advantageNarrative: string;
  offerIntro: string;
  roiOverallImpact: string;
  roiClosingStatement: string;
  contactName: string;
  contactEmail: string;
  contactLink: string;

  realityCheck1Headline: string;
  realityCheck1Detail: string;
  realityCheck2Headline: string;
  realityCheck2Detail: string;
  realityCheck3Headline: string;
  realityCheck3Detail: string;
  realityCheck4Headline: string;
  realityCheck4Detail: string;
  realityCheck5Headline: string;
  realityCheck5Detail: string;
  realityCheck6Headline: string;
  realityCheck6Detail: string;

  result1Headline: string;
  result1Detail: string;
  result2Headline: string;
  result2Detail: string;
  result3Headline: string;
  result3Detail: string;
  result4Headline: string;
  result4Detail: string;
  result5Headline: string;
  result5Detail: string;
  result6Headline: string;
  result6Detail: string;

  /** Offer intro + every column/row cell, as readable multi-line text. */
  offerDetailsText: string;
  /** Every investment line item + grand total, as readable multi-line text. */
  investmentDetailsText: string;
  /** Every return-on-investment group, as readable multi-line text. */
  roiDetailsText: string;

  /** Human-readable display ID, e.g. "BC_AFGHANISTAN_20260708175847_3GG3UQ". */
  submissionId: string;

  /**
   * Present only when the same flow that uploads the PDF should also send
   * the confirmation email (i.e. no separate email flow is configured) —
   * see isBackgroundStorageConfigured/isEmailConfigured in submit.ts.
   */
  email?: {
    toAddress: string;
    toName: string;
    subject: string;
    bodyHtml: string;
    /** Semicolon-separated, ready to drop straight into Outlook's Cc field. */
    cc: string;
  };
}

export interface PdfStorage {
  store(fileName: string, pdfBytes: Buffer, meta: SubmissionRecordMeta): Promise<PdfStorageResult>;
}

/** MVP default: PDF bytes live in the submission row itself. */
export class PostgresPdfStorage implements PdfStorage {
  async store(): Promise<PdfStorageResult> {
    return { backend: "POSTGRES" };
  }
}

/**
 * Uploads to a SharePoint document library via Microsoft Graph, using
 * app-only (client credentials) auth. Activates automatically once the
 * required env vars are present — see api/.env.example.
 */
export class SharePointPdfStorage implements PdfStorage {
  private msal: ConfidentialClientApplication;

  constructor(
    private config: {
      tenantId: string;
      clientId: string;
      clientSecret: string;
      siteId: string;
      folderPath: string; // e.g. "CrisisOffers" (root:/CrisisOffers)
    }
  ) {
    this.msal = new ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        clientSecret: config.clientSecret,
      },
    });
  }

  private async getToken(): Promise<string> {
    const result = await this.msal.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });
    if (!result?.accessToken) throw new Error("Failed to acquire Graph API token");
    return result.accessToken;
  }

  async store(fileName: string, pdfBytes: Buffer): Promise<PdfStorageResult> {
    const token = await this.getToken();
    const path = `${this.config.folderPath}/${fileName}`;
    const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${this.config.siteId}/drive/root:/${encodeURI(
      path
    )}:/content`;

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/pdf",
      },
      body: pdfBytes,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`SharePoint upload failed (${res.status}): ${body}`);
    }

    const json = (await res.json()) as { webUrl: string };
    return { backend: "SHAREPOINT", url: json.webUrl };
  }
}

/**
 * Uploads via an HTTP-triggered Power Automate flow instead of direct Graph
 * API access — no Azure AD app registration or admin consent required, since
 * the flow runs under whichever account was used to build it. The flow is
 * expected to accept `{ fileName, contentBase64, country, submittedByName,
 * submittedByRole, submittedByEmail, totalAmountUsdMillions, submittedAt }`,
 * upload the file, create a browsable list item from the metadata, and
 * respond with `{ webUrl }` pointing at the uploaded file. See
 * api/.env.example.
 */
export class PowerAutomatePdfStorage implements PdfStorage {
  constructor(private flowUrl: string) {}

  async store(fileName: string, pdfBytes: Buffer, meta: SubmissionRecordMeta): Promise<PdfStorageResult> {
    // Flatten `email` to top-level scalar fields rather than sending it as a
    // nested object — a flat payload is what let the flow avoid looping over
    // arrays/objects, keep it that way here too.
    const { email, ...rest } = meta;
    const res = await fetch(this.flowUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        contentBase64: pdfBytes.toString("base64"),
        ...rest,
        emailToAddress: email?.toAddress ?? "",
        emailToName: email?.toName ?? "",
        emailSubject: email?.subject ?? "",
        emailBodyHtml: email?.bodyHtml ?? "",
        emailCc: email?.cc ?? "",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Power Automate upload failed (${res.status}): ${body}`);
    }

    const json = (await res.json()) as { webUrl: string };
    return { backend: "SHAREPOINT", url: json.webUrl };
  }
}

export function getPdfStorage(): PdfStorage {
  const {
    POWER_AUTOMATE_UPLOAD_URL,
    AZURE_TENANT_ID,
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    SHAREPOINT_SITE_ID,
    SHAREPOINT_FOLDER_PATH,
  } = process.env;

  if (POWER_AUTOMATE_UPLOAD_URL) {
    return new PowerAutomatePdfStorage(POWER_AUTOMATE_UPLOAD_URL);
  }

  if (AZURE_TENANT_ID && AZURE_CLIENT_ID && AZURE_CLIENT_SECRET && SHAREPOINT_SITE_ID) {
    return new SharePointPdfStorage({
      tenantId: AZURE_TENANT_ID,
      clientId: AZURE_CLIENT_ID,
      clientSecret: AZURE_CLIENT_SECRET,
      siteId: SHAREPOINT_SITE_ID,
      folderPath: SHAREPOINT_FOLDER_PATH || "CrisisOffers",
    });
  }

  return new PostgresPdfStorage();
}

/**
 * True if an actual SharePoint upload will be attempted (i.e. `getPdfStorage`
 * won't just return the no-op Postgres backend). Lets callers skip invoking
 * `store()` entirely — and skip the background work / DB update that go with
 * it — when there's nothing to do beyond the synchronous Postgres save.
 */
export function isBackgroundStorageConfigured(): boolean {
  const { POWER_AUTOMATE_UPLOAD_URL, AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, SHAREPOINT_SITE_ID } =
    process.env;
  return Boolean(
    POWER_AUTOMATE_UPLOAD_URL || (AZURE_TENANT_ID && AZURE_CLIENT_ID && AZURE_CLIENT_SECRET && SHAREPOINT_SITE_ID)
  );
}
