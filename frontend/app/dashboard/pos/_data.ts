export interface POSProduct {
  id:       string
  name:     string
  sku:      string
  kategori: string
  harga:    number
  stok:     number
  rop:      number
}

export const POS_PRODUCTS: POSProduct[] = [
  { id: 'p01', name: 'Kopi Arabica 250g',    sku: 'KOP-ARB-250', kategori: 'Minuman',  harga: 35000, stok: 22,  rop: 20  },
  { id: 'p02', name: 'Teh Hijau Celup 25s',  sku: 'TEH-HIJ-25',  kategori: 'Minuman',  harga: 18000, stok: 85,  rop: 40  },
  { id: 'p03', name: 'Sirup Vanilla 1L',     sku: 'SRP-VNL-1L',  kategori: 'Minuman',  harga: 45000, stok: 240, rop: 80  },
  { id: 'p04', name: 'Gula Aren Cair 500ml', sku: 'GUL-ARN-500', kategori: 'Minuman',  harga: 25000, stok: 18,  rop: 20  },
  { id: 'p05', name: 'Creamer Sachet 100s',  sku: 'CRM-SCH-100', kategori: 'Minuman',  harga: 48000, stok: 12,  rop: 15  },
  { id: 'p06', name: 'Coklat Bubuk 1kg',     sku: 'CKL-BBK-1KG', kategori: 'Minuman',  harga: 65000, stok: 4,   rop: 10  },
  { id: 'p07', name: 'Air Mineral 600ml',    sku: 'AIR-MIN-600', kategori: 'Minuman',  harga: 4500,  stok: 144, rop: 60  },
  { id: 'p08', name: 'Kantong Plastik 30x50',sku: 'KNT-PLS-30',  kategori: 'Kemasan',  harga: 2000,  stok: 500, rop: 150 },
  { id: 'p09', name: 'Cup Paper 16oz',       sku: 'CUP-PPR-16',  kategori: 'Kemasan',  harga: 5000,  stok: 6,   rop: 10  },
  { id: 'p10', name: 'Sedotan Flex 100pcs',  sku: 'SDT-FLX-100', kategori: 'Kemasan',  harga: 10000, stok: 210, rop: 80  },
  { id: 'p11', name: 'Saus Sambal ABC 340ml',sku: 'SOS-ABC-340', kategori: 'Bumbu',    harga: 25000, stok: 3,   rop: 10  },
  { id: 'p12', name: 'Garam Himalaya 500g',  sku: 'GRM-HML-500', kategori: 'Bumbu',    harga: 22000, stok: 0,   rop: 10  },
]

export const KATEGORI = ['Semua', 'Minuman', 'Kemasan', 'Bumbu']
