# UNDP Investing Beyond Crisis — Country Offer Form

A step-by-step (Typeform-style) form for UNDP country offices to submit their "Investing Beyond Crisis" country offer. Submitting generates a branded PDF, stores the submission, and emails a copy back to the submitter.

## How it works

1. A user fills out the form one question (or small group of questions) at a time, with a progress bar tracking their section and overall %.
2. On submit, the backend validates the answers, generates a PDF matching the UNDP-branded layout, and stores both the raw answers and the PDF.
3. The user lands on a thank-you screen with a link to their PDF.

## Project structure

This is an npm-workspaces monorepo with three packages:

```
client/   React + Vite + Tailwind — the form itself
api/      Express + Prisma — validation, PDF generation, storage, email
shared/   Zod schema — single source of truth for the form's shape, imported by both client and api
```

### Key files
- `shared/src/schema.ts` — the form's data shape and validation rules
- `client/src/form/steps.tsx` — the ordered list of steps/questions
- `client/src/form/referenceContent.ts` — excerpts from the Afghanistan example doc, shown as a reference panel per step
- `api/src/pdf/generatePdf.ts` + `api/src/pdf/layout.ts` — builds the PDF natively (not a converted Word doc — see note below)
- `api/src/storage/pdfStorage.ts` — where the PDF is saved; auto-switches from Postgres to SharePoint once Azure AD env vars are set
- `api/src/email/sendMail.ts` — confirmation email via Microsoft Graph; no-ops until Azure AD env vars are set

**Why the PDF isn't a converted Word doc**: converting `.docx` → PDF at request time needs a LibreOffice-class engine, which doesn't run in Vercel's serverless environment without a third-party conversion API. Instead, the PDF is built natively with `pdf-lib`, matching the same structure/branding as the Afghanistan example, but constructed directly rather than rendered from the Word file.

## Local development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up the database
Copy `api/.env.example` to `api/.env` and set `DATABASE_URL` (a Postgres connection string — [Neon](https://neon.tech) works well and is what this project was developed against). Then run:
```bash
npm run db:migrate
```

### 3. Run everything
```bash
npm run dev
```
This builds `shared`, then runs the API (`localhost:4000`) and client (`localhost:5173`) together. The client's Vite dev server proxies `/api` requests to the API automatically.

## Environment variables

All live in `api/.env` locally, or as Vercel project environment variables in production. See `api/.env.example` for the full list. None are required to run the app locally except `DATABASE_URL` — everything else activates automatically once set:

| Variable | Enables |
|---|---|
| `DATABASE_URL` | Postgres connection (required) |
| `POWER_AUTOMATE_UPLOAD_URL` | Uploading PDFs to SharePoint via an HTTP-triggered Power Automate flow — no Azure AD app registration needed. Takes priority over the Graph API path if both are set. |
| `POWER_AUTOMATE_EMAIL_URL` | Sending the confirmation email via an HTTP-triggered Power Automate flow — no Azure AD app registration needed. Takes priority over the Graph API path if both are set. |
| `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` | Microsoft Graph API access (SharePoint upload if `POWER_AUTOMATE_UPLOAD_URL` isn't set, email if `POWER_AUTOMATE_EMAIL_URL` isn't set) |
| `SHAREPOINT_SITE_ID`, `SHAREPOINT_FOLDER_PATH` | Uploading PDFs to SharePoint via direct Graph API instead of just Postgres |
| `GRAPH_SENDER_EMAIL` | Sending the confirmation email via direct Graph API |
| `EMAIL_CC_ADDRESSES` | Comma-separated addresses cc'd on every confirmation email (works with either email path) |

## Deployment (Vercel)

This deploys as **two separate Vercel projects** from this same repo, since the API needs to run as a serverless function while the client is a static build:

- **API project** — Root Directory `api`, Framework Preset "Other". Env vars: `DATABASE_URL` (required), plus whichever of the table above are ready.
- **Client project** — Root Directory `client`, Framework Preset "Vite". Env vars: `VITE_API_URL` set to the API project's deployed URL.

Both projects' `vercel.json` files handle the npm-workspaces build order automatically (building `shared` before whichever project needs it).

## Current status

- ✅ Form, PDF generation, and Postgres storage: fully working
- ✅ SharePoint upload via Power Automate: `PowerAutomatePdfStorage` posts the PDF to an HTTP-triggered flow and auto-activates once `POWER_AUTOMATE_UPLOAD_URL` is set — no Azure AD app registration needed. `SharePointPdfStorage` (direct Graph API) remains as a fallback if you'd rather use that path instead.
- ✅ Confirmation email via Power Automate: sends an HTML summary of the submission (see `buildSubmissionEmailHtml`) plus the PDF attached, via an HTTP-triggered flow once `POWER_AUTOMATE_EMAIL_URL` is set — no Azure AD app registration needed. Direct Graph API remains as a fallback.
