/**
 * Backfill: buat produk dari PenerimaanItem yang SKU-nya belum ada di Product.
 * Jalankan sekali saja setelah bug upsert diperbaiki.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  // Ambil semua PenerimaanItem
  const penItems = await prisma.penerimaanItem.findMany({
    include: { penerimaan: true },
  })

  for (const item of penItems) {
    const exists = await prisma.product.findUnique({ where: { sku: item.sku } })
    if (exists) {
      console.log(`✓ ${item.sku} sudah ada (stok: ${exists.stok}), skip`)
      continue
    }

    // Cari hargaSatuan dari PO yang berkaitan
    const po = await prisma.purchaseOrder.findFirst({
      where: { noPO: item.penerimaan.noPO },
      include: { items: true },
    })
    const hargaBeli = po?.items.find(i => i.sku === item.sku)?.hargaSatuan ?? 0

    // Buat produk baru dengan stok = total qtyDiterima dari semua penerimaan
    const totalDiterima = await prisma.penerimaanItem.aggregate({
      where: { sku: item.sku },
      _sum: { qtyDiterima: true },
    })
    const stok = totalDiterima._sum.qtyDiterima ?? item.qtyDiterima

    await prisma.product.create({
      data: {
        sku:      item.sku,
        name:     item.productName,
        kategori: 'Lainnya',
        hargaBeli,
        hargaJual: 0,
        stok,
        rop: 0,
      },
    })
    console.log(`+ Dibuat: ${item.sku} | ${item.productName} | stok: ${stok} | hargaBeli: ${hargaBeli}`)
  }

  console.log('\n✅ Backfill selesai')
}

main().catch(console.error).finally(() => (prisma as any).$disconnect())
