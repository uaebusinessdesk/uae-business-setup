-- Add WhatsApp quote notification tracking fields to Lead and WhatsAppLead
ALTER TABLE "Lead" ADD COLUMN "quoteWhatsAppSentAt" TIMESTAMP;
ALTER TABLE "Lead" ADD COLUMN "quoteWhatsAppMessageId" TEXT;

ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteWhatsAppSentAt" TIMESTAMP;
ALTER TABLE "WhatsAppLead" ADD COLUMN "quoteWhatsAppMessageId" TEXT;
