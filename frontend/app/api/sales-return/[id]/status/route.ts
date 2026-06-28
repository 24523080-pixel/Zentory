import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id }   = await params
  const { status, catatan } = await req.json()

  const ret = await prisma.salesReturn.update({
    where: { id },
    data: {
      status,
      ...(status === 'Menunggu Approval' ? { inspeksiOleh: session.name, catatanInspeksi: catatan } : {}),
      ...(status === 'Disetujui'         ? { disetujuiOleh: session.name } : {}),
      ...(status === 'Ditolak'           ? { disetujuiOleh: session.name } : {}),
    },
    include: { items: true },
  })

  // FR-13: Kembalikan stok saat return disetujui
  if (status === 'Disetujui') {
    for (const item of ret.items) {
      await prisma.product.updateMany({
        where: { sku: item.sku },
        data:  { stok: { increment: item.qty } },
      })
    }
    await prisma.notification.create({
      data: {
        targetRole: 'kasir',
        title:      `Return Disetujui: ${ret.noReturn}`,
        message:    `Manager menyetujui return ${ret.noReturn}. Stok produk sudah dikembalikan.`,
        type:       'success',
        link:       '/dashboard/sales-return',
      },
    })
  }

  return NextResponse.json(ret)
}
