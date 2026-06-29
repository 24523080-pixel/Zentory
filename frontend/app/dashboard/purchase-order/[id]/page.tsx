import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, Calendar, Hash } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PrintButton } from './_components/PrintButton'
import { EmailModal } from './_components/EmailModal'

type POStatus = 'Draft' | 'Dikirim' | 'Diterima' | 'Dibatalkan'

const STATUS_BADGE: Record<POStatus, string> = {
  Draft:      'bg-muted text-muted-foreground',
  Dikirim:    'bg-primary/10 text-primary',
  Diterima:   'bg-chart-3/15 text-chart-3',
  Dibatalkan: 'bg-destructive/15 text-destructive',
}

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function totalNilai(items: { qty: number; hargaSatuan: number }[]) {
  return items.reduce((s, i) => s + i.qty * i.hargaSatuan, 0)
}

export default async function PODetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const raw = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!raw) notFound()

  const po = {
    id:       raw.id,
    noPO:     raw.noPO,
    supplier: raw.supplier,
    tanggal:  raw.tanggal.toISOString(),
    status:   raw.status as POStatus,
    items:    raw.items.map((i) => ({
      productName: i.productName,
      sku:         i.sku,
      qty:         i.qty,
      hargaSatuan: i.hargaSatuan,
    })),
  }

  const total = totalNilai(po)

  return (
    <>
      {/* Topbar — disembunyikan saat print */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 print:hidden">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard/purchase-order"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Kembali"
          >
            <ArrowLeft className="size-4" />
          </a>
          <div>
            <h1 className="text-base font-semibold">{po.noPO}</h1>
            <p className="text-xs text-muted-foreground">Detail Purchase Order</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EmailModal po={po} />
          <PrintButton />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 print:p-0">
        <div className="mx-auto max-w-3xl space-y-4">

          {/* Header kartu PO */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs print:rounded-none print:border-0 print:shadow-none">

            {/* Print-only: logo & judul */}
            <div className="mb-6 hidden print:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Zentory — Smart Inventory Management
              </p>
              <h1 className="mt-1 text-2xl font-bold">Purchase Order</h1>
              <div className="mt-3 border-t border-border" />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Info PO */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm">
                  <Hash className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-mono font-semibold text-foreground">{po.noPO}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{po.supplier}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{formatTanggal(po.tanggal)}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE[po.status]}`}>
                  {po.status}
                </span>
                <p className="text-xs text-muted-foreground">{po.items.length} jenis produk</p>
              </div>
            </div>
          </div>

          {/* Tabel item */}
          <div className="rounded-xl border border-border bg-card shadow-xs print:rounded-none print:border-x-0 print:shadow-none">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Daftar Item</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Produk</th>
                    <th className="px-5 py-3 font-medium">SKU</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                    <th className="px-5 py-3 font-medium text-right">Harga Satuan</th>
                    <th className="px-5 py-3 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {po.items.map((item, i) => (
                    <tr key={i} className="bg-card">
                      <td className="px-5 py-3.5 font-medium">{item.productName}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{item.sku}</td>
                      <td className="px-5 py-3.5 tabular-nums text-right">{item.qty}</td>
                      <td className="px-5 py-3.5 tabular-nums text-right text-muted-foreground">
                        {formatRupiah(item.hargaSatuan)}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-right font-medium">
                        {formatRupiah(item.qty * item.hargaSatuan)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td colSpan={4} className="px-5 py-4 text-right text-sm font-semibold">
                      Total Nilai PO
                    </td>
                    <td className="px-5 py-4 text-right text-base font-bold text-primary">
                      {formatRupiah(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Catatan & tanda tangan — hanya di print */}
          <div className="hidden print:block">
            <div className="mt-8 grid grid-cols-2 gap-16">
              {['Dibuat oleh', 'Disetujui oleh'].map((label) => (
                <div key={label} className="text-sm">
                  <p className="font-medium">{label}</p>
                  <div className="mt-12 border-t border-foreground pt-1">
                    <p className="text-xs text-muted-foreground">(tanda tangan & nama terang)</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[10px] text-muted-foreground">
              Dicetak dari sistem Zentory · {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

        </div>
      </main>
    </>
  )
}
