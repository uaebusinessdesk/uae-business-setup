-- CreateTable
CREATE TABLE "CronRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "ranAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" INTEGER,
    "sent" INTEGER,
    "skipped" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "CronRun_type_ranAt_idx" ON "CronRun"("type", "ranAt");
