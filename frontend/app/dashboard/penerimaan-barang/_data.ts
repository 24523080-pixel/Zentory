export type StatusPenerimaan = 'Menunggu' | 'Diterima' | 'Ada Selisih'

export interface ItemPenerimaan {
  sku:          string
  productName:  string
  qtyPO:        number
  qtyDiterima:  number
}

export interface Penerimaan {
  id:             string
  noPenerimaan:   string
  noPO:           string
  supplier:       string
  tanggal:        string
  status:         StatusPenerimaan
  items:          ItemPenerimaan[]
  catatan?:       string
}

export const PENERIMAAN_LIST: Penerimaan[] = [
  {
    id: 'pen-001', noPenerimaan: 'PEN-2026-018', noPO: 'PO-2026-041',
    supplier: 'Supplier Maju Jaya', tanggal: '2026-06-12', status: 'Diterima',
    items: [
      { sku: 'KOP-ARB-250', productName: 'Kopi Arabica 250g',   qtyPO: 100, qtyDiterima: 100 },
      { sku: 'TEH-HIJ-25',  productName: 'Teh Hijau Celup 25s', qtyPO: 50,  qtyDiterima: 50  },
      { sku: 'CRM-SCH-100', productName: 'Creamer Sachet 100s', qtyPO: 30,  qtyDiterima: 30  },
    ],
  },
  {
    id: 'pen-002', noPenerimaan: 'PEN-2026-017', noPO: 'PO-2026-040',
    supplier: 'Sumber Makmur Dist.', tanggal: '2026-06-10', status: 'Diterima',
    items: [
      { sku: 'KNT-PLS-30',  productName: 'Kantong Plastik 30x50', qtyPO: 500, qtyDiterima: 500 },
      { sku: 'SDT-FLX-100', productName: 'Sedotan Flex 100pcs',   qtyPO: 200, qtyDiterima: 200 },
    ],
  },
  {
    id: 'pen-003', noPenerimaan: 'PEN-2026-020', noPO: 'PO-2026-043',
    supplier: 'Cahaya Ritel Indo', tanggal: '2026-06-14', status: 'Ada Selisih',
    catatan: 'Garam Himalaya datang 18, bukan 24. Driver mengkonfirmasi sisa dalam pengiriman berikutnya.',
    items: [
      { sku: 'SOS-ABC-340', productName: 'Saus Sambal ABC 340ml', qtyPO: 48, qtyDiterima: 48 },
      { sku: 'GRM-HML-500', productName: 'Garam Himalaya 500g',   qtyPO: 24, qtyDiterima: 18 },
    ],
  },
  {
    id: 'pen-004', noPenerimaan: 'PEN-2026-016', noPO: 'PO-2026-038',
    supplier: 'Indo Distributor', tanggal: '2026-06-08', status: 'Diterima',
    items: [
      { sku: 'AIR-MIN-600', productName: 'Air Mineral 600ml',    qtyPO: 144, qtyDiterima: 144 },
      { sku: 'SRP-VNL-1L',  productName: 'Sirup Vanilla 1L',     qtyPO: 40,  qtyDiterima: 40  },
    ],
  },
  {
    id: 'pen-005', noPenerimaan: 'PEN-2026-015', noPO: 'PO-2026-036',
    supplier: 'Supplier Maju Jaya', tanggal: '2026-06-05', status: 'Ada Selisih',
    catatan: '2 karton Cup Paper rusak saat pengiriman, dikembalikan ke driver.',
    items: [
      { sku: 'CUP-PPR-16',  productName: 'Cup Paper 16oz',        qtyPO: 200, qtyDiterima: 176 },
      { sku: 'SDT-FLX-100', productName: 'Sedotan Flex 100pcs',   qtyPO: 100, qtyDiterima: 100 },
    ],
  },
  {
    id: 'pen-006', noPenerimaan: 'PEN-2026-019', noPO: 'PO-2026-042',
    supplier: 'Supplier Maju Jaya', tanggal: '2026-06-14', status: 'Menunggu',
    items: [
      { sku: 'SRP-VNL-1L',  productName: 'Sirup Vanilla 1L',      qtyPO: 60,  qtyDiterima: 0 },
      { sku: 'GUL-ARN-500', productName: 'Gula Aren Cair 500ml',  qtyPO: 80,  qtyDiterima: 0 },
      { sku: 'CKL-BBK-1KG', productName: 'Coklat Bubuk 1kg',      qtyPO: 20,  qtyDiterima: 0 },
      { sku: 'AIR-MIN-600', productName: 'Air Mineral 600ml',      qtyPO: 144, qtyDiterima: 0 },
    ],
  },
]
