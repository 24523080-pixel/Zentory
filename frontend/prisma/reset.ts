import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config({ path: '.env.local' })
config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  console.log('🗑️  Resetting database...')

  // Hapus semua data transaksi (urut dari child ke parent)
  await prisma.notification.deleteMany()
  console.log('✅ Notifications cleared')

  await prisma.penerimaanItem.deleteMany()
  await prisma.penerimaan.deleteMany()
  console.log('✅ Penerimaan cleared')

  await prisma.pOItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  console.log('✅ Purchase Orders cleared')

  await prisma.stockOpnameItem.deleteMany()
  await prisma.stockOpname.deleteMany()
  console.log('✅ Stock Opname cleared')

  await prisma.returnItem.deleteMany()
  await prisma.salesReturn.deleteMany()
  console.log('✅ Sales Returns cleared')

  // Reset stok semua produk ke 0 (seed akan isi ulang)
  await prisma.product.deleteMany()
  console.log('✅ Products cleared')

  console.log('🎉 Database reset complete! Run seed next.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
