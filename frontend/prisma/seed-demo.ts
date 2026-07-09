/**
 * DEMO SEED — simulasi pemakaian nyata selama ~45 hari
 * Jalankan: npx tsx prisma/seed-demo.ts
 *
 * Yang di-reset: semua kecuali User
 * Yang dibuat:
 *   - 12 produk (stok realistis)
 *   - 5 Purchase Order (Diterima / Dikirim / Draft)
 *   - 3 Penerimaan Barang
 *   - ~180 Transaksi POS (45 hari, 2–5 per hari)
 *   - 2 Stock Opname (Disetujui + Menunggu Approval)
 *   - 4 Sales Return (semua status)
 *   - 5 Notifikasi
 *   - Reklasifikasi otomatis dari histori 30 hari
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as never)

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number, hour = 10): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
  return d
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── 0. Fetch users ──────────────────────────────────────────────────────

  const users   = await prisma.user.findMany()
  const manager = users.find(u => u.role === 'manager')
  const admin   = users.find(u => u.role === 'admin')
  const kasir   = users.find(u => u.role === 'kasir')

  if (!manager || !admin || !kasir) {
    throw new Error('User belum ada. Jalankan: npx ts-node -P tsconfig.seed.json prisma/seed.ts')
  }

  // ── 1. Bersihkan semua (kecuali User) ───────────────────────────────────

  console.log('🧹 Membersihkan data lama...')
  await prisma.transactionItem.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.returnItem.deleteMany()
  await prisma.salesReturn.deleteMany()
  await prisma.stockOpnameItem.deleteMany()
  await prisma.stockOpname.deleteMany()
  await prisma.penerimaanItem.deleteMany()
  await prisma.penerimaan.deleteMany()
  await prisma.pOItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.product.deleteMany()
  console.log('✅ Bersih')

  // ── 2. Produk ────────────────────────────────────────────────────────────

  console.log('📦 Membuat produk...')
  const productDefs = [
    { sku: 'KPI-001', name: 'Kopi Arabica',          kategori: 'Minuman',    hargaBeli: 45000, hargaJual: 65000,  stok: 82,  rop: 20 },
    { sku: 'THJ-002', name: 'Teh Hijau Organik',      kategori: 'Minuman',    hargaBeli: 30000, hargaJual: 45000,  stok: 105, rop: 40 },
    { sku: 'GLA-003', name: 'Gula Aren Premium',      kategori: 'Bumbu',      hargaBeli: 25000, hargaJual: 35000,  stok: 38,  rop: 30 },
    { sku: 'BRS-004', name: 'Beras Organik 5kg',      kategori: 'Sembako',    hargaBeli: 95000, hargaJual: 125000, stok: 58,  rop: 20 },
    { sku: 'MNY-005', name: 'Minyak Kelapa Virgin',   kategori: 'Sembako',    hargaBeli: 55000, hargaJual: 75000,  stok: 27,  rop: 15 },
    { sku: 'SNK-006', name: 'Keripik Singkong',       kategori: 'Snack',      hargaBeli: 15000, hargaJual: 22000,  stok: 175, rop: 60 },
    { sku: 'CKL-007', name: 'Cokelat 70% Kakao',     kategori: 'Snack',      hargaBeli: 35000, hargaJual: 50000,  stok: 68,  rop: 25 },
    { sku: 'JMU-008', name: 'Jamu Jahe Merah',        kategori: 'Minuman',    hargaBeli: 20000, hargaJual: 30000,  stok: 72,  rop: 30 },
    { sku: 'KLT-009', name: 'Kulit Manis Ceylon',     kategori: 'Bumbu',      hargaBeli: 40000, hargaJual: 58000,  stok: 14,  rop: 20 },
    { sku: 'MDS-010', name: 'Madu Sumbawa 500ml',     kategori: 'Minuman',    hargaBeli: 80000, hargaJual: 115000, stok: 31,  rop: 15 },
    { sku: 'SAB-011', name: 'Sabun Lidah Buaya',      kategori: 'Kecantikan', hargaBeli: 22000, hargaJual: 35000,  stok: 44,  rop: 25 },
    { sku: 'VMN-012', name: 'Vitamin C 1000mg',       kategori: 'Kesehatan',  hargaBeli: 50000, hargaJual: 75000,  stok: 22,  rop: 20 },
  ]

  const products = await Promise.all(
    productDefs.map(p => prisma.product.create({ data: { ...p, klasifikasi: 'InsufficientData' } }))
  )
  const pm: Record<string, typeof products[0]> = {}
  for (const p of products) pm[p.sku] = p
  console.log(`✅ ${products.length} produk`)

  // ── 3. Purchase Orders ───────────────────────────────────────────────────

  console.log('🛒 Membuat Purchase Orders...')

  const po1 = await prisma.purchaseOrder.create({ data: {
    noPO: 'PO-2026-001', supplier: 'CV Nusantara Jaya',
    tanggal: daysAgo(44, 9), status: 'Diterima',
    createdById: admin.id, approvedById: manager.id,
    items: { create: [
      { productName: 'Kopi Arabica',      sku: 'KPI-001', qty: 100, hargaSatuan: 45000 },
      { productName: 'Teh Hijau Organik', sku: 'THJ-002', qty: 150, hargaSatuan: 30000 },
      { productName: 'Jamu Jahe Merah',   sku: 'JMU-008', qty: 80,  hargaSatuan: 20000 },
    ]},
  }})

  const po2 = await prisma.purchaseOrder.create({ data: {
    noPO: 'PO-2026-002', supplier: 'PT Surya Snack',
    tanggal: daysAgo(29, 10), status: 'Diterima',
    createdById: admin.id, approvedById: manager.id,
    items: { create: [
      { productName: 'Keripik Singkong',  sku: 'SNK-006', qty: 200, hargaSatuan: 15000 },
      { productName: 'Cokelat 70% Kakao', sku: 'CKL-007', qty: 100, hargaSatuan: 35000 },
    ]},
  }})

  const po3 = await prisma.purchaseOrder.create({ data: {
    noPO: 'PO-2026-003', supplier: 'CV Nusantara Jaya',
    tanggal: daysAgo(14, 9), status: 'Diterima',
    createdById: admin.id, approvedById: manager.id,
    items: { create: [
      { productName: 'Beras Organik 5kg',   sku: 'BRS-004', qty: 80, hargaSatuan: 95000 },
      { productName: 'Vitamin C 1000mg',    sku: 'VMN-012', qty: 60, hargaSatuan: 50000 },
      { productName: 'Madu Sumbawa 500ml',  sku: 'MDS-010', qty: 40, hargaSatuan: 80000 },
    ]},
  }})

  await prisma.purchaseOrder.create({ data: {
    noPO: 'PO-2026-004', supplier: 'PT Herbal Indo',
    tanggal: daysAgo(4, 11), status: 'Dikirim',
    createdById: admin.id,
    items: { create: [
      { productName: 'Gula Aren Premium',    sku: 'GLA-003', qty: 60,  hargaSatuan: 25000 },
      { productName: 'Minyak Kelapa Virgin', sku: 'MNY-005', qty: 50,  hargaSatuan: 55000 },
      { productName: 'Kulit Manis Ceylon',   sku: 'KLT-009', qty: 30,  hargaSatuan: 40000 },
    ]},
  }})

  await prisma.purchaseOrder.create({ data: {
    noPO: 'PO-2026-005', supplier: 'Perlu Ditentukan',
    tanggal: daysAgo(1, 14), status: 'Draft',
    createdById: admin.id,
    items: { create: [
      { productName: 'Vitamin C 1000mg', sku: 'VMN-012', qty: 40, hargaSatuan: 50000 },
    ]},
  }})

  console.log('✅ 5 PO (Diterima×3, Dikirim×1, Draft×1)')

  // ── 4. Penerimaan ────────────────────────────────────────────────────────

  console.log('📥 Membuat Penerimaan...')

  await prisma.penerimaan.create({ data: {
    noPenerimaan: 'PEN-2026-001', noPO: 'PO-2026-001',
    poId: po1.id, supplier: 'CV Nusantara Jaya',
    tanggal: daysAgo(42, 10), status: 'Diterima',
    items: { create: [
      { sku: 'KPI-001', productName: 'Kopi Arabica',      qtyPO: 100, qtyDiterima: 100 },
      { sku: 'THJ-002', productName: 'Teh Hijau Organik', qtyPO: 150, qtyDiterima: 150 },
      { sku: 'JMU-008', productName: 'Jamu Jahe Merah',   qtyPO: 80,  qtyDiterima: 80  },
    ]},
  }})

  await prisma.penerimaan.create({ data: {
    noPenerimaan: 'PEN-2026-002', noPO: 'PO-2026-002',
    poId: po2.id, supplier: 'PT Surya Snack',
    tanggal: daysAgo(27, 11), status: 'Diterima',
    items: { create: [
      { sku: 'SNK-006', productName: 'Keripik Singkong',  qtyPO: 200, qtyDiterima: 200 },
      { sku: 'CKL-007', productName: 'Cokelat 70% Kakao', qtyPO: 100, qtyDiterima: 95  },
    ]},
  }})

  await prisma.penerimaan.create({ data: {
    noPenerimaan: 'PEN-2026-003', noPO: 'PO-2026-003',
    poId: po3.id, supplier: 'CV Nusantara Jaya',
    tanggal: daysAgo(12, 9), status: 'Sebagian',
    catatan: 'Madu hanya 38 dari 40 yang dikirim, sisanya dalam pengiriman berikutnya.',
    items: { create: [
      { sku: 'BRS-004', productName: 'Beras Organik 5kg',  qtyPO: 80, qtyDiterima: 80 },
      { sku: 'VMN-012', productName: 'Vitamin C 1000mg',   qtyPO: 60, qtyDiterima: 60 },
      { sku: 'MDS-010', productName: 'Madu Sumbawa 500ml', qtyPO: 40, qtyDiterima: 38 },
    ]},
  }})

  console.log('✅ 3 Penerimaan')

  // ── 5. Transaksi POS (45 hari) ───────────────────────────────────────────

  console.log('💰 Membuat ~180 transaksi penjualan (45 hari)...')

  // Frekuensi kemunculan produk per transaksi (prob = peluang muncul tiap transaksi)
  // Target dalam 30 hari: Fast ≥ 30 unit, Slow 5–25 unit, Dead = 0 unit
  const velocity: Record<string, { min: number; max: number; prob: number; deadOnly?: true }> = {
    'KPI-001': { min: 2, max: 4,  prob: 0.85 },          // Fast ~110 unit/30 hari
    'THJ-002': { min: 2, max: 3,  prob: 0.80 },          // Fast ~90 unit
    'GLA-003': { min: 1, max: 2,  prob: 0.28 },          // Slow ~17 unit
    'BRS-004': { min: 1, max: 3,  prob: 0.65 },          // Fast ~75 unit
    'MNY-005': { min: 1, max: 1,  prob: 0.22 },          // Slow ~8 unit
    'SNK-006': { min: 3, max: 6,  prob: 0.88 },          // Fast ~175 unit
    'CKL-007': { min: 2, max: 4,  prob: 0.82 },          // Fast ~115 unit
    'JMU-008': { min: 1, max: 2,  prob: 0.30 },          // Slow ~18 unit
    'KLT-009': { min: 1, max: 2,  prob: 0.20, deadOnly: true }, // Dead: hanya di hari 31-44
    'MDS-010': { min: 1, max: 1,  prob: 0.20 },          // Slow ~7 unit
    'SAB-011': { min: 1, max: 2,  prob: 0.40 },          // Slow ~24 unit
    'VMN-012': { min: 1, max: 3,  prob: 0.70 },          // Fast ~80 unit
  }

  let trxNo = 1
  const hours = [9, 10, 11, 13, 14, 15, 16, 17, 18, 19]

  for (let dBack = 44; dBack >= 0; dBack--) {
    const isInLast30 = dBack < 30
    const txnCount   = rand(2, 5)

    for (let t = 0; t < txnCount; t++) {
      const txDate = new Date()
      txDate.setDate(txDate.getDate() - dBack)
      txDate.setHours(hours[rand(0, hours.length - 1)], rand(5, 55), 0, 0)

      const txItems: {
        productId: string; sku: string; productName: string
        qty: number; hargaSatuan: number
      }[] = []

      for (const [sku, cfg] of Object.entries(velocity)) {
        // KLT-009 (Dead Stock): hanya muncul di hari 31-44 (luar window 30 hari)
        if (cfg.deadOnly && isInLast30) continue
        if (Math.random() > cfg.prob) continue

        const p = pm[sku]
        if (!p) continue
        txItems.push({
          productId:   p.id,
          sku:         p.sku,
          productName: p.name,
          qty:         rand(cfg.min, cfg.max),
          hargaSatuan: p.hargaJual,
        })
      }

      if (txItems.length === 0) continue

      await prisma.transaction.create({
        data: {
          noTransaksi: `TRX-2026-${String(trxNo).padStart(4, '0')}`,
          tanggal:     txDate,
          kasirId:     kasir.id,
          items:       { create: txItems },
        },
      })
      trxNo++
    }

    if (dBack % 10 === 0) process.stdout.write(`   hari -${dBack}... \n`)
  }

  console.log(`✅ ${trxNo - 1} transaksi POS`)

  // ── 6. Stock Opname ──────────────────────────────────────────────────────

  console.log('📋 Membuat Stock Opname...')

  // Opname 1: Disetujui (21 hari lalu) — Semua Area, selisih kecil
  await prisma.stockOpname.create({ data: {
    noOpname: 'OPN-2026-001', area: 'Semua Area',
    tanggalMulai: daysAgo(22, 8), tanggalSelesai: daysAgo(21, 16),
    status: 'Disetujui',
    createdById: admin.id, approvedById: manager.id, approvedByName: manager.name,
    items: { create: products.map(p => {
      const variansi = rand(-3, 1)  // sedikit kurang (susut wajar)
      return {
        productId:   p.id, sku: p.sku, productName: p.name,
        stokSistem:  p.stok - variansi,
        stokFisik:   p.stok,
        selisih:     variansi,
      }
    })},
  }})

  // Opname 2: Menunggu Approval (2 hari lalu) — Area Minuman saja
  const minuman = products.filter(p => p.kategori === 'Minuman')
  await prisma.stockOpname.create({ data: {
    noOpname: 'OPN-2026-002', area: 'Area Minuman',
    tanggalMulai: daysAgo(3, 9), tanggalSelesai: daysAgo(2, 15),
    status: 'Menunggu Approval',
    createdById: admin.id,
    items: { create: minuman.map(p => {
      const fisik   = p.stok - rand(2, 5)  // kurang dari sistem
      return {
        productId:   p.id, sku: p.sku, productName: p.name,
        stokSistem:  p.stok,
        stokFisik:   fisik,
        selisih:     fisik - p.stok,
      }
    })},
  }})

  console.log('✅ 2 Stock Opname')

  // ── 7. Sales Return ──────────────────────────────────────────────────────

  console.log('↩️ Membuat Sales Return...')

  await prisma.salesReturn.create({ data: {
    noReturn: 'SR-2026-001', noTransaksi: 'TRX-2026-0015',
    tanggal: daysAgo(20, 10), kasirId: kasir.id, kasirName: kasir.name,
    status: 'Disetujui',
    inspeksiOleh: admin.name, disetujuiOleh: manager.name,
    catatanInspeksi: 'Kemasan memang sobek dari pabrik. Isi masih baik, stok dikembalikan.',
    items: { create: [{
      productId: pm['KPI-001'].id, sku: 'KPI-001',
      productName: 'Kopi Arabica', harga: 65000, qty: 2,
      alasan: 'Produk Rusak', catatan: 'Kemasan plastik robek saat diterima pelanggan',
    }]},
  }})

  await prisma.salesReturn.create({ data: {
    noReturn: 'SR-2026-002', noTransaksi: 'TRX-2026-0038',
    tanggal: daysAgo(10, 14), kasirId: kasir.id, kasirName: kasir.name,
    status: 'Menunggu Approval',
    inspeksiOleh: admin.name,
    catatanInspeksi: 'Produk dalam kondisi baik. Pelanggan salah pilih varian rasa.',
    items: { create: [{
      productId: pm['SNK-006'].id, sku: 'SNK-006',
      productName: 'Keripik Singkong', harga: 22000, qty: 3,
      alasan: 'Salah Item', catatan: 'Pelanggan minta original, beli yang pedas',
    }]},
  }})

  await prisma.salesReturn.create({ data: {
    noReturn: 'SR-2026-003', noTransaksi: 'TRX-2026-0061',
    tanggal: daysAgo(4, 11), kasirId: kasir.id, kasirName: kasir.name,
    status: 'Menunggu Inspeksi',
    items: { create: [{
      productId: pm['VMN-012'].id, sku: 'VMN-012',
      productName: 'Vitamin C 1000mg', harga: 75000, qty: 1,
      alasan: 'Kadaluarsa', catatan: 'Pelanggan klaim produk sudah expired',
    }]},
  }})

  await prisma.salesReturn.create({ data: {
    noReturn: 'SR-2026-004', noTransaksi: 'TRX-2026-0079',
    tanggal: daysAgo(2, 13), kasirId: kasir.id, kasirName: kasir.name,
    status: 'Ditolak',
    inspeksiOleh: admin.name, disetujuiOleh: manager.name,
    catatanInspeksi: 'Tidak ada cacat produksi. Pelanggan hanya tidak suka rasa. Return ditolak.',
    items: { create: [{
      productId: pm['CKL-007'].id, sku: 'CKL-007',
      productName: 'Cokelat 70% Kakao', harga: 50000, qty: 2,
      alasan: 'Lainnya', catatan: 'Pelanggan bilang rasa terlalu pahit',
    }]},
  }})

  console.log('✅ 4 Sales Return')

  // ── 8. Notifikasi ────────────────────────────────────────────────────────

  console.log('🔔 Membuat Notifikasi...')

  await prisma.notification.createMany({ data: [
    {
      targetRole: 'manager',
      title:   'Auto Draft PO: Vitamin C 1000mg',
      message: 'Stok Vitamin C 1000mg mencapai ROP (sisa 22, ROP 20). Draft PO PO-2026-005 dibuat otomatis.',
      type: 'warning', link: '/dashboard/purchase-order', isRead: false,
      createdAt: daysAgo(1, 14),
    },
    {
      targetRole: 'manager',
      title:   'Stock Opname Selesai: OPN-2026-002',
      message: `Admin ${admin.name} menyelesaikan penghitungan fisik Area Minuman. Ada selisih stok. Menunggu persetujuan Anda.`,
      type: 'info', link: '/dashboard/stock-opname', isRead: false,
      createdAt: daysAgo(2, 16),
    },
    {
      targetRole: 'manager',
      title:   'Auto Draft PO: Kulit Manis Ceylon',
      message: 'Stok Kulit Manis Ceylon di bawah ROP (sisa 14, ROP 20). Draft PO perlu dibuat.',
      type: 'warning', link: '/dashboard/purchase-order', isRead: true,
      createdAt: daysAgo(7, 9),
    },
    {
      targetRole: 'admin',
      title:   'Opname Disetujui: OPN-2026-001',
      message: `Manager ${manager.name} menyetujui adjustment stok Semua Area. Stok telah diperbarui.`,
      type: 'success', link: '/dashboard/stock-opname', isRead: true,
      createdAt: daysAgo(21, 17),
    },
    {
      targetRole: 'admin',
      title:   'PO Dikirim: PO-2026-004',
      message: 'PT Herbal Indo mengkonfirmasi pengiriman. Estimasi tiba 3–5 hari kerja.',
      type: 'info', link: '/dashboard/purchase-order', isRead: false,
      createdAt: daysAgo(3, 10),
    },
  ]})

  console.log('✅ 5 Notifikasi')

  // ── 9. Reklasifikasi otomatis ────────────────────────────────────────────

  console.log('🤖 Menjalankan reklasifikasi berdasarkan histori 30 hari...')

  const now      = new Date()
  const window30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const summary: string[] = []

  for (const p of products) {
    const agg = await prisma.transactionItem.aggregate({
      where: { productId: p.id, transaction: { tanggal: { gte: window30 } } },
      _sum:  { qty: true },
    })

    const sold30 = agg._sum.qty ?? 0
    const klas: 'Fast' | 'Slow' | 'Dead' | 'InsufficientData' =
      sold30 >= 60 ? 'Fast' : sold30 > 0 ? 'Slow' : 'Dead'

    await prisma.product.update({ where: { id: p.id }, data: { klasifikasi: klas } })
    summary.push(`   ${p.sku} ${p.name}: ${sold30} unit → ${klas}`)
  }

  console.log('✅ Klasifikasi:')
  summary.forEach(s => console.log(s))

  // ── Done ─────────────────────────────────────────────────────────────────

  console.log(`
🎉 DEMO SEED SELESAI!

Login credentials:
  Manager  : manager@zentory.id  / manager123
  Admin    : admin@zentory.id    / admin123
  Kasir    : kasir@zentory.id    / kasir123

Data yang dibuat:
  ✔ 12 produk dengan stok realistis
  ✔ 5 Purchase Orders (Diterima×3, Dikirim×1, Draft×1)
  ✔ 3 Penerimaan Barang
  ✔ ${trxNo - 1} transaksi POS (45 hari)
  ✔ 2 Stock Opname (Disetujui + Menunggu Approval)
  ✔ 4 Sales Return (semua status)
  ✔ 5 Notifikasi
  ✔ Klasifikasi produk dari histori penjualan nyata
`)
}

main().catch(console.error).finally(() => (prisma as any).$disconnect())
