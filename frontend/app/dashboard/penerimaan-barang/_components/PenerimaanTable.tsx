'use client'

import { useState, useMemo, Fragment } from 'react'
import {
  Search, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, X, ScanBarcode,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PENERIMAAN_LIST, type StatusPenerimaan } from '../_data'

const STATUS_BADGE: Record<StatusPenerimaan, string> = {
  Menunggu:     'bg-muted text-muted-foreground',
  Diterima:     'bg-chart-3/15 text-chart-3',
  'Ada Selisih':'bg-destructive/15 text-destructive',
}

const TABS = ['Semua', 'Menunggu', 'Diterima', 'Ada Selisih'] as const
const PAGE_SIZE = 5

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function PenerimaanTable() {
  const [query, setQuery]       = useState('')
  const [tab, setTab]           = useState('Semua')
  const [page, setPage]         = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return PENERIMAAN_LIST.filter((p) => {
      const matchQuery = !q ||
        p.noPenerimaan.toLowerCase().includes(q) ||
        p.noPO.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q)
      const matchTab = tab === 'Semua' || p.status === tab
      return matchQuery && matchTab
    })
  }, [query, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeTab(t: string) { setTab(t); setPage(1); setExpanded(null) }
  function toggleExpand(id: string) { setExpanded((prev) => (prev === id ? null : id)) }

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-xs">

        {/* Controls */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari no. penerimaan, PO, atau supplier…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              className="h-9 pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => changeTab(t)}
                  className={
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ' +
                    (tab === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground')
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ScanBarcode className="size-3.5" />
              Catat Penerimaan
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="w-8 px-4 py-3" />
                <th className="px-4 py-3 font-medium">No. Penerimaan</th>
                <th className="px-4 py-3 font-medium">No. PO</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Tidak ada data penerimaan yang cocok.
                  </td>
                </tr>
              ) : paginated.map((p) => (
                <Fragment key={p.id}>
                  {/* Main row */}
                  <tr
                    className="cursor-pointer bg-card transition-colors hover:bg-muted/30"
                    onClick={() => toggleExpand(p.id)}
                  >
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {expanded === p.id
                        ? <ChevronUp className="size-3.5" />
                        : <ChevronDown className="size-3.5" />
                      }
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-medium">{p.noPenerimaan}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{p.noPO}</td>
                    <td className="px-4 py-3.5 font-medium">{p.supplier}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{formatTanggal(p.tanggal)}</td>
                    <td className="px-4 py-3.5 tabular-nums">{p.items.length} item</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded detail */}
                  {expanded === p.id && (
                    <tr key={`${p.id}-detail`} className="bg-muted/20">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted-foreground">
                                <th className="pb-2 text-left font-medium">Produk</th>
                                <th className="pb-2 text-left font-medium">SKU</th>
                                <th className="pb-2 text-right font-medium">Qty PO</th>
                                <th className="pb-2 text-right font-medium">Qty Diterima</th>
                                <th className="pb-2 text-right font-medium">Selisih</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {p.items.map((item) => {
                                const selisih = item.qtyDiterima - item.qtyPO
                                return (
                                  <tr key={item.sku}>
                                    <td className="py-2 font-medium text-foreground">{item.productName}</td>
                                    <td className="py-2 font-mono text-muted-foreground">{item.sku}</td>
                                    <td className="py-2 text-right tabular-nums">{item.qtyPO}</td>
                                    <td className="py-2 text-right tabular-nums">{item.qtyDiterima === 0 ? '—' : item.qtyDiterima}</td>
                                    <td className={`py-2 text-right tabular-nums font-medium ${
                                      selisih < 0 ? 'text-destructive' :
                                      selisih > 0 ? 'text-chart-3' :
                                      'text-muted-foreground'
                                    }`}>
                                      {item.qtyDiterima === 0 ? '—' : selisih === 0 ? '✓' : selisih > 0 ? `+${selisih}` : selisih}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                          {p.catatan && (
                            <p className="rounded-lg border border-chart-4/20 bg-chart-4/5 px-3 py-2 text-xs text-muted-foreground">
                              <span className="font-medium text-chart-4">Catatan:</span> {p.catatan}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {filtered.length} penerimaan · halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Catat Penerimaan Baru */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Catat Penerimaan Baru</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Input barang yang baru tiba dari supplier</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setModalOpen(false) }}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">No. Purchase Order</label>
                <Input placeholder="Contoh: PO-2026-042" className="h-9" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Scan / Input SKU Barang</label>
                <div className="relative">
                  <ScanBarcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Scan barcode atau ketik SKU manual…" className="h-9 pl-9" />
                </div>
                <p className="text-[11px] text-muted-foreground">Tekan Enter untuk menambah item ke daftar</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground text-center">
                Item yang di-scan akan muncul di sini
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Catatan <span className="text-muted-foreground">(opsional)</span></label>
                <textarea
                  rows={2}
                  placeholder="Contoh: 2 karton rusak, dikembalikan ke driver..."
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Simpan Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
