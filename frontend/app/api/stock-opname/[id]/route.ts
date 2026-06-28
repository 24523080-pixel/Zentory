import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireRole } from '@/lib/auth'
import { verifyTOTP } from '@/lib/totp'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id }     = await params
  const body       = await req.json()
  const { action } = body

  if (action === 'submit') {
    const counts = body.counts as Record<string, string | number>
    await Promise.all(
      Object.entries(counts).map(([itemId, raw]) => {
        const stokFisik = parseInt(String(raw), 10)
        if (isNaN(stokFisik)) return Promise.resolve()
        return prisma.stockOpnameItem.update({
          where: { id: itemId },
          data:  { stokFisik },
        })
      })
    )
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
    if (!requireRole(session, 'manager')) {
      return NextResponse.json({ message: 'Hanya Manager yang dapat menyetujui opname.' }, { status: 403 })
    }

    // NFR-002: Periksa selisih > 10% nilai inventaris → wajib OTP 2FA
    const opnameItems = await prisma.stockOpnameItem.findMany({
      where:   { opnameId: id, stokFisik: { not: null } },
      include: { product: { select: { hargaBeli: true } } },
    })
    const totalInventory  = opnameItems.reduce((s, i) => s + i.stokSistem * (i.product?.hargaBeli ?? 0), 0)
    const totalAdjustment = opnameItems.reduce((s, i) => s + Math.abs((i.stokFisik ?? 0) - i.stokSistem) * (i.product?.hargaBeli ?? 0), 0)
    const isLargeVariance = totalInventory > 0 && totalAdjustment / totalInventory > 0.10
    const variancePct     = isLargeVariance ? Math.round((totalAdjustment / totalInventory) * 100) : 0

    if (isLargeVariance) {
      const manager = await prisma.user.findUnique({
        where:  { id: session.id },
        select: { totpSecret: true },
      })

      if (!manager?.totpSecret) {
        // Manager belum setup Google Authenticator
        return NextResponse.json(
          { requiresOTPSetup: true, variancePct },
          { status: 409 }
        )
      }

      const otp = body.otp ? String(body.otp) : null
      if (!otp) {
        // Minta OTP dari Manager
        return NextResponse.json(
          { requiresOTP: true, variancePct },
          { status: 409 }
        )
      }

      // Verifikasi kode OTP
      const isValid = verifyTOTP(otp, manager.totpSecret)
      if (!isValid) {
        return NextResponse.json(
          { message: 'Kode OTP tidak valid atau sudah kedaluwarsa. Coba lagi.' },
          { status: 400 }
        )
      }
    }

    const opname = await prisma.stockOpname.update({
      where: { id },
      data:  { status: 'Disetujui', approvedById: session.id, approvedByName: session.name },
      include: { items: true },
    })
    for (const item of opname.items) {
      if (item.productId && item.stokFisik !== null) {
        await prisma.product.update({
          where: { id: item.productId },
          data:  { stok: item.stokFisik },
        })
      }
    }
    await prisma.notification.create({
      data: {
        targetRole: 'admin',
        title:      `Opname Disetujui: ${opname.noOpname}`,
        message:    `Manager ${session.name} menyetujui adjustment stok area ${opname.area}. Stok telah diperbarui.`,
        type:       'success',
        link:       '/dashboard/stock-opname',
      },
    })
    return NextResponse.json(opname)
  }

  if (action === 'reject') {
    if (!requireRole(session, 'manager')) {
      return NextResponse.json({ message: 'Hanya Manager yang dapat menolak opname.' }, { status: 403 })
    }
    const opname = await prisma.stockOpname.update({
      where: { id },
      data:  { status: 'Ditolak', approvedById: session.id, approvedByName: session.name },
      include: { items: true },
    })
    await prisma.notification.create({
      data: {
        targetRole: 'admin',
        title:      `Opname Ditolak: ${opname.noOpname}`,
        message:    `Manager ${session.name} menolak adjustment stok area ${opname.area}. Lakukan penghitungan ulang jika diperlukan.`,
        type:       'error',
        link:       '/dashboard/stock-opname',
      },
    })
    return NextResponse.json(opname)
  }

  return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 })
}
