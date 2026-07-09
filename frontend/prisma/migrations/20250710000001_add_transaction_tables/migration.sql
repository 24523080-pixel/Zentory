-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "noTransaksi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kasirId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "productId" TEXT,
    "sku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "hargaSatuan" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_noTransaksi_key" ON "Transaction"("noTransaksi");

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
