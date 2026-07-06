import { ConfidentialClientApplication } from "@azure/msal-node";

export type PdfStorageResult =
  | { backend: "POSTGRES" }
  | { backend: "SHAREPOINT"; url: string };

export interface PdfStorage {
  store(fileName: string, pdfBytes: Buffer): Promise<PdfStorageResult>;
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

export function getPdfStorage(): PdfStorage {
  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, SHAREPOINT_SITE_ID, SHAREPOINT_FOLDER_PATH } =
    process.env;

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
