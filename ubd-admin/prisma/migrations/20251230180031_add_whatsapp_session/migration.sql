-- CreateTable
CREATE TABLE "WhatsAppSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "step" TEXT NOT NULL DEFAULT 'SERVICE',
    "data" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppSession_phone_key" ON "WhatsAppSession"("phone");

-- CreateIndex
CREATE INDEX "WhatsAppSession_updatedAt_idx" ON "WhatsAppSession"("updatedAt");





