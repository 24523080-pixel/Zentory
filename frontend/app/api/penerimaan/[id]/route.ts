import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireRole } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!requireRole(session, 'manager', 'admin')) {
    return NextResponse.json({ message: 'Hanya Manager atau Admin yang dapat mengubah penerimaan.' }, { status: 403 })
  }

  const { id } = await params
  const existing = await prisma.penerimaan.findUnique({ where: { id }, include: { items: true } })
  if (!existing) return NextResponse.json({ message: 'Penerimaan tidak ditemukan.' }, { status: 404 })
  if (existing.status !== 'Menunggu') {
    return NextResponse.json({ message: 'Hanya penerimaan berstatus Menunggu yang dapat diubah.' }, { status: 400 })
  }

  const body = await req.json()
  const items = body.items as { id: string; qtyDiterima: number }[]

  const hasSelisih  = existing.items.some(i => {
    const updated = items.find(u => u.id === i.id)
    return (updated?.qtyDiterima ?? i.qtyDiterima) < i.qtyPO
  })
  const hasDiterima = items.some(i => i.qtyDiterima > 0)
  const status = !hasDiterima ? 'Menunggu' : hasSelisih ? 'Ada Selisih' : 'Diterima'

  // Update setiap item dan increment stok untuk qty yang baru diterima
  for (const update of items) {
    const oldItem = existing.items.find(i => i.id === update.id)
    if (!oldItem) continue
    const tambahan = update.qtyDiterima - oldItem.qtyDiterima
    await prisma.penerimaanItem.update({
      where: { id: update.id },
      data:  { qtyDiterima: update.qtyDiterima },
    })
    if (tambahan > 0) {
      await prisma.product.updateMany({
        where: { sku: oldItem.sku },
        data:  { stok: { increment: tambahan } },
      })
    }
  }

  const updated = await prisma.penerimaan.update({
    where: { id },
    data:  { status, catatan: body.catatan ?? existing.catatan },
    include: { items: true },
  })

  return NextResponse.json(updated)
}
