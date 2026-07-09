import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireRole } from '@/lib/auth'

// Threshold (30 hari):
//   Fast Moving   : total terjual >= 30 unit  (rata-rata >= 1 unit/hari)
//   Slow Moving   : total terjual 1-29 unit
//   Dead Stock    : 0 unit terjual  (produk > 14 hari)
//   InsufficientData : produk ≤ 14 hari / belum ada data transaksi sama sekali

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!requireRole(session, 'manager')) {
    return NextResponse.json({ message: 'Hanya Manager yang dapat menjalankan reklasifikasi.' }, { status: 403 })
  }

  const now          = new Date()
  const window30     = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const products     = await prisma.product.findMany()

  const results: {
    sku: string; name: string
    totalSold30: number; avgDaily: number
    oldKlasifikasi: string; newKlasifikasi: string
    changed: boolean
  }[] = []

  for (const product of products) {
    const agg = await prisma.transactionItem.aggregate({
      where: {
        productId:   product.id,
        transaction: { tanggal: { gte: window30 } },
      },
      _sum: { qty: true },
    })

    const totalSold30 = agg._sum.qty ?? 0
    const avgDaily    = totalSold30 / 30
    const ageMs       = now.getTime() - product.createdAt.getTime()
    const ageDays     = ageMs / (1000 * 60 * 60 * 24)

    let newKlasifikasi: 'Fast' | 'Slow' | 'Dead' | 'InsufficientData'

    if (ageDays <= 14 && totalSold30 === 0) {
      newKlasifikasi = 'InsufficientData'
    } else if (totalSold30 === 0) {
      newKlasifikasi = 'Dead'
    } else if (totalSold30 >= 30) {
      newKlasifikasi = 'Fast'
    } else {
      newKlasifikasi = 'Slow'
    }

    const changed = product.klasifikasi !== newKlasifikasi
    if (changed) {
      await prisma.product.update({
        where: { id: product.id },
        data:  { klasifikasi: newKlasifikasi },
      })
    }

    results.push({
      sku:            product.sku,
      name:           product.name,
      totalSold30,
      avgDaily:       Math.round(avgDaily * 100) / 100,
      oldKlasifikasi: product.klasifikasi,
      newKlasifikasi,
      changed,
    })
  }

  const changedCount = results.filter(r => r.changed).length

  return NextResponse.json({
    total:   results.length,
    changed: changedCount,
    results,
    window:  '30 hari terakhir',
  })
}
