-- Add quoteDeclinedAt to Lead and WhatsAppLead
ALTER TABLE "Lead" ADD COLUMN "quoteDeclinedAt" TIMESTAMP;
ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteDeclinedAt" TIMESTAMP;
