import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function nextNoReturn(existing: { noReturn: string }[]): string {
  const nums = existing.map(r => parseInt(r.noReturn.split('-')[2] ?? '0', 10)).filter(n => !isNaN(n))
  const next = Math.max(0, ...nums) + 1
  return `RTN-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`
}

export async function GET() {
  const returns = await prisma.salesReturn.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(returns)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const all  = await prisma.salesReturn.findMany({ select: { noReturn: true } })

  const ret = await prisma.salesReturn.create({
    data: {
      noReturn:    nextNoReturn(all),
      noTransaksi: body.noTransaksi,
      kasirId:     session.id,
      kasirName:   session.name,
      status:      'Menunggu Inspeksi',
      items: { create: body.items.map((i: { productName: string; sku: string; harga: number; qty: number; alasan: string; catatan?: string }) => ({
        productName: i.productName,
        sku:         i.sku,
        harga:       Number(i.harga),
        qty:         Number(i.qty),
        alasan:      i.alasan,
        catatan:     i.catatan || null,
      }))},
    },
    include: { items: true },
  })

  await prisma.notification.create({
    data: {
      targetRole: 'admin',
      title:      `Return Baru: ${ret.noReturn}`,
      message:    `Kasir ${session.name} mengajukan return dari transaksi ${ret.noTransaksi}. Lakukan inspeksi fisik.`,
      type:       'warning',
      link:       '/dashboard/sales-return',
    },
  })

  return NextResponse.json(ret, { status: 201 })
}
