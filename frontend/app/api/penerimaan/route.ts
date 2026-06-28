import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireRole } from '@/lib/auth'

function nextNoPenerimaan(existing: { noPenerimaan: string }[]): string {
  const nums = existing.map(p => parseInt(p.noPenerimaan.split('-')[2] ?? '0', 10)).filter(n => !isNaN(n))
  const next = Math.max(0, ...nums) + 1
  return `PEN-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`
}

export async function GET() {
  const list = await prisma.penerimaan.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!requireRole(session, 'manager', 'admin')) {
    return NextResponse.json({ message: 'Hanya Manager atau Admin yang dapat mencatat penerimaan barang.' }, { status: 403 })
  }

  const body = await req.json()
  const all  = await prisma.penerimaan.findMany({ select: { noPenerimaan: true } })

  const items = body.items as { sku: string; productName: string; qtyPO: number; qtyDiterima: number }[]
  const hasSelisih   = items.some(i => i.qtyDiterima < i.qtyPO)
  const hasDiterima  = items.some(i => i.qtyDiterima > 0)
  const status = !hasDiterima ? 'Menunggu' : hasSelisih ? 'Ada Selisih' : 'Diterima'

  const penerimaan = await prisma.penerimaan.create({
    data: {
      noPenerimaan: nextNoPenerimaan(all),
      noPO:         body.noPO,
      supplier:     body.supplier,
      status,
      catatan:      body.catatan || null,
      items: { create: items.map(i => ({
        sku:         i.sku,
        productName: i.productName,
        qtyPO:       Number(i.qtyPO),
        qtyDiterima: Number(i.qtyDiterima),
      }))},
    },
    include: { items: true },
  })

  // Update stok produk yang diterima
  for (const item of items) {
    if (item.qtyDiterima > 0) {
      await prisma.product.updateMany({
        where: { sku: item.sku },
        data:  { stok: { increment: item.qtyDiterima } },
      })
    }
  }

  return NextResponse.json(penerimaan, { status: 201 })
}
