-- Add WhatsApp quote notification tracking fields to Lead and WhatsAppLead
ALTER TABLE "Lead" ADD COLUMN "quoteWhatsAppSentAt" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "quoteWhatsAppMessageId" TEXT;

ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteWhatsAppSentAt" DATETIME;
ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteWhatsAppMessageId" TEXT;
