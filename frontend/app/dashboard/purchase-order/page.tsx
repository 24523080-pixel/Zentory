import { ClipboardList, Clock, PackageCheck, PlusCircle, XCircle } from 'lucide-react'
import { PURCHASE_ORDERS, totalNilai } from './_data'
import { POTable } from './_components/POTable'
import { PageBanner } from '../_components/PageBanner'

const total      = PURCHASE_ORDERS.length
const draft      = PURCHASE_ORDERS.filter((p) => p.status === 'Draft').length
const dikirim    = PURCHASE_ORDERS.filter((p) => p.status === 'Dikirim').length
const diterima   = PURCHASE_ORDERS.filter((p) => p.status === 'Diterima').length
const nilaiTotal = PURCHASE_ORDERS
  .filter((p) => p.status !== 'Dibatalkan')
  .reduce((s, p) => s + totalNilai(p), 0)

const SUMMARY = [
  { label: 'Total PO Bulan Ini', value: total,                                     icon: ClipboardList, accent: 'text-primary',    glow: 'bg-primary/10'    },
  { label: 'Draft',              value: `${draft} PO`,                             icon: ClipboardList, accent: 'text-muted-foreground', glow: 'bg-muted'    },
  { label: 'Menunggu Konfirmasi',value: `${dikirim} PO`,                           icon: Clock,         accent: 'text-chart-4',    glow: 'bg-chart-4/10'    },
  { label: 'Diterima',           value: `${diterima} PO`,                          icon: PackageCheck,  accent: 'text-chart-3',    glow: 'bg-chart-3/10'    },
]

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function PurchaseOrderPage() {
  return (
    <>
      {/* Topbar */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Purchase Order</h1>
          <p className="text-xs text-muted-foreground">Kelola pengadaan barang ke supplier</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PlusCircle className="size-4" />
          Buat PO Baru
        </button>
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

        {/* Nilai total banner */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5 shadow-xs">
          <p className="text-sm text-muted-foreground">Total nilai pengadaan bulan ini</p>
          <p className="text-lg font-semibold text-primary">{formatRupiah(nilaiTotal)}</p>
        </div>

        {/* PO Table */}
        <POTable />

      </main>
    </>
  )
}
