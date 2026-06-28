import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id }   = await params
  const { status } = await req.json()

  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status,
      ...(status === 'Dikirim' ? { approvedById: session.id } : {}),
    },
    include: { items: true },
  })

  // FR-12: Notifikasi ke Admin saat Manager setujui PO
  if (status === 'Dikirim') {
    await prisma.notification.create({
      data: {
        targetRole: 'admin',
        title:      `PO Disetujui: ${po.noPO}`,
        message:    `Manager menyetujui dan mengirim PO ke ${po.supplier}. Siapkan penerimaan barang.`,
        type:       'success',
        link:       '/dashboard/penerimaan-barang',
      },
    })
  }

  return NextResponse.json(po)
}
