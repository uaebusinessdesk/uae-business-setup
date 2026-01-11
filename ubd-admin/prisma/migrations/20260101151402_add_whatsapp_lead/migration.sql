-- CreateTable
CREATE TABLE "WhatsAppLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'whatsapp',
    "brand" TEXT NOT NULL DEFAULT 'UAE Business Desk',
    "whatsappNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "serviceChoice" TEXT NOT NULL,
    "companyName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "assignedAgentId" TEXT,
    "lastMessageAt" DATETIME,
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




