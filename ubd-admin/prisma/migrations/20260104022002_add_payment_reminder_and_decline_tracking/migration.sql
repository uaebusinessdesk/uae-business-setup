-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "paymentReminderSentAt" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "paymentReminderCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Lead" ADD COLUMN "declinedAt" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "declineReason" TEXT;
ALTER TABLE "Lead" ADD COLUMN "declineStage" TEXT;

-- AlterTable
ALTER TABLE "WhatsAppLead" ADD COLUMN "paymentReminderSentAt" DATETIME;
ALTER TABLE "WhatsAppLead" ADD COLUMN "paymentReminderCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "WhatsAppLead" ADD COLUMN "declinedAt" DATETIME;
ALTER TABLE "WhatsAppLead" ADD COLUMN "declineReason" TEXT;
ALTER TABLE "WhatsAppLead" ADD COLUMN "declineStage" TEXT;
