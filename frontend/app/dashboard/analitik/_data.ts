export type Klasifikasi = 'Fast Moving' | 'Slow Moving' | 'Dead Stock' | 'Insufficient Data'
export type TrendArah   = 'naik' | 'turun' | 'stabil'

export interface ProductAnalytic {
  id:           string
  name:         string
  sku:          string
  kategori:     string
  stokAktif:    number
  reorderPoint: number
  hargaPokok:   number
  hargaJual:    number          // untuk hitung margin
  leadTimePO:   number          // hari dari order ke terima barang
  jumlahReturn: number          // total unit diretur dalam 3 bulan terakhir
  riwayatStockout: number       // berapa kali stok = 0 dalam 6 bulan terakhir

  // 6 bulan historis penjualan (bulan ini + 5 bulan lalu)
  terjualBulanIni: number
  terjualBulan1:   number
  terjualBulan2:   number
  terjualBulan3:   number
  terjualBulan4:   number
  terjualBulan5:   number

  klasifikasi:  Klasifikasi
  trendArah:    TrendArah       // berdasarkan perbandingan 3 bulan terakhir vs 3 bulan sebelumnya
  velocity:     number          // rata-rata unit/bulan (6 bln)
  turnoverDays: number          // hari habis pada kecepatan saat ini
}

export const PRODUCTS_ANALYTIC: ProductAnalytic[] = [
  {
    id: 'p01', name: 'Kopi Arabica 250g', sku: 'KOP-ARB-250', kategori: 'Minuman',
    stokAktif: 22, reorderPoint: 25, hargaPokok: 28000, hargaJual: 35000,
    leadTimePO: 3, jumlahReturn: 1, riwayatStockout: 2,
    terjualBulanIni: 95, terjualBulan1: 102, terjualBulan2: 98,
    terjualBulan3: 89, terjualBulan4: 84,  terjualBulan5: 79,
    klasifikasi: 'Fast Moving', trendArah: 'naik', velocity: 91, turnoverDays: 7,
  },
  {
    id: 'p07', name: 'Air Mineral 600ml', sku: 'AIR-MIN-600', kategori: 'Minuman',
    stokAktif: 144, reorderPoint: 100, hargaPokok: 3500, hargaJual: 4500,
    leadTimePO: 2, jumlahReturn: 0, riwayatStockout: 0,
    terjualBulanIni: 312, terjualBulan1: 298, terjualBulan2: 324,
    terjualBulan3: 305, terjualBulan4: 310, terjualBulan5: 290,
    klasifikasi: 'Fast Moving', trendArah: 'stabil', velocity: 307, turnoverDays: 14,
  },
  {
    id: 'p02', name: 'Teh Hijau Celup 25s', sku: 'TEH-HIJ-25', kategori: 'Minuman',
    stokAktif: 85, reorderPoint: 50, hargaPokok: 15000, hargaJual: 18000,
    leadTimePO: 3, jumlahReturn: 0, riwayatStockout: 0,
    terjualBulanIni: 78, terjualBulan1: 81, terjualBulan2: 74,
    terjualBulan3: 80, terjualBulan4: 76, terjualBulan5: 70,
    klasifikasi: 'Fast Moving', trendArah: 'stabil', velocity: 77, turnoverDays: 33,
  },
  {
    id: 'p08', name: 'Kantong Plastik 30x50', sku: 'KNT-PLS-30', kategori: 'Kemasan',
    stokAktif: 487, reorderPoint: 200, hargaPokok: 1200, hargaJual: 2000,
    leadTimePO: 5, jumlahReturn: 13, riwayatStockout: 0,
    terjualBulanIni: 210, terjualBulan1: 195, terjualBulan2: 205,
    terjualBulan3: 215, terjualBulan4: 220, terjualBulan5: 230,
    klasifikasi: 'Fast Moving', trendArah: 'turun', velocity: 212, turnoverDays: 69,
  },
  {
    id: 'p10', name: 'Sedotan Flex 100pcs', sku: 'SDT-FLX-100', kategori: 'Kemasan',
    stokAktif: 210, reorderPoint: 80, hargaPokok: 8500, hargaJual: 10000,
    leadTimePO: 5, jumlahReturn: 1, riwayatStockout: 0,
    terjualBulanIni: 45, terjualBulan1: 52, terjualBulan2: 48,
    terjualBulan3: 41, terjualBulan4: 38, terjualBulan5: 35,
    klasifikasi: 'Slow Moving', trendArah: 'naik', velocity: 43, turnoverDays: 146,
  },
  {
    id: 'p03', name: 'Sirup Vanilla 1L', sku: 'SRP-VNL-1L', kategori: 'Minuman',
    stokAktif: 240, reorderPoint: 30, hargaPokok: 35000, hargaJual: 45000,
    leadTimePO: 7, jumlahReturn: 3, riwayatStockout: 0,
    terjualBulanIni: 12, terjualBulan1: 14, terjualBulan2: 10,
    terjualBulan3: 9,  terjualBulan4: 11, terjualBulan5: 13,
    klasifikasi: 'Slow Moving', trendArah: 'stabil', velocity: 12, turnoverDays: 600,
  },
  {
    id: 'p05', name: 'Creamer Sachet 100s', sku: 'CRM-SCH-100', kategori: 'Minuman',
    stokAktif: 12, reorderPoint: 20, hargaPokok: 42000, hargaJual: 48000,
    leadTimePO: 4, jumlahReturn: 0, riwayatStockout: 1,
    terjualBulanIni: 8, terjualBulan1: 9, terjualBulan2: 7,
    terjualBulan3: 11, terjualBulan4: 13, terjualBulan5: 14,
    klasifikasi: 'Slow Moving', trendArah: 'turun', velocity: 10, turnoverDays: 36,
  },
  {
    id: 'p04', name: 'Gula Aren Cair 500ml', sku: 'GUL-ARN-500', kategori: 'Minuman',
    stokAktif: 18, reorderPoint: 20, hargaPokok: 18000, hargaJual: 25000,
    leadTimePO: 4, jumlahReturn: 0, riwayatStockout: 1,
    terjualBulanIni: 6, terjualBulan1: 5, terjualBulan2: 7,
    terjualBulan3: 4, terjualBulan4: 5, terjualBulan5: 6,
    klasifikasi: 'Slow Moving', trendArah: 'stabil', velocity: 6, turnoverDays: 90,
  },
  {
    id: 'p11', name: 'Saus Sambal ABC 340ml', sku: 'SOS-ABC-340', kategori: 'Bumbu',
    stokAktif: 3, reorderPoint: 10, hargaPokok: 22000, hargaJual: 25000,
    leadTimePO: 5, jumlahReturn: 0, riwayatStockout: 0,
    terjualBulanIni: 1, terjualBulan1: 0, terjualBulan2: 2,
    terjualBulan3: 0, terjualBulan4: 1, terjualBulan5: 2,
    klasifikasi: 'Dead Stock', trendArah: 'turun', velocity: 1, turnoverDays: 90,
  },
  {
    id: 'p09', name: 'Cup Paper 16oz', sku: 'CUP-PPR-16', kategori: 'Kemasan',
    stokAktif: 6, reorderPoint: 50, hargaPokok: 2800, hargaJual: 5000,
    leadTimePO: 5, jumlahReturn: 0, riwayatStockout: 0,
    terjualBulanIni: 0, terjualBulan1: 1, terjualBulan2: 0,
    terjualBulan3: 1, terjualBulan4: 0, terjualBulan5: 1,
    klasifikasi: 'Dead Stock', trendArah: 'turun', velocity: 1, turnoverDays: 180,
  },
  {
    id: 'p06', name: 'Coklat Bubuk 1kg', sku: 'CKL-BBK-1KG', kategori: 'Minuman',
    stokAktif: 4, reorderPoint: 5, hargaPokok: 65000, hargaJual: 75000,
    leadTimePO: 7, jumlahReturn: 0, riwayatStockout: 0,
    terjualBulanIni: 0, terjualBulan1: 0, terjualBulan2: 1,
    terjualBulan3: 0, terjualBulan4: 0, terjualBulan5: 0,
    klasifikasi: 'Dead Stock', trendArah: 'turun', velocity: 0, turnoverDays: 999,
  },
  {
    id: 'p12', name: 'Garam Himalaya 500g', sku: 'GRM-HML-500', kategori: 'Bumbu',
    stokAktif: 0, reorderPoint: 5, hargaPokok: 18500, hargaJual: 22000,
    leadTimePO: 5, jumlahReturn: 0, riwayatStockout: 3,
    terjualBulanIni: 0, terjualBulan1: 0, terjualBulan2: 0,
    terjualBulan3: 0, terjualBulan4: 0, terjualBulan5: 0,
    klasifikasi: 'Insufficient Data', trendArah: 'stabil', velocity: 0, turnoverDays: 0,
  },
]

// Tren penjualan mingguan (total semua produk)
export const WEEKLY_SALES = [
  { label: 'Mg 1', nilai: 14200000 },
  { label: 'Mg 2', nilai: 17800000 },
  { label: 'Mg 3', nilai: 15600000 },
  { label: 'Mg 4', nilai: 21400000 },
]

// Tren 6 bulan terakhir
export const MONTHLY_SALES = [
  { label: 'Jan', nilai: 52000000 },
  { label: 'Feb', nilai: 48000000 },
  { label: 'Mar', nilai: 61000000 },
  { label: 'Apr', nilai: 55000000 },
  { label: 'Mei', nilai: 67000000 },
  { label: 'Jun', nilai: 54600000 },
]
