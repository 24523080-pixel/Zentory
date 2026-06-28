import { ClipboardList } from 'lucide-react'
import { PURCHASE_ORDERS } from './_data'
import { POManager } from './_components/POManager'
import { PageBanner } from '../_components/PageBanner'

const total = PURCHASE_ORDERS.length

export default function PurchaseOrderPage() {
  return (
    <>
      <header className="flex h-16 items-center border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Purchase Order</h1>
          <p className="text-xs text-muted-foreground">Kelola pengadaan barang ke supplier</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <PageBanner
          icon={ClipboardList}
          variant="orange"
          label="Zentory · Pengadaan"
          title="Purchase Order"
          description="Buat dan pantau status pengadaan barang ke supplier."
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <ClipboardList className="size-3.5" />
            {total} PO bulan ini
          </span>
        </PageBanner>

        <POManager />
      </main>
    </>
  )
}
