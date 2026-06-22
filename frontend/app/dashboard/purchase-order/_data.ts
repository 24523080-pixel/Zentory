export type POStatus = 'Draft' | 'Dikirim' | 'Diterima' | 'Dibatalkan'

export interface POItem {
  productName: string
  sku:         string
  qty:         number
  hargaSatuan: number
}

export interface PurchaseOrder {
  id:       string
  noPO:     string
  supplier: string
  tanggal:  string
  status:   POStatus
  items:    POItem[]
}

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001', noPO: 'PO-2026-041', supplier: 'Supplier Maju Jaya',
    tanggal: '2026-06-12', status: 'Diterima',
    items: [
      { productName: 'Kopi Arabica 250g',    sku: 'KOP-ARB-250', qty: 100, hargaSatuan: 28000 },
      { productName: 'Teh Hijau Celup 25s',  sku: 'TEH-HIJ-25',  qty: 50,  hargaSatuan: 15000 },
      { productName: 'Creamer Sachet 100s',  sku: 'CRM-SCH-100', qty: 30,  hargaSatuan: 42000 },
    ],
  },
  {
    id: 'po-002', noPO: 'PO-2026-040', supplier: 'Sumber Makmur Dist.',
    tanggal: '2026-06-10', status: 'Diterima',
    items: [
      { productName: 'Kantong Plastik 30x50', sku: 'KNT-PLS-30',  qty: 500, hargaSatuan: 1200  },
      { productName: 'Sedotan Flex 100pcs',   sku: 'SDT-FLX-100', qty: 200, hargaSatuan: 8500  },
    ],
  },
  {
    id: 'po-003', noPO: 'PO-2026-042', supplier: 'Supplier Maju Jaya',
    tanggal: '2026-06-14', status: 'Dikirim',
    items: [
      { productName: 'Sirup Vanilla 1L',      sku: 'SRP-VNL-1L',  qty: 60,  hargaSatuan: 35000 },
      { productName: 'Gula Aren Cair 500ml',  sku: 'GUL-ARN-500', qty: 80,  hargaSatuan: 18000 },
      { productName: 'Coklat Bubuk 1kg',      sku: 'CKL-BBK-1KG', qty: 20,  hargaSatuan: 55000 },
      { productName: 'Air Mineral 600ml',     sku: 'AIR-MIN-600', qty: 144, hargaSatuan: 3500  },
    ],
  },
  {
    id: 'po-004', noPO: 'PO-2026-043', supplier: 'Cahaya Ritel Indo',
    tanggal: '2026-06-14', status: 'Dikirim',
    items: [
      { productName: 'Saus Sambal ABC 340ml', sku: 'SOS-ABC-340', qty: 48,  hargaSatuan: 22000 },
      { productName: 'Garam Himalaya 500g',   sku: 'GRM-HML-500', qty: 24,  hargaSatuan: 18500 },
    ],
  },
  {
    id: 'po-005', noPO: 'PO-2026-044', supplier: 'Sumber Makmur Dist.',
    tanggal: '2026-06-15', status: 'Draft',
    items: [
      { productName: 'Cup Paper 16oz',        sku: 'CUP-PPR-16',  qty: 200, hargaSatuan: 2800  },
      { productName: 'Sedotan Flex 100pcs',   sku: 'SDT-FLX-100', qty: 100, hargaSatuan: 8500  },
      { productName: 'Kantong Plastik 30x50', sku: 'KNT-PLS-30',  qty: 300, hargaSatuan: 1200  },
    ],
  },
  {
    id: 'po-006', noPO: 'PO-2026-045', supplier: 'Indo Distributor',
    tanggal: '2026-06-15', status: 'Draft',
    items: [
      { productName: 'Kopi Arabica 250g',    sku: 'KOP-ARB-250', qty: 50,  hargaSatuan: 28000 },
      { productName: 'Teh Hijau Celup 25s',  sku: 'TEH-HIJ-25',  qty: 80,  hargaSatuan: 15000 },
      { productName: 'Gula Aren Cair 500ml', sku: 'GUL-ARN-500', qty: 60,  hargaSatuan: 18000 },
      { productName: 'Sirup Vanilla 1L',     sku: 'SRP-VNL-1L',  qty: 40,  hargaSatuan: 35000 },
      { productName: 'Creamer Sachet 100s',  sku: 'CRM-SCH-100', qty: 25,  hargaSatuan: 42000 },
    ],
  },
  {
    id: 'po-007', noPO: 'PO-2026-046', supplier: 'Supplier Maju Jaya',
    tanggal: '2026-06-15', status: 'Draft',
    items: [
      { productName: 'Coklat Bubuk 1kg',    sku: 'CKL-BBK-1KG', qty: 15, hargaSatuan: 55000 },
      { productName: 'Garam Himalaya 500g', sku: 'GRM-HML-500', qty: 20, hargaSatuan: 18500 },
    ],
  },
  {
    id: 'po-008', noPO: 'PO-2026-039', supplier: 'Cahaya Ritel Indo',
    tanggal: '2026-06-08', status: 'Dibatalkan',
    items: [
      { productName: 'Air Mineral 600ml', sku: 'AIR-MIN-600', qty: 288, hargaSatuan: 3500 },
    ],
  },
]

export function totalNilai(po: PurchaseOrder): number {
  return po.items.reduce((s, i) => s + i.qty * i.hargaSatuan, 0)
}
