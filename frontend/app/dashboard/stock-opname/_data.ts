export type OpnameStatus = 'Berlangsung' | 'Menunggu Approval' | 'Disetujui' | 'Ditolak'

export interface OpnameItem {
  productId:   string
  productName: string
  sku:         string
  stokSistem:  number
  stokFisik:   number | null  // null = belum dihitung
  harga:       number
}

export interface StockOpname {
  id:         string
  noOpname:   string
  area:       string
  mulai:      string
  selesai?:   string
  status:     OpnameStatus
  dibuatOleh: string
  catatan?:   string
  items:      OpnameItem[]
}

export const OPNAME_LIST: StockOpname[] = [
  {
    id: 'op-001', noOpname: 'OPN-2026-008', area: 'Area Minuman',
    mulai: '2026-06-15T08:00', status: 'Berlangsung', dibuatOleh: 'Sinta Dewi',
    items: [
      { productId: 'p01', productName: 'Kopi Arabica 250g',   sku: 'KOP-ARB-250', stokSistem: 22,  stokFisik: 20,   harga: 28000 },
      { productId: 'p02', productName: 'Teh Hijau Celup 25s', sku: 'TEH-HIJ-25',  stokSistem: 85,  stokFisik: 85,   harga: 15000 },
      { productId: 'p03', productName: 'Sirup Vanilla 1L',    sku: 'SRP-VNL-1L',  stokSistem: 240, stokFisik: null, harga: 35000 },
      { productId: 'p04', productName: 'Gula Aren Cair 500ml',sku: 'GUL-ARN-500', stokSistem: 18,  stokFisik: null, harga: 18000 },
      { productId: 'p05', productName: 'Creamer Sachet 100s', sku: 'CRM-SCH-100', stokSistem: 12,  stokFisik: 14,   harga: 42000 },
      { productId: 'p06', productName: 'Air Mineral 600ml',   sku: 'AIR-MIN-600', stokSistem: 144, stokFisik: null, harga: 3500  },
    ],
  },
  {
    id: 'op-002', noOpname: 'OPN-2026-007', area: 'Area Kemasan',
    mulai: '2026-06-13T09:00', selesai: '2026-06-13T11:30',
    status: 'Menunggu Approval', dibuatOleh: 'Sinta Dewi',
    catatan: 'Ditemukan 13 pcs kantong plastik rusak. 12 pcs sedotan tidak ditemukan di rak.',
    items: [
      { productId: 'p07', productName: 'Kantong Plastik 30x50',sku: 'KNT-PLS-30',  stokSistem: 500, stokFisik: 487, harga: 1200 },
      { productId: 'p08', productName: 'Cup Paper 16oz',        sku: 'CUP-PPR-16',  stokSistem: 6,   stokFisik: 6,   harga: 2800 },
      { productId: 'p09', productName: 'Sedotan Flex 100pcs',   sku: 'SDT-FLX-100', stokSistem: 210, stokFisik: 198, harga: 8500 },
    ],
  },
  {
    id: 'op-003', noOpname: 'OPN-2026-006', area: 'Area Bumbu',
    mulai: '2026-06-10T08:00', selesai: '2026-06-10T09:45',
    status: 'Disetujui', dibuatOleh: 'Sinta Dewi',
    items: [
      { productId: 'p10', productName: 'Saus Sambal ABC 340ml',sku: 'SOS-ABC-340', stokSistem: 3, stokFisik: 3, harga: 22000 },
      { productId: 'p11', productName: 'Garam Himalaya 500g',  sku: 'GRM-HML-500', stokSistem: 2, stokFisik: 2, harga: 18500 },
    ],
  },
  {
    id: 'op-004', noOpname: 'OPN-2026-005', area: 'Area Minuman',
    mulai: '2026-06-05T08:00', selesai: '2026-06-05T10:00',
    status: 'Ditolak', dibuatOleh: 'Sinta Dewi',
    catatan: 'Data tidak konsisten dengan CCTV gudang. Mohon lakukan opname ulang.',
    items: [
      { productId: 'p01', productName: 'Kopi Arabica 250g', sku: 'KOP-ARB-250', stokSistem: 100, stokFisik: 87, harga: 28000 },
    ],
  },
]

export const AREA_OPTIONS = ['Area Minuman', 'Area Kemasan', 'Area Bumbu', 'Area Snack', 'Semua Area']
