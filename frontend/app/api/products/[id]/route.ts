import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const product = await prisma.product.update({
    where: { id },
    data: {
      sku:       body.sku,
      name:      body.name,
      kategori:  body.kategori,
      hargaBeli: Number(body.hargaBeli ?? 0),
      hargaJual: Number(body.hargaJual ?? 0),
      stok:      Number(body.stok ?? 0),
      rop:       Number(body.rop ?? 0),
    },
  })
  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
