import { Router } from "express";
import { submissionSchema, computeInvestmentTotals } from "@undp-crisis-offer/shared";
import { prisma } from "../db/prisma";
import { generateSubmissionPdf } from "../pdf/generatePdf";
import { getPdfStorage } from "../storage/pdfStorage";
import { sendSubmissionEmail } from "../email/sendMail";

export const submitRouter = Router();

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
  const storage = getPdfStorage();

  let storageResult;
  try {
    storageResult = await storage.store(fileName, pdfBuffer);
  } catch (err) {
    console.error("PDF storage failed", err);
    return res.status(500).json({ error: "Failed to store PDF" });
  }

  const { grandTotal } = computeInvestmentTotals(submission.investment);

  const record = await prisma.submission.create({
    data: {
      country: submission.meta.country,
      submittedByName: submission.meta.submittedByName,
      submittedByRole: submission.meta.submittedByRole,
      submittedByEmail: submission.meta.submittedByEmail,
      totalAmountUsdMillions: grandTotal,
      data: submission as any,
      pdfStorageBackend: storageResult.backend,
      pdfBytes: storageResult.backend === "POSTGRES" ? pdfBuffer : undefined,
      pdfSharePointUrl: storageResult.backend === "SHAREPOINT" ? storageResult.url : undefined,
      pdfFileName: fileName,
    },
  });

  let emailSent = false;
  try {
    const result = await sendSubmissionEmail({
      toEmail: submission.meta.submittedByEmail,
      toName: submission.meta.submittedByName,
      subject: `Your submission: ${submission.meta.country} – Investing Beyond Crisis`,
      bodyHtml: `<p>Thank you for your submission for <strong>${submission.meta.country}</strong>.</p><p>Your "Investing Beyond Crisis" PDF is attached.</p>`,
      attachment: { fileName, contentBytes: pdfBuffer },
    });
    emailSent = result.sent;
    if (emailSent) {
      await prisma.submission.update({ where: { id: record.id }, data: { emailSentAt: new Date() } });
    }
  } catch (err) {
    console.error("Email send failed (submission was still saved)", err);
  }

  res.status(201).json({
    id: record.id,
    fileName,
    pdfStorageBackend: storageResult.backend,
    pdfUrl: storageResult.backend === "SHAREPOINT" ? storageResult.url : `/api/submissions/${record.id}/pdf`,
    emailSent,
  });
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
