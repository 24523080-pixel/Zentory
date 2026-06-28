import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id }   = await params
  const body     = await req.json()
  const { action } = body

  if (action === 'submit') {
    // Admin submit hitungan fisik → Menunggu Approval
    const counts = body.counts as Record<string, number>
    await Promise.all(
      Object.entries(counts).map(([itemId, stokFisik]) =>
        prisma.stockOpnameItem.update({
          where: { id: itemId },
          data:  { stokFisik, selisih: undefined },
        })
      )
    )
    // Update selisih setelah semua input
    const items = await prisma.stockOpnameItem.findMany({ where: { opnameId: id } })
    await Promise.all(items.map(item =>
      item.stokFisik !== null
        ? prisma.stockOpnameItem.update({
            where: { id: item.id },
            data:  { selisih: item.stokFisik - item.stokSistem },
          })
        : Promise.resolve()
    ))
    const opname = await prisma.stockOpname.update({
      where: { id },
      data:  { status: 'Menunggu Approval', tanggalSelesai: new Date() },
      include: { items: true },
    })
    await prisma.notification.create({
      data: {
        targetRole: 'manager',
        title:      `Stock Opname Selesai: ${opname.noOpname}`,
        message:    `Admin menyelesaikan penghitungan fisik area ${opname.area}. Menunggu persetujuan Anda.`,
        type:       'info',
        link:       '/dashboard/stock-opname',
      },
    })
    return NextResponse.json(opname)
  }

  if (action === 'approve') {
    const opname = await prisma.stockOpname.update({
      where: { id },
      data:  { status: 'Disetujui', approvedById: session.id, approvedByName: session.name },
      include: { items: true },
    })
    // FR-09: Update stok produk sesuai stok fisik
    for (const item of opname.items) {
      if (item.productId && item.stokFisik !== null) {
        await prisma.product.update({
          where: { id: item.productId },
          data:  { stok: item.stokFisik },
        })
      }
    }
    return NextResponse.json(opname)
  }

  if (action === 'reject') {
    const opname = await prisma.stockOpname.update({
      where: { id },
      data:  { status: 'Ditolak', approvedById: session.id, approvedByName: session.name },
      include: { items: true },
    })
    return NextResponse.json(opname)
  }

  return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 })
}
