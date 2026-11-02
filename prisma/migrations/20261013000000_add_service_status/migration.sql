-- CreateTable
CREATE TABLE "ServiceStatus" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "httpStatusCode" INTEGER NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "isUp" BOOLEAN NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceStatus_serviceName_checkedAt_idx" ON "ServiceStatus"("serviceName", "checkedAt");