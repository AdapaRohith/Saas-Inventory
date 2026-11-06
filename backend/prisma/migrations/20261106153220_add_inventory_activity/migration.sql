-- CreateEnum
CREATE TYPE "StockChangeType" AS ENUM ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "InventoryActivity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "changeType" "StockChangeType" NOT NULL,
    "previousQuantity" INTEGER NOT NULL,
    "newQuantity" INTEGER NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryActivity_organizationId_createdAt_idx" ON "InventoryActivity"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryActivity_productId_idx" ON "InventoryActivity"("productId");

-- AddForeignKey
ALTER TABLE "InventoryActivity" ADD CONSTRAINT "InventoryActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryActivity" ADD CONSTRAINT "InventoryActivity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
