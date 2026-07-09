import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function nextNoPO(existing: { noPO: string }[]): string {
  const nums = existing.map(p => parseInt(p.noPO.split('-')[2] ?? '0', 10)).filter(n => !isNaN(n))
  const next = Math.max(0, ...nums) + 1
  return `PO-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q   = searchParams.get('q')   ?? ''
  const tab = searchParams.get('tab') ?? 'Semua'

  const orders = await prisma.purchaseOrder.findMany({
    where: {
      AND: [
        q ? { OR: [
          { noPO:     { contains: q, mode: 'insensitive' } },
          { supplier: { contains: q, mode: 'insensitive' } },
        ]} : {},
        tab !== 'Semua' ? { status: tab as never } : {},
      ],
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const all  = await prisma.purchaseOrder.findMany({ select: { noPO: true } })

  // Validasi: cek SKU yang diketik manual vs nama di katalog
  const bodyItems = body.items as { sku: string; productName: string }[]
  const skus = [...new Set(bodyItems.map(i => i.sku).filter(Boolean))]
  const existingProducts = await prisma.product.findMany({
    where: { sku: { in: skus } },
    select: { sku: true, name: true },
  })
  const conflicts = existingProducts
    .filter(p => {
      const incomingName = bodyItems.find(i => i.sku === p.sku)?.productName ?? ''
      return incomingName.trim().toLowerCase() !== p.name.trim().toLowerCase()
    })
    .map(p => ({
      sku:         p.sku,
      namaKatalog: p.name,
      namaPO:      bodyItems.find(i => i.sku === p.sku)?.productName ?? '',
    }))

  if (conflicts.length > 0) {
    return NextResponse.json(
      {
        message: 'Konflik nama produk ditemukan. Periksa SKU berikut sebelum menyimpan PO.',
        conflicts,
      },
      { status: 409 },
    )
  }

  const order = await prisma.purchaseOrder.create({
    data: {
      noPO:        nextNoPO(all),
      supplier:    body.supplier,
      tanggal:     new Date(body.tanggal),
      status:      'Draft',
      createdById: session.id,
      items: { create: body.items.map((i: { productName: string; sku: string; qty: number; hargaSatuan: number }) => ({
        productName: i.productName,
        sku:         i.sku,
        qty:         Number(i.qty),
        hargaSatuan: Number(i.hargaSatuan),
      }))},
    },
    include: { items: true },
  })

  // Notifikasi ke Manager setelah PO dibuat
  await prisma.notification.create({
    data: {
      targetRole: 'manager',
      title:      `Draft PO Baru: ${order.noPO}`,
      message:    `Admin membuat draft PO ke ${order.supplier}. Menunggu persetujuan Anda.`,
      type:       'info',
      link:       '/dashboard/purchase-order',
    },
  })

  return NextResponse.json(order, { status: 201 })
}
