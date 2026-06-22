import { Package, AlertTriangle, TrendingDown, PlusCircle } from 'lucide-react'
import { PRODUCTS } from './_data'
import { InventarisTable } from './_components/InventarisTable'
import { PageBanner } from '../_components/PageBanner'

const totalSKU      = PRODUCTS.length
const totalStok     = PRODUCTS.reduce((s, p) => s + p.stok, 0)
const perluReorder  = PRODUCTS.filter((p) => p.status === 'Reorder' || p.status === 'Kritis').length
const deadStock     = PRODUCTS.filter((p) => p.klasifikasi === 'Dead').length

const SUMMARY = [
  { label: 'Total SKU',      value: totalSKU,                   icon: Package,      accent: 'text-primary',   glow: 'bg-primary/10'   },
  { label: 'Total Stok',     value: totalStok.toLocaleString(), icon: Package,      accent: 'text-chart-3',   glow: 'bg-chart-3/10'   },
  { label: 'Perlu Reorder',  value: `${perluReorder} SKU`,      icon: AlertTriangle,accent: 'text-chart-4',   glow: 'bg-chart-4/10'   },
  { label: 'Dead Stock',     value: `${deadStock} SKU`,         icon: TrendingDown, accent: 'text-destructive',glow:'bg-destructive/10'},
]

export default function InventarisPage() {
  return (
    <>
      {/* Topbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Inventaris</h1>
          <p className="text-xs text-muted-foreground">Kelola dan pantau semua stok produk</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PlusCircle className="size-4" />
          Tambah Produk
        </button>
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

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-white to-card p-4 shadow-xs"
            >
              <div className={`pointer-events-none absolute -right-3 -top-3 size-20 rounded-full ${s.glow} blur-2xl opacity-70`} />
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <s.icon className={`size-4 ${s.accent}`} />
              </div>
              <p className="text-xl font-semibold tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <InventarisTable />

      </main>
    </>
  )
}
