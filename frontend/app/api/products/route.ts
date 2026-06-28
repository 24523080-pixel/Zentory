import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q   = searchParams.get('q') ?? ''
  const tab = searchParams.get('tab') ?? 'Semua'

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q ? { OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku:  { contains: q, mode: 'insensitive' } },
        ]} : {},
        tab === 'Semua' ? {} :
        tab === 'Kritis' ? { stok: { lte: prisma.product.fields.rop } } :
        { klasifikasi: tab as never },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const product = await prisma.product.create({
    data: {
      sku:        body.sku,
      name:       body.name,
      kategori:   body.kategori,
      hargaBeli:  Number(body.hargaBeli ?? 0),
      hargaJual:  Number(body.hargaJual ?? 0),
      stok:       Number(body.stok ?? 0),
      rop:        Number(body.rop ?? 0),
      klasifikasi: 'InsufficientData',
    },
  })
  return NextResponse.json(product, { status: 201 })
}
