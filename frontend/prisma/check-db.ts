import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  const bhl = await prisma.product.findUnique({ where: { sku: 'BHL-001' } })
  console.log('BHL-001 di products:', bhl ? `stok=${bhl.stok}, name=${bhl.name}` : 'TIDAK ADA')

  const allProducts = await prisma.product.findMany({ select: { sku: true, name: true, stok: true } })
  console.log('\nSemua produk:')
  allProducts.forEach(p => console.log(`  ${p.sku} | ${p.name} | stok: ${p.stok}`))

  const pen = await prisma.penerimaan.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 5 })
  console.log('\nPenerimaan terbaru:')
  pen.forEach(p => {
    console.log(`  ${p.noPenerimaan} | PO: ${p.noPO} | status: ${p.status}`)
    p.items.forEach(i => console.log(`    - ${i.sku} | ${i.productName} | qtyPO=${i.qtyPO} | qtyDiterima=${i.qtyDiterima}`))
  })
}

main().catch(console.error).finally(() => (prisma as any).$disconnect())
