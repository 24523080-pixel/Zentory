import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [products, pendingPOs] = await Promise.all([
    prisma.product.findMany({ select: { name: true, sku: true, stok: true, rop: true }, orderBy: { stok: 'asc' } }),
    prisma.purchaseOrder.count({ where: { status: { in: ['Draft', 'Dikirim'] } } }),
  ])

  const belowROP      = products.filter(p => p.stok <= p.rop)
  const criticalStock = belowROP.slice(0, 6).map(p => ({
    name:   p.name,
    sku:    p.sku,
    stok:   p.stok,
    rop:    p.rop,
    status: p.stok === 0 ? 'Habis' : p.stok <= Math.floor(p.rop * 0.5) ? 'Kritis' : 'Reorder',
    tone:   p.stok === 0 || p.stok <= Math.floor(p.rop * 0.5) ? 'crit' : 'warn',
  }))

  return NextResponse.json({
    totalProducts:  products.length,
    belowROPCount:  belowROP.length,
    stockoutCount:  products.filter(p => p.stok === 0).length,
    pendingPOs,
    criticalStock,
  })
}
