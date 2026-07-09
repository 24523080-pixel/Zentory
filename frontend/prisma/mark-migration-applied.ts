import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import { createHash, randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as never)

const MIGRATIONS = [
  '20240101000000_init',
  '20250710000001_add_transaction_tables',
]

function checksum(sql: string) {
  return createHash('sha256').update(sql).digest('hex')
}

async function main() {
  // Buat tabel _prisma_migrations jika belum ada
  await (prisma as any).$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                  VARCHAR(36)  NOT NULL PRIMARY KEY,
      "checksum"            VARCHAR(64)  NOT NULL,
      "finished_at"         TIMESTAMPTZ,
      "migration_name"      VARCHAR(255) NOT NULL,
      "logs"                TEXT,
      "rolled_back_at"      TIMESTAMPTZ,
      "started_at"          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      "applied_steps_count" INTEGER      NOT NULL DEFAULT 0
    )
  `)
  console.log('✅ Tabel _prisma_migrations siap')

  for (const name of MIGRATIONS) {
    const sqlPath = join(__dirname, 'migrations', name, 'migration.sql')
    const sql     = readFileSync(sqlPath, 'utf-8')
    const hash    = checksum(sql)

    const existing = await (prisma as any).$queryRawUnsafe<{ migration_name: string }[]>(
      `SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = $1`, name
    )

    if (existing.length > 0) {
      console.log(`  ⏭  "${name}" sudah ada, skip.`)
      continue
    }

    await (prisma as any).$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations"
        (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)
    `, randomUUID(), hash, name)

    console.log(`  ✅ "${name}" ditandai applied.`)
  }

  console.log('\n🎉 Prisma migration history berhasil diinisialisasi.')
}

main().catch(console.error).finally(() => (prisma as any).$disconnect())
