-- CreateEnum
CREATE TYPE "PdfStorageBackend" AS ENUM ('POSTGRES', 'SHAREPOINT');

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT NOT NULL,
    "submittedByName" TEXT NOT NULL,
    "submittedByRole" TEXT NOT NULL,
    "submittedByEmail" TEXT NOT NULL,
    "totalAmountUsdMillions" DOUBLE PRECISION NOT NULL,
    "data" JSONB NOT NULL,
    "pdfStorageBackend" "PdfStorageBackend" NOT NULL DEFAULT 'POSTGRES',
    "pdfBytes" BYTEA,
    "pdfSharePointUrl" TEXT,
    "pdfFileName" TEXT NOT NULL,
    "emailSentAt" TIMESTAMP(3),

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_country_idx" ON "Submission"("country");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");
