export type NotifType =
  | 'reorder'        // stok mencapai reorder point
  | 'stockout'       // stok habis
  | 'po_approved'    // Manager approve PO
  | 'po_rejected'    // Manager reject PO
  | 'po_received'    // Barang masuk dari PO
  | 'return_inspeksi'// Return butuh inspeksi Admin
  | 'return_decision'// Manager putuskan return
  | 'opname'         // Laporan opname butuh approval
  | 'system'         // Sistem/umum

export type NotifPriority = 'high' | 'medium' | 'low'

export interface Notifikasi {
  id:        string
  type:      NotifType
  priority:  NotifPriority
  title:     string
  body:      string
  tanggal:   string
  dibaca:    boolean
  link?:     string
  targetRole: string[]   // role yang bisa lihat notif ini
}

export const NOTIFIKASI_LIST: Notifikasi[] = [
  {
    id: 'n-001', type: 'stockout', priority: 'high',
    title: 'Stok Habis: Garam Himalaya 500g',
    body: 'Stok GRM-HML-500 mencapai 0 unit. Transaksi POS untuk produk ini diblokir sementara.',
    tanggal: '2026-06-16T10:05', dibaca: false,
    link: '/dashboard/inventaris',
    targetRole: ['manager', 'admin'],
  },
  {
    id: 'n-002', type: 'return_inspeksi', priority: 'high',
    title: 'Return Baru Perlu Inspeksi',
    body: 'RTN-2026-012 dari kasir Budi Santoso (2 item, Rp 45.000) menunggu inspeksi fisik Anda.',
    tanggal: '2026-06-16T10:26', dibaca: false,
    link: '/dashboard/sales-return',
    targetRole: ['admin'],
  },
  {
    id: 'n-003', type: 'reorder', priority: 'high',
    title: 'Reorder Point: Kopi Arabica 250g',
    body: 'Stok KOP-ARB-250 tersisa 22 unit, di bawah reorder point (25). Draft PO otomatis telah dibuat.',
    tanggal: '2026-06-16T08:30', dibaca: false,
    link: '/dashboard/purchase-order',
    targetRole: ['manager', 'admin'],
  },
  {
    id: 'n-004', type: 'opname', priority: 'high',
    title: 'Laporan Stock Opname Menunggu Approval',
    body: 'OPN-2026-007 (Area Kemasan) oleh Sinta Dewi telah selesai dihitung. Ditemukan selisih −Rp 122.500. Mohon ditinjau.',
    tanggal: '2026-06-13T11:35', dibaca: false,
    link: '/dashboard/stock-opname',
    targetRole: ['manager'],
  },
  {
    id: 'n-005', type: 'return_decision', priority: 'medium',
    title: 'Return RTN-2026-011 Disetujui Manager',
    body: 'Manager telah menyetujui return RTN-2026-011. Stok Saus Sambal ABC 340ml (+1 unit) dikembalikan ke inventaris aktif.',
    tanggal: '2026-06-15T15:00', dibaca: false,
    link: '/dashboard/sales-return',
    targetRole: ['admin', 'kasir'],
  },
  {
    id: 'n-006', type: 'po_approved', priority: 'medium',
    title: 'PO-2026-041 Disetujui',
    body: 'Manager telah menyetujui Purchase Order PO-2026-041 (Supplier Maju, Rp 2.450.000). PO telah dikirim ke supplier.',
    tanggal: '2026-06-15T09:00', dibaca: true,
    link: '/dashboard/purchase-order',
    targetRole: ['admin'],
  },
  {
    id: 'n-007', type: 'reorder', priority: 'medium',
    title: 'Reorder Point: Cup Paper 16oz',
    body: 'Stok CUP-PPR-16 tersisa 6 unit, jauh di bawah reorder point (50). Segera buat Purchase Order.',
    tanggal: '2026-06-14T14:20', dibaca: true,
    link: '/dashboard/inventaris',
    targetRole: ['manager', 'admin'],
  },
  {
    id: 'n-008', type: 'po_received', priority: 'low',
    title: 'Penerimaan Barang: PO-2026-039',
    body: 'Barang dari PO-2026-039 (Supplier Sejahtera) diterima lengkap. Stok telah diperbarui otomatis.',
    tanggal: '2026-06-13T10:00', dibaca: true,
    link: '/dashboard/penerimaan-barang',
    targetRole: ['manager', 'admin'],
  },
  {
    id: 'n-009', type: 'return_decision', priority: 'medium',
    title: 'Return RTN-2026-010 Ditolak Manager',
    body: 'Manager menolak return RTN-2026-010 (Sirup Vanilla 1L ×3). Alasan: pelanggan berubah pikiran bukan termasuk garansi.',
    tanggal: '2026-06-14T10:30', dibaca: true,
    link: '/dashboard/sales-return',
    targetRole: ['kasir'],
  },
  {
    id: 'n-010', type: 'system', priority: 'low',
    title: 'Laporan Bulanan Mei 2026 Tersedia',
    body: 'Laporan ringkasan stok dan penjualan bulan Mei 2026 sudah dapat diunduh dari halaman Analitik.',
    tanggal: '2026-06-01T08:00', dibaca: true,
    link: '/dashboard/analitik',
    targetRole: ['manager'],
  },
]
