-- Add quoteDeclinedAt to Lead and WhatsAppLead
ALTER TABLE "Lead" ADD COLUMN "quoteDeclinedAt" DATETIME;
ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteDeclinedAt" DATETIME;
