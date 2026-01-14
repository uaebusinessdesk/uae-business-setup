-- CreateTable
CREATE TABLE "WhatsAppLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'whatsapp',
    "brand" TEXT NOT NULL DEFAULT 'UAE Business Desk',
    "whatsappNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "serviceChoice" TEXT NOT NULL,
    "companyName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "assignedAgentId" TEXT,
    "lastMessageAt" TIMESTAMP,
    "rawPayload" TEXT
);

-- CreateIndex
CREATE INDEX "WhatsAppLead_whatsappNumber_idx" ON "WhatsAppLead"("whatsappNumber");

-- CreateIndex
CREATE INDEX "WhatsAppLead_email_idx" ON "WhatsAppLead"("email");

-- CreateIndex
CREATE INDEX "WhatsAppLead_status_idx" ON "WhatsAppLead"("status");

-- CreateIndex
CREATE INDEX "WhatsAppLead_createdAt_idx" ON "WhatsAppLead"("createdAt");

-- CreateIndex
CREATE INDEX "WhatsAppLead_whatsappNumber_createdAt_idx" ON "WhatsAppLead"("whatsappNumber", "createdAt");




