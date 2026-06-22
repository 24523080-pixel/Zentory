'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PURCHASE_ORDERS, totalNilai, type POStatus } from '../_data'

const STATUS_BADGE: Record<POStatus, string> = {
  Draft:       'bg-muted text-muted-foreground',
  Dikirim:     'bg-primary/10 text-primary',
  Diterima:    'bg-chart-3/15 text-chart-3',
  Dibatalkan:  'bg-destructive/15 text-destructive',
}

const TABS = ['Semua', 'Draft', 'Dikirim', 'Diterima', 'Dibatalkan'] as const
const PAGE_SIZE = 6

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function POTable() {
  const [query, setQuery] = useState('')
  const [tab, setTab]     = useState('Semua')
  const [page, setPage]   = useState(1)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return PURCHASE_ORDERS.filter((po) => {
      const matchQuery = !q ||
        po.noPO.toLowerCase().includes(q) ||
        po.supplier.toLowerCase().includes(q)
      const matchTab = tab === 'Semua' || po.status === tab
      return matchQuery && matchTab
    })
  }, [query, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeTab(t: string) { setTab(t); setPage(1) }

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs">

      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari No. PO atau supplier…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="h-9 pl-8"
          />
        </div>
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">No. PO</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Jml. Item</th>
              <th className="px-4 py-3 font-medium">Total Nilai</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium sr-only">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Tidak ada PO yang cocok.
                </td>
              </tr>
            ) : paginated.map((po) => (
              <tr key={po.id} className="bg-card transition-colors hover:bg-muted/30">
                <td className="px-4 py-3.5 font-mono text-xs font-medium text-foreground">
                  {po.noPO}
                </td>
                <td className="px-4 py-3.5 font-medium">{po.supplier}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{formatTanggal(po.tanggal)}</td>
                <td className="px-4 py-3.5 tabular-nums">{po.items.length} item</td>
                <td className="px-4 py-3.5 tabular-nums font-medium">{formatRupiah(totalNilai(po))}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[po.status]}`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <a
                    href={`/dashboard/purchase-order/${po.id}`}
                    aria-label={`Lihat detail ${po.noPO}`}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Eye className="size-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length} PO · halaman {page} dari {totalPages}
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
  )
}
