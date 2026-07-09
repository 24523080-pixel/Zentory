import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  const ri = await prisma.returnItem.deleteMany()
  console.log('✅ ReturnItem dihapus:', ri.count, 'baris')
  const sr = await prisma.salesReturn.deleteMany()
  console.log('✅ SalesReturn dihapus:', sr.count, 'baris')
}

main().catch(console.error).finally(() => (prisma as any).$disconnect())
