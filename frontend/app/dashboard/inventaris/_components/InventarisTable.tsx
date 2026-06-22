'use client'

import { useState, useMemo } from 'react'
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PRODUCTS, type Status, type Klasifikasi } from '../_data'

const STATUS_BADGE: Record<Status, string> = {
  Tersedia: 'bg-chart-3/15 text-chart-3',
  Reorder:  'bg-chart-4/15 text-chart-4',
  Kritis:   'bg-destructive/15 text-destructive',
}

const KLASIFIKASI_BADGE: Record<Klasifikasi, string> = {
  Fast: 'bg-primary/10 text-primary',
  Slow: 'bg-chart-4/10 text-chart-4',
  Dead: 'bg-muted text-muted-foreground',
}

const TABS = ['Semua', 'Fast', 'Slow', 'Dead', 'Kritis'] as const
const PAGE_SIZE = 8

export function InventarisTable() {
  const [query, setQuery]   = useState('')
  const [tab, setTab]       = useState('Semua')
  const [page, setPage]     = useState(1)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return PRODUCTS.filter((p) => {
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      const matchTab   = tab === 'Semua' || p.klasifikasi === tab || p.status === tab
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
            placeholder="Cari produk atau SKU…"
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
              <th className="px-4 py-3 font-medium">Produk</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Stok</th>
              <th className="px-4 py-3 font-medium">ROP</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Klasifikasi</th>
              <th className="px-4 py-3 font-medium sr-only">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Tidak ada produk yang cocok dengan filter ini.
                </td>
              </tr>
            ) : paginated.map((row) => (
              <tr key={row.id} className="bg-card transition-colors hover:bg-muted/30">
                <td className="px-4 py-3.5">
                  <p className="font-medium">{row.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{row.sku}</p>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{row.kategori}</td>
                <td className="px-4 py-3.5 tabular-nums font-medium">{row.stok}</td>
                <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{row.rop}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${KLASIFIKASI_BADGE[row.klasifikasi]}`}>
                    {row.klasifikasi}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${row.name}`}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus ${row.name}`}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length} produk · halaman {page} dari {totalPages}
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
