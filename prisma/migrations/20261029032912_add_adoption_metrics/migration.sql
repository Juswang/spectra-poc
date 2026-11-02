-- CreateTable
CREATE TABLE "AdoptionMetric" (
    "id" TEXT NOT NULL,
    "agencyCode" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "provisioned" INTEGER NOT NULL,
    "active" INTEGER NOT NULL,
    "daily" INTEGER NOT NULL,
    "emails" INTEGER NOT NULL DEFAULT 0,
    "spam" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hosts" INTEGER NOT NULL DEFAULT 0,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdoptionMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdoptionMetric_month_idx" ON "AdoptionMetric"("month");

-- CreateIndex
CREATE INDEX "AdoptionMetric_agencyCode_idx" ON "AdoptionMetric"("agencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionMetric_agencyCode_month_product_key" ON "AdoptionMetric"("agencyCode", "month", "product");

-- AddForeignKey
ALTER TABLE "AdoptionMetric" ADD CONSTRAINT "AdoptionMetric_agencyCode_fkey" FOREIGN KEY ("agencyCode") REFERENCES "Agency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
