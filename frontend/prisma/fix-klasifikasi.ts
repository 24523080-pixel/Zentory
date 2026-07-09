import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
config({ path: '.env.local' })
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as never)
async function main() {
  const window30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const products = await prisma.product.findMany()
  for (const p of products) {
    const agg  = await prisma.transactionItem.aggregate({ where: { productId: p.id, transaction: { tanggal: { gte: window30 } } }, _sum: { qty: true } })
    const sold = agg._sum.qty ?? 0
    const klas = sold >= 60 ? 'Fast' : sold > 0 ? 'Slow' : 'Dead'
    await prisma.product.update({ where: { id: p.id }, data: { klasifikasi: klas } })
    console.log(`  ${p.sku} ${p.name}: ${sold} unit → ${klas}`)
  }
}
main().catch(console.error).finally(() => (prisma as any).$disconnect())
