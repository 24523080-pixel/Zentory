import { Package, AlertTriangle } from 'lucide-react'
import { PRODUCTS } from './_data'
import { InventarisManager } from './_components/InventarisManager'
import { PageBanner } from '../_components/PageBanner'

const totalSKU     = PRODUCTS.length
const perluReorder = PRODUCTS.filter((p) => p.status === 'Reorder' || p.status === 'Kritis').length

export default function InventarisPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Inventaris</h1>
          <p className="text-xs text-muted-foreground">Kelola dan pantau semua stok produk</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <PageBanner
          icon={Package}
          variant="green"
          label="Zentory · Manajemen Stok"
          title="Gudang Anda dalam satu tampilan"
          description={`Pantau ${totalSKU} SKU secara real-time.`}
        >
          {perluReorder > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-4/15 px-3 py-1.5 text-xs font-semibold text-chart-4">
              <AlertTriangle className="size-3.5" />
              {perluReorder} perlu reorder
            </span>
          )}
        </PageBanner>

        <InventarisManager />
      </main>
    </>
  )
}
