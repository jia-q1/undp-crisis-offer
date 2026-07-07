import { Router } from "express";
import { waitUntil } from "@vercel/functions";
import { submissionSchema, computeInvestmentTotals } from "@undp-crisis-offer/shared";
import { prisma } from "../db/prisma";
import { generateSubmissionPdf } from "../pdf/generatePdf";
import { getPdfStorage, isBackgroundStorageConfigured } from "../storage/pdfStorage";
import { sendSubmissionEmail, isEmailConfigured } from "../email/sendMail";
import { buildSubmissionEmailHtml } from "../email/buildEmailHtml";
import { buildSubmissionPlainText } from "../lib/submissionText";
import { buildSubmissionRecordMeta } from "../lib/submissionMeta";
import { withTimeout } from "../lib/withTimeout";

export const submitRouter = Router();

// Bounds the background SharePoint upload / email send below Vercel's
// serverless function duration limit, so a slow external call can't hang
// past it — see README's "Current status" for the full story.
const BACKGROUND_TASK_TIMEOUT_MS = 8000;

submitRouter.post("/submit", async (req, res) => {
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
  }
  const submission = parsed.data;

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateSubmissionPdf(submission);
  } catch (err) {
    console.error("PDF generation failed", err);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }

  const fileName = `${submission.meta.country.replace(/[^a-z0-9]+/gi, "-")}-investing-beyond-crisis-${Date.now()}.pdf`;
  const { grandTotal } = computeInvestmentTotals(submission.investment);

  // Always save the PDF bytes to Postgres synchronously first. This is fast
  // and guarantees a working download link regardless of what happens with
  // the slower SharePoint upload / email send below.
  const record = await prisma.submission.create({
    data: {
      country: submission.meta.country,
      submittedByName: submission.meta.submittedByName,
      submittedByRole: submission.meta.submittedByRole,
      submittedByEmail: submission.meta.submittedByEmail,
      totalAmountUsdMillions: grandTotal,
      data: submission as any,
      pdfStorageBackend: "POSTGRES",
      pdfBytes: pdfBuffer,
      pdfFileName: fileName,
    },
  });

  const emailWillSend = isEmailConfigured();

  res.status(201).json({
    id: record.id,
    fileName,
    pdfStorageBackend: "POSTGRES",
    pdfUrl: `/api/submissions/${record.id}/pdf`,
    emailWillSend,
  });

  // Everything below runs after the response has already been sent. It's
  // best-effort: each task is capped by BACKGROUND_TASK_TIMEOUT_MS, and if it
  // doesn't finish in time (or fails), the submission just stays
  // Postgres-only / unemailed — both of which are already fine fallbacks.
  waitUntil(
    (async () => {
      if (isBackgroundStorageConfigured()) {
        try {
          const result = await withTimeout(
            getPdfStorage().store(
              fileName,
              pdfBuffer,
              buildSubmissionRecordMeta(submission, {
                totalAmountUsdMillions: grandTotal,
                submittedAt: record.createdAt.toISOString(),
              })
            ),
            BACKGROUND_TASK_TIMEOUT_MS,
            "PDF storage upload"
          );
          if (result.backend === "SHAREPOINT") {
            await prisma.submission.update({
              where: { id: record.id },
              data: { pdfStorageBackend: "SHAREPOINT", pdfSharePointUrl: result.url },
            });
          }
        } catch (err) {
          console.error("Background PDF storage upload failed (Postgres copy still available)", err);
        }
      }

      if (emailWillSend) {
        try {
          const result = await withTimeout(
            sendSubmissionEmail({
              toEmail: submission.meta.submittedByEmail,
              toName: submission.meta.submittedByName,
              subject: `Your submission: ${submission.meta.country} – Investing Beyond Crisis`,
              bodyHtml: buildSubmissionEmailHtml(submission),
              attachment: { fileName, contentBytes: pdfBuffer },
            }),
            BACKGROUND_TASK_TIMEOUT_MS,
            "Email send"
          );
          if (result.sent) {
            await prisma.submission.update({ where: { id: record.id }, data: { emailSentAt: new Date() } });
          }
        } catch (err) {
          console.error("Background email send failed", err);
        }
      }
    })()
  );
});

submitRouter.get("/submissions/:id/pdf", async (req, res) => {
  const record = await prisma.submission.findUnique({ where: { id: req.params.id } });
  if (!record || !record.pdfBytes) {
    return res.status(404).json({ error: "PDF not found" });
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${record.pdfFileName}"`);
  res.send(Buffer.from(record.pdfBytes));
});
