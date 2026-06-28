import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function nextNoOpname(existing: { noOpname: string }[]): string {
  const nums = existing.map(p => parseInt(p.noOpname.split('-')[2] ?? '0', 10)).filter(n => !isNaN(n))
  const next = Math.max(0, ...nums) + 1
  return `OPN-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`
}

export async function GET() {
  const sessions = await prisma.stockOpname.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body    = await req.json()
  const all     = await prisma.stockOpname.findMany({ select: { noOpname: true } })
  const products = await prisma.product.findMany({
    where: body.kategoriList
      ? { kategori: { in: body.kategoriList } }
      : {},
  })

  const opname = await prisma.stockOpname.create({
    data: {
      noOpname:    nextNoOpname(all),
      area:        body.area,
      status:      'Aktif',
      createdById: session.id,
      items: { create: products.map(p => ({
        productId:   p.id,
        sku:         p.sku,
        productName: p.name,
        stokSistem:  p.stok,
        stokFisik:   null,
        selisih:     null,
      }))},
    },
    include: { items: true },
  })
  return NextResponse.json(opname, { status: 201 })
}
