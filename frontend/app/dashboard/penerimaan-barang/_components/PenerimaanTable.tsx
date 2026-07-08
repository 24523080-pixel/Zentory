'use client'

import { useState, useMemo, Fragment, useCallback, useEffect, useRef } from 'react'
import {
  Search, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, X, ScanBarcode,
  PackageCheck, Loader2, CheckCircle2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

type StatusPenerimaan = 'Menunggu' | 'Diterima' | 'Ada Selisih'
interface ItemPenerimaan { sku: string; productName: string; qtyPO: number; qtyDiterima: number }
interface Penerimaan {
  id: string; noPenerimaan: string; noPO: string; supplier: string
  tanggal: string; status: string; catatan?: string | null; items: ItemPenerimaan[]
}
interface POOption {
  id: string; noPO: string; supplier: string
  items: { sku: string; productName: string; qty: number; hargaSatuan: number }[]
}

const STATUS_BADGE: Record<string, string> = {
  Menunggu:     'bg-muted text-muted-foreground',
  Diterima:     'bg-chart-3/15 text-chart-3',
  'Ada Selisih':'bg-destructive/15 text-destructive',
}

const TABS = ['Semua', 'Menunggu', 'Diterima', 'Ada Selisih'] as const
const PAGE_SIZE = 5

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface ItemRow extends ItemPenerimaan { _key: number }

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
  const [saving, setSaving]     = useState(false)

  // PO autocomplete
  const [availablePOs, setAvailablePOs] = useState<POOption[]>([])
  const [selectedPO, setSelectedPO]     = useState<POOption | null>(null)
  const [poSearch, setPoSearch]         = useState('')
  const [poDropOpen, setPoDropOpen]     = useState(false)
  const poDropRef = useRef<HTMLDivElement>(null)

  // Form state — hanya catatan & qty diterima per item
  const [formCatatan, setFormCatatan] = useState('')
  const [formItems, setFormItems]     = useState<ItemRow[]>([])
  const [errors, setErrors]           = useState<Record<string, string>>({})

  // Load POs dengan status Dikirim untuk autocomplete
  useEffect(() => {
    fetch('/api/purchase-orders')
      .then(r => r.ok ? r.json() : [])
      .then((pos: POOption[]) => setAvailablePOs(pos.filter((p: any) => p.status === 'Dikirim')))
      .catch(() => {})
  }, [])

  // Tutup dropdown PO saat klik di luar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (poDropRef.current && !poDropRef.current.contains(e.target as Node)) {
        setPoDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const poSuggestions = useMemo(() => {
    if (!poSearch.trim()) return availablePOs.slice(0, 8)
    const q = poSearch.toLowerCase()
    return availablePOs.filter(p =>
      p.noPO.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [availablePOs, poSearch])

  function selectPO(po: POOption) {
    setSelectedPO(po)
    setPoSearch(po.noPO)
    setPoDropOpen(false)
    setErrors({})
    setFormItems(po.items.map((item, i) => ({
      _key:        i + 1,
      sku:         item.sku,
      productName: item.productName,
      qtyPO:       item.qty,
      qtyDiterima: 0,
    })))
  }

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
    setSelectedPO(null)
    setPoSearch('')
    setPoDropOpen(false)
    setFormCatatan('')
    setFormItems([])
    setErrors({})
    setSaved(false)
    setSaving(false)
    setModalOpen(true)
  }

  function updateQtyDiterima(key: number, value: number) {
    setFormItems(f => f.map(i => i._key === key ? { ...i, qtyDiterima: value } : i))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!selectedPO) e.noPO = 'Pilih No. Purchase Order terlebih dahulu'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate() || !selectedPO) return
    setSaving(true)
    const items = formItems.map(({ _key, ...rest }) => ({
      ...rest,
      qtyPO:       Number(rest.qtyPO),
      qtyDiterima: Number(rest.qtyDiterima),
    }))
    const res = await fetch('/api/penerimaan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noPO:     selectedPO.noPO,
        supplier: selectedPO.supplier,
        catatan:  formCatatan.trim() || null,
        items,
      }),
    })
    if (res.ok) {
      const created: Penerimaan = await res.json()
      setList(prev => [created, ...prev])
      setSaved(true)
      setTimeout(() => setModalOpen(false), 900)
    }
    setSaving(false)
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

              {/* No. PO — dropdown autocomplete */}
              <div className="space-y-1.5" ref={poDropRef}>
                <label className="text-xs font-medium text-muted-foreground">No. Purchase Order *</label>
                <div className="relative">
                  {selectedPO ? (
                    /* PO sudah dipilih — tampilkan chip */
                    <div className="flex items-center gap-2 rounded-lg border border-chart-3/40 bg-chart-3/5 px-3 py-2">
                      <CheckCircle2 className="size-4 shrink-0 text-chart-3" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-semibold">{selectedPO.noPO}</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedPO.supplier} · {selectedPO.items.length} item</p>
                      </div>
                      <button type="button" onClick={() => { setSelectedPO(null); setPoSearch(''); setFormItems([]) }}
                        className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Input
                        value={poSearch}
                        onChange={e => { setPoSearch(e.target.value); setPoDropOpen(true) }}
                        onFocus={() => setPoDropOpen(true)}
                        placeholder="Ketik No. PO atau nama supplier…"
                        className={`font-mono h-9 ${errors.noPO ? 'border-destructive' : ''}`}
                      />
                      {poDropOpen && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                          {poSuggestions.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-muted-foreground">
                              Tidak ada PO dengan status Dikirim yang cocok.
                            </p>
                          ) : poSuggestions.map(po => (
                            <button key={po.id} type="button"
                              onMouseDown={() => selectPO(po)}
                              className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-0">
                              <div>
                                <p className="font-mono text-sm font-medium">{po.noPO}</p>
                                <p className="text-xs text-muted-foreground">{po.supplier}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{po.items.length} item</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {errors.noPO && <p className="text-xs text-destructive">{errors.noPO}</p>}
              </div>

              {/* Daftar item — auto-fill dari PO, hanya qty diterima yang bisa diubah */}
              {selectedPO && formItems.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Daftar Item dari PO</label>

                  <div className="grid grid-cols-[1fr_100px_90px_90px] gap-2 px-1">
                    {['Nama Produk', 'SKU', 'Qty PO', 'Qty Diterima'].map(h => (
                      <span key={h} className="text-[11px] font-medium text-muted-foreground">{h}</span>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    {formItems.map((item) => (
                      <div key={item._key} className="grid grid-cols-[1fr_100px_90px_90px] gap-2 items-center">
                        <div className="rounded-md bg-muted/50 px-3 py-1.5 text-xs font-medium truncate">
                          {item.productName}
                        </div>
                        <div className="rounded-md bg-muted/50 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                          {item.sku}
                        </div>
                        <div className="rounded-md bg-muted/50 px-3 py-1.5 text-xs text-right tabular-nums text-muted-foreground">
                          {item.qtyPO}
                        </div>
                        <Input
                          type="number" min="0" max={item.qtyPO}
                          value={item.qtyDiterima || ''}
                          onChange={e => updateQtyDiterima(item._key, Number(e.target.value))}
                          placeholder="0"
                          className="h-8 text-xs text-right"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Placeholder sebelum PO dipilih */}
              {!selectedPO && (
                <div className="rounded-lg border border-dashed border-border py-8 text-center">
                  <ScanBarcode className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">Pilih No. PO di atas untuk memuat daftar item</p>
                </div>
              )}

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
                Status ditentukan otomatis dari qty yang diterima
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
                  Batal
                </button>
                <button type="button" onClick={handleSubmit} disabled={!selectedPO || saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {saved
                    ? <><PackageCheck className="size-4" /> Tersimpan!</>
                    : saving
                      ? <><Loader2 className="size-4 animate-spin" /> Menyimpan…</>
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
