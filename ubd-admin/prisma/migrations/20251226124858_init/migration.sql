-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "fullName" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "nationality" TEXT,
    "residenceCountry" TEXT,
    "setupType" TEXT NOT NULL,
    "activity" TEXT,
    "shareholdersCount" INTEGER,
    "visasRequired" BOOLEAN,
    "visasCount" INTEGER,
    "timeline" TEXT,
    "notes" TEXT,
    "assignedTo" TEXT NOT NULL DEFAULT 'unassigned',
    "sentToAgentAt" TIMESTAMP,
    "feasible" BOOLEAN,
    "estimatedCostMinAed" INTEGER,
    "estimatedCostMaxAed" INTEGER,
    "estimatedTimelineText" TEXT,
    "riskNotes" TEXT,
    "invoiceStatus" TEXT NOT NULL DEFAULT 'not_sent',
    "invoiceAmountAed" INTEGER,
    "invoiceSentAt" TIMESTAMP,
    "paidAt" TIMESTAMP,
    "stage" TEXT NOT NULL DEFAULT 'new',
    "dropReason" TEXT
);

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

-- CreateIndex
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");

-- CreateIndex
CREATE INDEX "Lead_invoiceStatus_idx" ON "Lead"("invoiceStatus");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
