-- Add quote decision tracking fields to Lead and WhatsAppLead
ALTER TABLE "Lead" ADD COLUMN "quoteViewedAt" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "proceedConfirmedAt" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "quoteDeclineReason" TEXT;

ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteViewedAt" DATETIME;
ALTER TABLE "WhatsAppLead" ADD COLUMN "proceedConfirmedAt" DATETIME;
ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteDeclineReason" TEXT;
