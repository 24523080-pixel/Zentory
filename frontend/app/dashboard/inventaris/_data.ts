export type Status       = 'Tersedia' | 'Reorder' | 'Kritis'
export type Klasifikasi  = 'Fast' | 'Slow' | 'Dead'

export interface Product {
  id:           number
  name:         string
  sku:          string
  kategori:     string
  stok:         number
  rop:          number
  status:       Status
  klasifikasi:  Klasifikasi
}

export const PRODUCTS: Product[] = [
  { id:  1, name: 'Kopi Arabica 250g',    sku: 'KOP-ARB-250', kategori: 'Minuman',  stok: 22,  rop: 25,  status: 'Reorder',  klasifikasi: 'Fast' },
  { id:  2, name: 'Cup Paper 16oz',       sku: 'CUP-PPR-16',  kategori: 'Kemasan',  stok: 6,   rop: 50,  status: 'Kritis',   klasifikasi: 'Fast' },
  { id:  3, name: 'Gula Aren Cair 500ml', sku: 'GUL-ARN-500', kategori: 'Minuman',  stok: 18,  rop: 20,  status: 'Reorder',  klasifikasi: 'Slow' },
  { id:  4, name: 'Sirup Vanilla 1L',     sku: 'SRP-VNL-1L',  kategori: 'Minuman',  stok: 240, rop: 30,  status: 'Tersedia', klasifikasi: 'Fast' },
  { id:  5, name: 'Teh Hijau Celup 25s',  sku: 'TEH-HIJ-25',  kategori: 'Minuman',  stok: 85,  rop: 30,  status: 'Tersedia', klasifikasi: 'Fast' },
  { id:  6, name: 'Creamer Sachet 100s',  sku: 'CRM-SCH-100', kategori: 'Minuman',  stok: 12,  rop: 20,  status: 'Kritis',   klasifikasi: 'Slow' },
  { id:  7, name: 'Kantong Plastik 30x50',sku: 'KNT-PLS-30',  kategori: 'Kemasan',  stok: 500, rop: 100, status: 'Tersedia', klasifikasi: 'Fast' },
  { id:  8, name: 'Saus Sambal ABC 340ml',sku: 'SOS-ABC-340', kategori: 'Bumbu',    stok: 3,   rop: 12,  status: 'Kritis',   klasifikasi: 'Slow' },
  { id:  9, name: 'Coklat Bubuk 1kg',     sku: 'CKL-BBK-1KG', kategori: 'Minuman',  stok: 4,   rop: 10,  status: 'Kritis',   klasifikasi: 'Dead' },
  { id: 10, name: 'Sedotan Flex 100pcs',  sku: 'SDT-FLX-100', kategori: 'Kemasan',  stok: 210, rop: 50,  status: 'Tersedia', klasifikasi: 'Slow' },
  { id: 11, name: 'Garam Himalaya 500g',  sku: 'GRM-HML-500', kategori: 'Bumbu',    stok: 2,   rop: 5,   status: 'Kritis',   klasifikasi: 'Dead' },
  { id: 12, name: 'Air Mineral 600ml',    sku: 'AIR-MIN-600', kategori: 'Minuman',  stok: 144, rop: 48,  status: 'Tersedia', klasifikasi: 'Fast' },
]
