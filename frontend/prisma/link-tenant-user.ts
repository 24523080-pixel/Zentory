/**
 * Tambah kolom userId ke SaasSubscription dan link 1 tenant ke manager.
 * Run: npx tsx prisma/link-tenant-user.ts
 */
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // 1. Tambah kolom userId jika belum ada
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SaasSubscription"
    ADD COLUMN IF NOT EXISTS "userId" TEXT REFERENCES "User"(id) ON DELETE SET NULL
  `)
  console.log('Kolom userId ditambahkan.')

  // 2. Ambil manager user
  const managers = await prisma.$queryRaw<{ id: string; name: string; email: string }[]>`
    SELECT id, name, email FROM "User" WHERE role = 'manager' LIMIT 1
  `
  if (!managers.length) {
    console.log('Tidak ada user manager di DB.')
    return
  }
  const manager = managers[0]
  console.log(`Manager ditemukan: ${manager.name} (${manager.email})`)

  // 3. Link tenant "Gudang Makmur Sejahtera" (tier Besar, pertama di list) ke manager
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE "SaasSubscription"
    SET "userId" = $1
    WHERE "tenantName" = 'Gudang Makmur Sejahtera'
  `, manager.id)
  console.log(`Tenant terhubung ke user manager (${updated} row updated).`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
