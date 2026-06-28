import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body  = await req.json()
  const items: { productId: string; qty: number }[] = body.items
  if (!items?.length) return NextResponse.json({ message: 'Items kosong' }, { status: 400 })

  const reorderTriggered: string[] = []

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) continue
    if (product.stok < item.qty) {
      return NextResponse.json({ message: `Stok ${product.name} tidak cukup (tersisa ${product.stok})` }, { status: 400 })
    }

    // FR-06: Blokir transaksi jika produk sedang dalam cycle counting
    const frozenOpname = await prisma.stockOpnameItem.findFirst({
      where: { productId: item.productId, opname: { status: 'Aktif' } },
      include: { opname: { select: { area: true } } },
    })
    if (frozenOpname) {
      return NextResponse.json(
        { message: `${product.name} sedang dalam cycle counting (area: ${frozenOpname.opname?.area ?? '-'}). Transaksi diblokir sementara.` },
        { status: 400 }
      )
    }

    const newStok = product.stok - item.qty
    await prisma.product.update({ where: { id: item.productId }, data: { stok: newStok } })

    // FR-01: Auto-create draft PO saat stok mencapai/melewati ROP
    if (newStok <= product.rop) {
      reorderTriggered.push(product.name)

      const existingDraft = await prisma.pOItem.findFirst({
        where: { sku: product.sku, po: { status: 'Draft' } },
      })
      if (!existingDraft) {
        const all    = await prisma.purchaseOrder.findMany({ select: { noPO: true } })
        const nums   = all.map(p => parseInt(p.noPO.split('-')[2] ?? '0', 10)).filter(n => !isNaN(n))
        const noPO   = `PO-${new Date().getFullYear()}-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`

        await prisma.purchaseOrder.create({
          data: {
            noPO,
            supplier:    'Perlu Ditentukan',
            tanggal:     new Date(),
            status:      'Draft',
            createdById: session.id,
            items: { create: [{ productName: product.name, sku: product.sku, qty: product.rop * 2, hargaSatuan: product.hargaBeli }] },
          },
        })

        await prisma.notification.create({
          data: {
            targetRole: 'manager',
            title:      `Auto Draft PO: ${product.name}`,
            message:    `Stok ${product.name} mencapai ROP (sisa ${newStok}, ROP ${product.rop}). Draft PO ${noPO} dibuat otomatis.`,
            type:       'warning',
            link:       '/dashboard/purchase-order',
          },
        })
      }
    }
  }

  return NextResponse.json({ success: true, reorderTriggered })
}
