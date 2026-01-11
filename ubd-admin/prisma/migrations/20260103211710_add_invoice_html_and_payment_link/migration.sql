-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "companyInvoicePaymentLink" TEXT;
ALTER TABLE "Lead" ADD COLUMN "companyInvoiceHtml" TEXT;

-- AlterTable
ALTER TABLE "WhatsAppLead" ADD COLUMN "companyInvoicePaymentLink" TEXT;
ALTER TABLE "WhatsAppLead" ADD COLUMN "companyInvoiceHtml" TEXT;
