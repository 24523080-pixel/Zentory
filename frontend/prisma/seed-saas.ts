/**
 * Seed demo SaasSubscription + buat tabel jika belum ada.
 * Run: npx ts-node --project tsconfig.json prisma/seed-saas.ts
 */
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

const TIER_MRR: Record<string, number> = {
  Gratis: 0,
  Kecil: 99_000,
  Sedang: 249_000,
  Besar: 499_000,
}

async function main() {
  // Buat tabel jika belum ada
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SaasSubscription" (
      id          TEXT PRIMARY KEY,
      "tenantName" TEXT NOT NULL,
      email       TEXT NOT NULL,
      tier        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'Active',
      "startDate"  TIMESTAMP NOT NULL DEFAULT NOW(),
      mrr         INTEGER NOT NULL DEFAULT 0,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `)
  console.log('Table SaasSubscription ready.')

  // Hapus data lama agar idempotent
  await prisma.$executeRawUnsafe(`DELETE FROM "SaasSubscription"`)

  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)

  const tenants = [
    { name: 'Gudang Makmur Sejahtera', email: 'admin@makmursejahtera.id', tier: 'Besar',  status: 'Active',   start: daysAgo(180) },
    { name: 'UD Sumber Rezeki',        email: 'ops@sumberrezeki.co.id',   tier: 'Sedang', status: 'Active',   start: daysAgo(165) },
    { name: 'PT Karya Nusantara',      email: 'it@karyanusantara.com',    tier: 'Besar',  status: 'Active',   start: daysAgo(150) },
    { name: 'Toko Bahan Bangunan Jaya',email: 'jaya@banjaya.id',          tier: 'Sedang', status: 'Active',   start: daysAgo(130) },
    { name: 'CV Mitra Logistik',       email: 'contact@mtrlogistik.id',   tier: 'Kecil',  status: 'Active',   start: daysAgo(120) },
    { name: 'Apotek Sehat Bersama',    email: 'admin@sehatbersama.id',    tier: 'Sedang', status: 'Active',   start: daysAgo(100) },
    { name: 'Warung Grosir Pak Hadi',  email: 'hadi@grosirhadi.com',      tier: 'Kecil',  status: 'Active',   start: daysAgo(90)  },
    { name: 'Distributor Elektronik NS',email:'ns@elektronikns.id',       tier: 'Sedang', status: 'Active',   start: daysAgo(75)  },
    { name: 'Toko Sembako Bu Ratna',   email: 'ratna@sembako.id',         tier: 'Kecil',  status: 'Active',   start: daysAgo(60)  },
    { name: 'CV Agro Mandiri',         email: 'admin@agromandiri.co.id',  tier: 'Sedang', status: 'Active',   start: daysAgo(45)  },
    { name: 'Rental Alat Berat Surya', email: 'surya@rentalsurya.id',     tier: 'Kecil',  status: 'Inactive', start: daysAgo(40)  },
    { name: 'Toko Buku Pintar',        email: 'info@bukupintar.id',       tier: 'Gratis', status: 'Trial',    start: daysAgo(12)  },
    { name: 'Bengkel Motor Pak Dedi',  email: 'dedi@bengkeldedi.com',     tier: 'Gratis', status: 'Trial',    start: daysAgo(7)   },
    { name: 'Koperasi Usaha Bersatu',  email: 'kub@koperasibersatu.id',   tier: 'Kecil',  status: 'Active',   start: daysAgo(20)  },
    { name: 'UD Frozen Food Lestari',  email: 'frozen@lestari.id',        tier: 'Sedang', status: 'Active',   start: daysAgo(15)  },
  ]

  for (const t of tenants) {
    const id = `saas_${Math.random().toString(36).slice(2, 10)}`
    const mrr = TIER_MRR[t.tier]
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SaasSubscription" (id, "tenantName", email, tier, status, "startDate", mrr, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $6)`,
      id, t.name, t.email, t.tier, t.status, t.start, mrr
    )
    console.log(`  + ${t.name} [${t.tier}]`)
  }

  console.log(`\nSeeded ${tenants.length} tenants.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
