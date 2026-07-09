import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireRole } from '@/lib/auth'

function nextNoPenerimaan(existing: { noPenerimaan: string }[]): string {
  const nums = existing.map(p => parseInt(p.noPenerimaan.split('-')[2] ?? '0', 10)).filter(n => !isNaN(n))
  const next = Math.max(0, ...nums) + 1
  return `PEN-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`
}

export async function GET() {
  const list = await prisma.penerimaan.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!requireRole(session, 'manager', 'admin')) {
    return NextResponse.json({ message: 'Hanya Manager atau Admin yang dapat mencatat penerimaan barang.' }, { status: 403 })
  }

  const body = await req.json()
  const all  = await prisma.penerimaan.findMany({ select: { noPenerimaan: true } })

  // Cegah penerimaan duplikat untuk PO yang sama
  const duplicate = await prisma.penerimaan.findFirst({ where: { noPO: body.noPO } })
  if (duplicate) {
    return NextResponse.json(
      { message: `PO ${body.noPO} sudah pernah dicatat penerimaannya (${duplicate.noPenerimaan}). Satu PO hanya boleh satu kali penerimaan.` },
      { status: 400 },
    )
  }

  const items = body.items as { sku: string; productName: string; qtyPO: number; qtyDiterima: number }[]

  // Validasi: cek apakah ada SKU yang sudah terdaftar dengan nama produk berbeda
  const skus = [...new Set(items.map(i => i.sku))]
  const existingProducts = await prisma.product.findMany({
    where: { sku: { in: skus } },
    select: { sku: true, name: true },
  })
  const conflicts = existingProducts
    .filter(p => {
      const incomingName = items.find(i => i.sku === p.sku)?.productName ?? ''
      return incomingName.trim().toLowerCase() !== p.name.trim().toLowerCase()
    })
    .map(p => ({
      sku:          p.sku,
      namaKatalog:  p.name,
      namaPO:       items.find(i => i.sku === p.sku)?.productName ?? '',
    }))

  if (conflicts.length > 0) {
    return NextResponse.json(
      {
        message: 'Konflik nama produk ditemukan. Periksa SKU berikut sebelum menyimpan.',
        conflicts,
      },
      { status: 409 },
    )
  }

  const hasSelisih   = items.some(i => i.qtyDiterima < i.qtyPO)
  const hasDiterima  = items.some(i => i.qtyDiterima > 0)
  const status = !hasDiterima ? 'Menunggu' : hasSelisih ? 'Ada Selisih' : 'Diterima'

  const penerimaan = await prisma.penerimaan.create({
    data: {
      noPenerimaan: nextNoPenerimaan(all),
      noPO:         body.noPO,
      supplier:     body.supplier,
      status,
      catatan:      body.catatan || null,
      items: { create: items.map(i => ({
        sku:         i.sku,
        productName: i.productName,
        qtyPO:       Number(i.qtyPO),
        qtyDiterima: Number(i.qtyDiterima),
      }))},
    },
    include: { items: true },
  })

  // Ambil hargaSatuan per SKU dari PO untuk produk baru
  const poRecord = await prisma.purchaseOrder.findFirst({
    where: { noPO: body.noPO },
    include: { items: true },
  })
  const poItemMap = new Map(poRecord?.items.map(i => [i.sku, i.hargaSatuan]) ?? [])

  // Upsert produk: jika sudah ada → increment stok; jika belum → buat produk baru
  for (const item of items) {
    if (item.qtyDiterima > 0) {
      const hargaBeli = poItemMap.get(item.sku) ?? 0
      await prisma.product.upsert({
        where:  { sku: item.sku },
        update: { stok: { increment: item.qtyDiterima } },
        create: {
          sku:        item.sku,
          name:       item.productName,
          kategori:   'Lainnya',
          hargaBeli,
          hargaJual:  0,
          stok:       item.qtyDiterima,
          rop:        0,
        },
      })
    }
  }

  return NextResponse.json(penerimaan, { status: 201 })
}
