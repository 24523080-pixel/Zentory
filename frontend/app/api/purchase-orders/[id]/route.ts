import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const po = await prisma.purchaseOrder.findUnique({ where: { id } })
  if (!po || po.status !== 'Draft') {
    return NextResponse.json({ message: 'Hanya PO berstatus Draft yang dapat dihapus.' }, { status: 400 })
  }

  await prisma.purchaseOrder.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
