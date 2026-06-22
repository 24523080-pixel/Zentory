export type ReturnStatus =
  | 'Menunggu Inspeksi'   // Kasir baru buat → tunggu Admin inspeksi
  | 'Menunggu Approval'   // Admin sudah inspeksi → tunggu Manager
  | 'Disetujui'           // Manager setujui → stok kembali aktif
  | 'Ditolak'             // Manager tolak → item dihapus dari sistem

export type AlasanReturn =
  | 'Produk Rusak'
  | 'Salah Item'
  | 'Kadaluarsa'
  | 'Kelebihan Qty'
  | 'Lainnya'

export interface ReturnItem {
  productId:   string
  productName: string
  sku:         string
  harga:       number
  qty:         number
  alasan:      AlasanReturn
  catatan?:    string
}

export interface SalesReturn {
  id:             string
  noReturn:       string
  noTransaksi:    string
  tanggal:        string
  kasir:          string
  status:         ReturnStatus
  inspeksiOleh?:  string
  disetujuiOleh?: string
  catatanInspeksi?: string
  items:          ReturnItem[]
}

export const RETURN_LIST: SalesReturn[] = [
  {
    id: 'sr-001', noReturn: 'RTN-2026-012', noTransaksi: 'TRX-2026-0891',
    tanggal: '2026-06-16T10:25', kasir: 'Budi Santoso', status: 'Menunggu Inspeksi',
    items: [
      { productId: 'p01', productName: 'Kopi Arabica 250g', sku: 'KOP-ARB-250', harga: 35000, qty: 1, alasan: 'Produk Rusak', catatan: 'Kemasan sobek, kopi tumpah' },
      { productId: 'p08', productName: 'Cup Paper 16oz',    sku: 'CUP-PPR-16',  harga: 5000,  qty: 2, alasan: 'Salah Item',   catatan: 'Pelanggan minta ukuran 8oz' },
    ],
  },
  {
    id: 'sr-005', noReturn: 'RTN-2026-008', noTransaksi: 'TRX-2026-0820',
    tanggal: '2026-06-12T11:30', kasir: 'Budi Santoso', status: 'Menunggu Inspeksi',
    items: [
      { productId: 'p06', productName: 'Coklat Bubuk 1kg', sku: 'CKL-BBK-1KG', harga: 65000, qty: 1, alasan: 'Produk Rusak', catatan: 'Kemasan penyok, produk diduga tercemar' },
    ],
  },
  {
    id: 'sr-006', noReturn: 'RTN-2026-007', noTransaksi: 'TRX-2026-0810',
    tanggal: '2026-06-11T09:15', kasir: 'Rina Lestari', status: 'Menunggu Approval',
    inspeksiOleh: 'Sinta Dewi', catatanInspeksi: 'Produk memang rusak, layak dikembalikan ke supplier.',
    items: [
      { productId: 'p11', productName: 'Saus Sambal ABC 340ml', sku: 'SOS-ABC-340', harga: 25000, qty: 2, alasan: 'Produk Rusak' },
    ],
  },
  {
    id: 'sr-002', noReturn: 'RTN-2026-011', noTransaksi: 'TRX-2026-0876',
    tanggal: '2026-06-15T14:10', kasir: 'Budi Santoso', status: 'Disetujui',
    inspeksiOleh: 'Sinta Dewi', disetujuiOleh: 'Manager',
    items: [
      { productId: 'p11', productName: 'Saus Sambal ABC 340ml', sku: 'SOS-ABC-340', harga: 25000, qty: 1, alasan: 'Kadaluarsa', catatan: 'Tanggal kedaluarsa 12 Juni 2026' },
    ],
  },
  {
    id: 'sr-003', noReturn: 'RTN-2026-010', noTransaksi: 'TRX-2026-0860',
    tanggal: '2026-06-14T09:50', kasir: 'Rina Lestari', status: 'Ditolak',
    inspeksiOleh: 'Sinta Dewi', disetujuiOleh: 'Manager',
    items: [
      { productId: 'p03', productName: 'Sirup Vanilla 1L', sku: 'SRP-VNL-1L', harga: 45000, qty: 3, alasan: 'Lainnya', catatan: 'Pelanggan berubah pikiran' },
    ],
  },
  {
    id: 'sr-004', noReturn: 'RTN-2026-009', noTransaksi: 'TRX-2026-0841',
    tanggal: '2026-06-13T16:05', kasir: 'Rina Lestari', status: 'Disetujui',
    inspeksiOleh: 'Sinta Dewi', disetujuiOleh: 'Manager',
    items: [
      { productId: 'p10', productName: 'Sedotan Flex 100pcs', sku: 'SDT-FLX-100', harga: 10000, qty: 1, alasan: 'Kelebihan Qty' },
      { productId: 'p02', productName: 'Teh Hijau Celup 25s', sku: 'TEH-HIJ-25',  harga: 18000, qty: 2, alasan: 'Salah Item' },
    ],
  },
]

export const ALASAN_OPTIONS: AlasanReturn[] = [
  'Produk Rusak', 'Salah Item', 'Kadaluarsa', 'Kelebihan Qty', 'Lainnya',
]

export function totalReturn(ret: SalesReturn) {
  return ret.items.reduce((s, i) => s + i.harga * i.qty, 0)
}
