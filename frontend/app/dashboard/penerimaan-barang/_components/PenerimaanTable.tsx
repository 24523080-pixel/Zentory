'use client'

import { useState, useMemo, Fragment, useCallback, useEffect } from 'react'
import {
  Search, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, X, ScanBarcode,
  Plus, Minus, PackageCheck, Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

type StatusPenerimaan = 'Menunggu' | 'Diterima' | 'Ada Selisih'
interface ItemPenerimaan { sku: string; productName: string; qtyPO: number; qtyDiterima: number }
interface Penerimaan {
  id: string; noPenerimaan: string; noPO: string; supplier: string
  tanggal: string; status: string; catatan?: string | null; items: ItemPenerimaan[]
}

const STATUS_BADGE: Record<string, string> = {
  Menunggu:     'bg-muted text-muted-foreground',
  Diterima:     'bg-chart-3/15 text-chart-3',
  'Ada Selisih':'bg-destructive/15 text-destructive',
}

const TABS = ['Semua', 'Menunggu', 'Diterima', 'Ada Selisih'] as const
const PAGE_SIZE = 5

const SUPPLIERS = ['Supplier Maju Jaya', 'Sumber Makmur Dist.', 'Cahaya Ritel Indo', 'Indo Distributor']

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface ItemRow extends ItemPenerimaan { _key: number }

function emptyItemRow(key: number): ItemRow {
  return { _key: key, sku: '', productName: '', qtyPO: 0, qtyDiterima: 0 }
}

export function PenerimaanTable() {
  const [list, setList]         = useState<Penerimaan[]>([])
  const [loading, setLoading]   = useState(true)

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/penerimaan')
      if (res.ok) setList(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadList() }, [loadList])
  const [query, setQuery]       = useState('')
  const [tab, setTab]           = useState('Semua')
  const [page, setPage]         = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saved, setSaved]       = useState(false)

  // Form state
  const [formNoPO, setFormNoPO]       = useState('')
  const [formSupplier, setFormSupplier] = useState('')
  const [formCatatan, setFormCatatan] = useState('')
  const [formItems, setFormItems]     = useState<ItemRow[]>([emptyItemRow(1)])
  const [keyCounter, setKeyCounter]   = useState(10)
  const [errors, setErrors]           = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return list.filter((p) => {
      const matchQuery = !q ||
        p.noPenerimaan.toLowerCase().includes(q) ||
        p.noPO.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q)
      const matchTab = tab === 'Semua' || p.status === tab
      return matchQuery && matchTab
    })
  }, [list, query, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeTab(t: string) { setTab(t); setPage(1); setExpanded(null) }
  function toggleExpand(id: string) { setExpanded((prev) => (prev === id ? null : id)) }

  function openModal() {
    setFormNoPO('')
    setFormSupplier('')
    setFormCatatan('')
    setFormItems([emptyItemRow(Date.now())])
    setErrors({})
    setSaved(false)
    setModalOpen(true)
  }

  function addItemRow() {
    const key = keyCounter + 1
    setKeyCounter(key)
    setFormItems(f => [...f, emptyItemRow(key)])
  }

  function removeItemRow(key: number) {
    setFormItems(f => f.filter(i => i._key !== key))
  }

  function updateItemRow(key: number, field: keyof ItemPenerimaan, value: string | number) {
    setFormItems(f => f.map(i => i._key === key ? { ...i, [field]: value } : i))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!formNoPO.trim())      e.noPO     = 'No. PO wajib diisi'
    if (!formSupplier.trim())  e.supplier = 'Supplier wajib diisi'
    if (formItems.length === 0) e.items   = 'Minimal 1 item'
    formItems.forEach((item, idx) => {
      if (!item.sku.trim())         e[`item_${idx}_sku`]  = 'SKU wajib diisi'
      if (!item.productName.trim()) e[`item_${idx}_name`] = 'Nama wajib diisi'
      if (item.qtyPO <= 0)          e[`item_${idx}_qpo`]  = 'Qty PO harus > 0'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function computeStatus(items: ItemPenerimaan[]): StatusPenerimaan {
    const hasDiterima = items.some(i => i.qtyDiterima > 0)
    if (!hasDiterima) return 'Menunggu'
    const hasSelisih  = items.some(i => i.qtyDiterima < i.qtyPO)
    return hasSelisih ? 'Ada Selisih' : 'Diterima'
  }

  async function handleSubmit() {
    if (!validate()) return
    const items = formItems.map(({ _key, ...rest }) => ({
      ...rest,
      qtyPO:       Number(rest.qtyPO),
      qtyDiterima: Number(rest.qtyDiterima),
    }))
    const res = await fetch('/api/penerimaan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noPO: formNoPO.trim(), supplier: formSupplier.trim(),
        catatan: formCatatan.trim() || null, items,
      }),
    })
    if (res.ok) {
      const created: Penerimaan = await res.json()
      setList(prev => [created, ...prev])
      setSaved(true)
      setTimeout(() => setModalOpen(false), 900)
    }
  }

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
              onClick={openModal}
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Tidak ada data penerimaan yang cocok.
                  </td>
                </tr>
              ) : paginated.map((p) => (
                <Fragment key={p.id}>
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

      {/* ── Modal Catat Penerimaan Baru ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold">Catat Penerimaan Baru</h2>
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

            <div className="space-y-5 p-6">
              {/* No PO + Supplier */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">No. Purchase Order *</label>
                  <Input
                    value={formNoPO}
                    onChange={(e) => setFormNoPO(e.target.value)}
                    placeholder="Contoh: PO-2026-042"
                    className={`font-mono h-9 ${errors.noPO ? 'border-destructive' : ''}`}
                  />
                  {errors.noPO && <p className="text-xs text-destructive">{errors.noPO}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Supplier *</label>
                  <Input
                    list="supplier-pen-list"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="Nama supplier"
                    className={`h-9 ${errors.supplier ? 'border-destructive' : ''}`}
                  />
                  <datalist id="supplier-pen-list">
                    {SUPPLIERS.map(s => <option key={s} value={s} />)}
                  </datalist>
                  {errors.supplier && <p className="text-xs text-destructive">{errors.supplier}</p>}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Daftar Item *</label>
                  {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
                </div>

                <div className="grid grid-cols-[1fr_120px_90px_90px_28px] gap-2 px-1">
                  {['Nama Produk', 'SKU', 'Qty PO', 'Qty Terima', ''].map(h => (
                    <span key={h} className="text-[11px] font-medium text-muted-foreground">{h}</span>
                  ))}
                </div>

                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={item._key} className="grid grid-cols-[1fr_120px_90px_90px_28px] gap-2 items-start">
                      <Input
                        value={item.productName}
                        onChange={(e) => updateItemRow(item._key, 'productName', e.target.value)}
                        placeholder="cth: Kopi Arabica 250g"
                        className={`h-8 text-xs ${errors[`item_${idx}_name`] ? 'border-destructive' : ''}`}
                      />
                      <Input
                        value={item.sku}
                        onChange={(e) => updateItemRow(item._key, 'sku', e.target.value.toUpperCase())}
                        placeholder="KOP-ARB-250"
                        className={`h-8 font-mono text-xs ${errors[`item_${idx}_sku`] ? 'border-destructive' : ''}`}
                      />
                      <Input
                        type="number" min="1"
                        value={item.qtyPO || ''}
                        onChange={(e) => updateItemRow(item._key, 'qtyPO', Number(e.target.value))}
                        placeholder="0"
                        className={`h-8 text-xs text-right ${errors[`item_${idx}_qpo`] ? 'border-destructive' : ''}`}
                      />
                      <Input
                        type="number" min="0"
                        value={item.qtyDiterima || ''}
                        onChange={(e) => updateItemRow(item._key, 'qtyDiterima', Number(e.target.value))}
                        placeholder="0"
                        className="h-8 text-xs text-right"
                      />
                      <button
                        type="button"
                        onClick={() => removeItemRow(item._key)}
                        disabled={formItems.length === 1}
                        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                      >
                        <Minus className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Plus className="size-3.5" /> Tambah Item
                </button>
              </div>

              {/* Catatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Catatan <span className="text-muted-foreground/60">(opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Contoh: 2 karton rusak, dikembalikan ke driver..."
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Status akan ditentukan otomatis dari qty yang diterima
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {saved
                    ? <><PackageCheck className="size-4" /> Tersimpan!</>
                    : <><ScanBarcode className="size-4" /> Simpan Penerimaan</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
