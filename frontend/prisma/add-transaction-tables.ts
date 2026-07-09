import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as never)

async function main() {
  await (prisma as any).$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Transaction" (
      "id"          TEXT NOT NULL,
      "noTransaksi" TEXT NOT NULL,
      "tanggal"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "kasirId"     TEXT,
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
    );
  `)
  console.log('✅ Tabel Transaction dibuat / sudah ada')

  await (prisma as any).$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_noTransaksi_key"
    ON "Transaction"("noTransaksi");
  `)
  console.log('✅ Index noTransaksi dibuat')

  await (prisma as any).$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TransactionItem" (
      "id"            TEXT NOT NULL,
      "transactionId" TEXT NOT NULL,
      "productId"     TEXT,
      "sku"           TEXT NOT NULL,
      "productName"   TEXT NOT NULL,
      "qty"           INTEGER NOT NULL,
      "hargaSatuan"   DOUBLE PRECISION NOT NULL,
      CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
    );
  `)
  console.log('✅ Tabel TransactionItem dibuat / sudah ada')

  await (prisma as any).$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'TransactionItem_transactionId_fkey'
      ) THEN
        ALTER TABLE "TransactionItem"
          ADD CONSTRAINT "TransactionItem_transactionId_fkey"
          FOREIGN KEY ("transactionId")
          REFERENCES "Transaction"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `)
  console.log('✅ Foreign key TransactionItem → Transaction OK')

  await (prisma as any).$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'TransactionItem_productId_fkey'
      ) THEN
        ALTER TABLE "TransactionItem"
          ADD CONSTRAINT "TransactionItem_productId_fkey"
          FOREIGN KEY ("productId")
          REFERENCES "Product"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;
  `)
  console.log('✅ Foreign key TransactionItem → Product OK')

  console.log('\n🎉 Tabel Transaction dan TransactionItem siap digunakan.')
}

main().catch(console.error).finally(() => (prisma as any).$disconnect())
