-- Add quote decision tracking fields to Lead and WhatsAppLead
ALTER TABLE "Lead" ADD COLUMN "quoteViewedAt" TIMESTAMP;
ALTER TABLE "Lead" ADD COLUMN "proceedConfirmedAt" TIMESTAMP;
ALTER TABLE "Lead" ADD COLUMN "quoteDeclineReason" TEXT;

ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteViewedAt" TIMESTAMP;
ALTER TABLE "WhatsAppLead" ADD COLUMN "proceedConfirmedAt" TIMESTAMP;
ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteDeclineReason" TEXT;
