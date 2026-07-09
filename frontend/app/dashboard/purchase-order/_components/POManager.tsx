'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  ClipboardList, Clock, PackageCheck, XCircle, PlusCircle,
  Search, Eye, Trash2, X, Save, Check, Plus, Minus,
  ChevronLeft, ChevronRight, SendHorizonal, PackageOpen, Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
type POStatus = 'Draft' | 'Dikirim' | 'Diterima' | 'Dibatalkan'
interface POItem { productName: string; sku: string; qty: number; hargaSatuan: number }
interface PurchaseOrder {
  id: string; noPO: string; supplier: string; tanggal: string; status: POStatus; items: POItem[]
}
function totalNilai(po: PurchaseOrder) {
  return po.items.reduce((s, i) => s + i.qty * i.hargaSatuan, 0)
}

// ── Constants ─────────────────────────────────────────────────
const SUPPLIERS = ['Supplier Maju Jaya', 'Sumber Makmur Dist.', 'Cahaya Ritel Indo', 'Indo Distributor']
const TABS      = ['Semua', 'Draft', 'Dikirim', 'Diterima', 'Dibatalkan'] as const
const PAGE_SIZE = 6

const STATUS_BADGE: Record<POStatus, string> = {
  Draft:      'bg-muted text-muted-foreground',
  Dikirim:    'bg-primary/10 text-primary',
  Diterima:   'bg-chart-3/15 text-chart-3',
  Dibatalkan: 'bg-destructive/15 text-destructive',
}

function formatRupiah(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }
function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
function today() { return new Date().toISOString().slice(0, 10) }

// ── Types ─────────────────────────────────────────────────────
type ModalState =
  | { type: 'create' }
  | { type: 'delete'; po: PurchaseOrder }
  | null

interface ItemRow extends POItem { _key: number }

interface FormData {
  supplier: string
  tanggal:  string
  items:    ItemRow[]
}

function emptyItem(key: number): ItemRow {
  return { _key: key, productName: '', sku: '', qty: 1, hargaSatuan: 0 }
}

function newForm(): FormData {
  return { supplier: '', tanggal: today(), items: [emptyItem(Date.now())] }
}

// ── Sub-components ─────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ── Product type for autocomplete ──────────────────────────────
interface ProductOption { id: string; sku: string; name: string; hargaBeli: number }

// ── Main export ────────────────────────────────────────────────
export function POManager({ role = 'admin' }: { role?: string }) {
  const isManager = role === 'manager'
  const isAdmin   = role === 'admin'

  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState<ModalState>(null)
  const [form, setForm]     = useState<FormData>(newForm())
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [conflicts, setConflicts] = useState<{ sku: string; namaKatalog: string; namaPO: string }[]>([])
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [query, setQuery]   = useState('')
  const [tab, setTab]       = useState('Semua')
  const [page, setPage]     = useState(1)
  const [keyCounter, setKeyCounter] = useState(1000)

  // SKU autocomplete
  const [products, setProducts]         = useState<ProductOption[]>([])
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [lockedKeys, setLockedKeys]     = useState<Set<number>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/purchase-orders')
      if (res.ok) setOrders(await res.json())
      else console.error('GET /api/purchase-orders failed:', res.status, await res.text())
    } catch (err) {
      console.error('loadOrders error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  // Load products for SKU autocomplete
  useEffect(() => {
    fetch('/api/products').then(r => r.ok ? r.json() : []).then(setProducts).catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Summary ──────────────────────────────────────────────────
  const total      = orders.length
  const draft      = orders.filter(p => p.status === 'Draft').length
  const dikirim    = orders.filter(p => p.status === 'Dikirim').length
  const diterima   = orders.filter(p => p.status === 'Diterima').length
  const nilaiTotal = orders.filter(p => p.status !== 'Dibatalkan').reduce((s, p) => s + totalNilai(p), 0)

  const SUMMARY = [
    { label: 'Total PO',           value: String(total),            icon: ClipboardList, accent: 'text-primary',           glow: 'bg-primary/10'    },
    { label: 'Draft',              value: `${draft} PO`,            icon: ClipboardList, accent: 'text-muted-foreground',  glow: 'bg-muted'         },
    { label: 'Menunggu Konfirmasi',value: `${dikirim} PO`,          icon: Clock,         accent: 'text-chart-4',           glow: 'bg-chart-4/10'    },
    { label: 'Diterima',           value: `${diterima} PO`,         icon: PackageCheck,  accent: 'text-chart-3',           glow: 'bg-chart-3/10'    },
  ]

  // ── Filter & paginate ─────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return orders.filter(po => {
      const matchQ   = !q || po.noPO.toLowerCase().includes(q) || po.supplier.toLowerCase().includes(q)
      const matchTab = tab === 'Semua' || po.status === tab
      return matchQ && matchTab
    })
  }, [orders, query, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  function changeTab(t: string) { setTab(t); setPage(1) }

  // ── Modal helpers ─────────────────────────────────────────────
  function openCreate() {
    setForm(newForm())
    setErrors({})
    setConflicts([])
    setSaved(false)
    setLockedKeys(new Set())
    setOpenDropdown(null)
    setModal({ type: 'create' })
  }
  function openDelete(po: PurchaseOrder) { setModal({ type: 'delete', po }) }
  function closeModal() { setModal(null); setSaved(false); setLockedKeys(new Set()) }

  // ── SKU autocomplete ──────────────────────────────────────────
  function getSuggestions(skuInput: string): ProductOption[] {
    if (!skuInput.trim()) return products.slice(0, 8)
    const q = skuInput.toLowerCase()
    return products.filter(p =>
      p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    ).slice(0, 8)
  }

  function selectProduct(key: number, product: ProductOption) {
    setForm(f => ({
      ...f,
      items: f.items.map(i => i._key === key
        ? { ...i, sku: product.sku, productName: product.name, hargaSatuan: product.hargaBeli }
        : i
      ),
    }))
    setLockedKeys(prev => new Set([...prev, key]))
    setOpenDropdown(null)
  }

  function unlockItem(key: number) {
    setLockedKeys(prev => { const s = new Set(prev); s.delete(key); return s })
    setForm(f => ({
      ...f,
      items: f.items.map(i => i._key === key
        ? { ...i, sku: '', productName: '', hargaSatuan: 0 }
        : i
      ),
    }))
  }

  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  // ── Item row helpers ──────────────────────────────────────────
  function addItem() {
    const key = keyCounter + 1
    setKeyCounter(key)
    setForm(f => ({ ...f, items: [...f.items, emptyItem(key)] }))
  }
  function removeItem(key: number) {
    setForm(f => ({ ...f, items: f.items.filter(i => i._key !== key) }))
  }
  function updateItem(key: number, field: keyof POItem, value: string | number) {
    setForm(f => ({
      ...f,
      items: f.items.map(i => i._key === key ? { ...i, [field]: value } : i),
    }))
  }

  // ── Validation ────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.supplier.trim()) e.supplier = 'Supplier wajib diisi'
    if (!form.tanggal)         e.tanggal  = 'Tanggal wajib diisi'
    if (form.items.length === 0) e.items  = 'Minimal 1 item produk'
    form.items.forEach((item, idx) => {
      if (!item.productName.trim()) e[`item_${idx}_name`] = 'Nama produk wajib diisi'
      if (!item.sku.trim())         e[`item_${idx}_sku`]  = 'SKU wajib diisi'
      if (item.qty <= 0)            e[`item_${idx}_qty`]  = 'Qty harus > 0'
      if (item.hargaSatuan <= 0)    e[`item_${idx}_harga`]= 'Harga harus > 0'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Create PO ─────────────────────────────────────────────────
  async function handleCreate() {
    if (!validate()) return
    setConflicts([])
    setSaving(true)
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier: form.supplier.trim(),
          tanggal:  form.tanggal,
          items:    form.items.map(({ _key, ...rest }) => rest),
        }),
      })
      if (res.status === 409) {
        const data = await res.json()
        setConflicts(data.conflicts ?? [])
      } else if (res.ok) {
        const created: PurchaseOrder = await res.json()
        setOrders(prev => [created, ...prev])
        setSaved(true)
        setTimeout(closeModal, 900)
      } else {
        const err = await res.text()
        console.error('POST /api/purchase-orders failed:', res.status, err)
        alert(`Gagal menyimpan PO (${res.status}): ${err}`)
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Status transitions ────────────────────────────────────────
  async function updateStatus(id: string, status: POStatus) {
    const res = await fetch(`/api/purchase-orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated: PurchaseOrder = await res.json()
      setOrders(prev => prev.map(po => po.id === id ? updated : po))
    }
  }
  const kirimPO    = (id: string) => updateStatus(id, 'Dikirim')
  const terimaPO   = (id: string) => updateStatus(id, 'Diterima')
  const batalkanPO = (id: string) => updateStatus(id, 'Dibatalkan')

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    if (modal?.type !== 'delete') return
    const res = await fetch(`/api/purchase-orders/${modal.po.id}`, { method: 'DELETE' })
    if (res.ok) {
      setOrders(prev => prev.filter(po => po.id !== modal.po.id))
      closeModal()
    }
  }

  // ── Form total ────────────────────────────────────────────────
  const formTotal = form.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.hargaSatuan) || 0), 0)

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-white to-card p-4 shadow-xs">
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
        <p className="text-sm text-muted-foreground">Total nilai pengadaan</p>
        <p className="text-lg font-semibold text-primary">{formatRupiah(nilaiTotal)}</p>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-card shadow-xs">

        {/* Controls */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari No. PO atau supplier…" value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              className="h-9 pl-8" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map(t => (
                <button key={t} type="button" onClick={() => changeTab(t)}
                  className={
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ' +
                    (tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground')
                  }>{t}</button>
              ))}
            </div>
            {(isAdmin || isManager) && (
              <button type="button" onClick={openCreate}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <PlusCircle className="size-3.5" /> Buat PO
              </button>
            )}
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
              ) : loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : paginated.map(po => (
                <tr key={po.id} className="bg-card transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3.5 font-mono text-xs font-medium">{po.noPO}</td>
                  <td className="px-4 py-3.5 font-medium">{po.supplier}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{formatTanggal(po.tanggal)}</td>
                  <td className="px-4 py-3.5 tabular-nums">{po.items.length} item</td>
                  <td className="px-4 py-3.5 tabular-nums font-medium">{formatRupiah(totalNilai(po))}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[po.status]}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {/* View detail */}
                      <a href={`/dashboard/purchase-order/${po.id}`} aria-label={`Lihat ${po.noPO}`}
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Eye className="size-3.5" />
                      </a>
                      {/* Draft: Manager setujui & kirim, Admin/Manager hapus */}
                      {po.status === 'Draft' && (
                        <>
                          {isManager && (
                            <button type="button" onClick={() => kirimPO(po.id)} title="Setujui & Kirim ke Supplier"
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                              <SendHorizonal className="size-3.5" />
                            </button>
                          )}
                          {(isAdmin || isManager) && (
                            <button type="button" onClick={() => openDelete(po)} title="Hapus PO"
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </>
                      )}
                      {/* Dikirim: Admin terima, Manager atau Admin batalkan */}
                      {po.status === 'Dikirim' && (
                        <>
                          {isAdmin && (
                            <button type="button" onClick={() => terimaPO(po.id)} title="Tandai Diterima"
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-chart-3/10 hover:text-chart-3 transition-colors">
                              <PackageOpen className="size-3.5" />
                            </button>
                          )}
                          {(isAdmin || isManager) && (
                            <button type="button" onClick={() => batalkanPO(po.id)} title="Batalkan PO"
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                              <XCircle className="size-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">{filtered.length} PO · halaman {page} dari {totalPages}</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Buat PO Modal ──────────────────────────────────────── */}
      {modal?.type === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="flex w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-2xl max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
              <p className="text-sm font-semibold">Buat Purchase Order Baru</p>
              <button type="button" onClick={closeModal}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-5 space-y-5">

              {/* Supplier & tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Supplier *" error={errors.supplier}>
                  <Input
                    list="supplier-list"
                    value={form.supplier}
                    onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                    placeholder="Nama supplier"
                    className={errors.supplier ? 'border-destructive' : ''}
                  />
                  <datalist id="supplier-list">
                    {SUPPLIERS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </Field>
                <Field label="Tanggal PO *" error={errors.tanggal}>
                  <Input type="date" value={form.tanggal}
                    onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                    className={errors.tanggal ? 'border-destructive' : ''} />
                </Field>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Daftar Item *</label>
                  {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
                </div>

                {/* Header row */}
                <div className="grid grid-cols-[1fr_120px_100px_120px_28px] gap-2 px-1">
                  {['Nama Produk', 'SKU', 'Qty', 'Harga Satuan', ''].map(h => (
                    <span key={h} className="text-[11px] font-medium text-muted-foreground">{h}</span>
                  ))}
                </div>

                {/* Item rows */}
                <div className="space-y-2" ref={dropdownRef}>
                  {form.items.map((item, idx) => {
                    const locked      = lockedKeys.has(item._key)
                    const suggestions = getSuggestions(item.sku)
                    const isOpen      = openDropdown === item._key

                    return (
                      <div key={item._key} className="grid grid-cols-[1fr_120px_100px_120px_28px] gap-2 items-start">

                        {/* Nama Produk — read-only saat locked */}
                        <div>
                          <Input value={item.productName}
                            onChange={e => updateItem(item._key, 'productName', e.target.value)}
                            placeholder="cth: Kopi Arabica 250g"
                            readOnly={locked}
                            className={`text-sm ${locked ? 'bg-muted/50 cursor-not-allowed' : ''} ${errors[`item_${idx}_name`] ? 'border-destructive' : ''}`} />
                        </div>

                        {/* SKU — dengan dropdown autocomplete */}
                        <div className="relative">
                          {locked ? (
                            <div className="flex items-center gap-1">
                              <Input value={item.sku} readOnly
                                className="font-mono text-xs bg-muted/50 cursor-not-allowed flex-1" />
                              <button type="button" onClick={() => unlockItem(item._key)}
                                title="Ubah produk"
                                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                <X className="size-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Input value={item.sku}
                                onChange={e => {
                                  updateItem(item._key, 'sku', e.target.value.toUpperCase())
                                  setOpenDropdown(item._key)
                                }}
                                onFocus={() => setOpenDropdown(item._key)}
                                placeholder="KOP-ARB-250"
                                className={`font-mono text-xs ${errors[`item_${idx}_sku`] ? 'border-destructive' : ''}`} />
                              {isOpen && suggestions.length > 0 && (
                                <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                                  {suggestions.map(p => (
                                    <button key={p.id} type="button"
                                      onMouseDown={() => selectProduct(item._key, p)}
                                      className="flex w-full flex-col px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-0">
                                      <span className="font-mono text-xs font-medium text-primary">{p.sku}</span>
                                      <span className="text-xs text-muted-foreground truncate">{p.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Qty — selalu bisa diubah */}
                        <div>
                          <Input type="number" min="1" value={item.qty || ''}
                            onChange={e => updateItem(item._key, 'qty', Number(e.target.value))}
                            placeholder="0"
                            className={`text-sm ${errors[`item_${idx}_qty`] ? 'border-destructive' : ''}`} />
                        </div>

                        {/* Harga Satuan — read-only saat locked */}
                        <div>
                          <Input type="number" min="0" value={item.hargaSatuan || ''}
                            onChange={e => updateItem(item._key, 'hargaSatuan', Number(e.target.value))}
                            placeholder="0" readOnly={locked}
                            className={`text-sm ${locked ? 'bg-muted/50 cursor-not-allowed' : ''} ${errors[`item_${idx}_harga`] ? 'border-destructive' : ''}`} />
                        </div>

                        <button type="button" onClick={() => { removeItem(item._key); unlockItem(item._key) }}
                          disabled={form.items.length === 1}
                          className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 transition-colors">
                          <Minus className="size-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <button type="button" onClick={addItem}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                  <Plus className="size-3.5" /> Tambah Item
                </button>
              </div>

              {/* Konflik nama produk */}
              {conflicts.length > 0 && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-2">
                  <p className="text-xs font-semibold text-destructive">
                    SKU sudah terdaftar dengan nama berbeda — perbaiki sebelum menyimpan
                  </p>
                  <div className="space-y-1.5">
                    {conflicts.map(c => (
                      <div key={c.sku} className="grid grid-cols-[80px_1fr_1fr] gap-2 text-xs">
                        <span className="font-mono font-medium text-destructive">{c.sku}</span>
                        <span className="text-muted-foreground">
                          <span className="text-[10px] uppercase tracking-wide mr-1">Katalog:</span>
                          <span className="font-medium text-foreground">{c.namaKatalog}</span>
                        </span>
                        <span className="text-muted-foreground">
                          <span className="text-[10px] uppercase tracking-wide mr-1">Diinput:</span>
                          <span className="font-medium text-destructive">{c.namaPO}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Gunakan autocomplete SKU agar nama produk sesuai katalog, atau perbaiki nama secara manual.
                  </p>
                </div>
              )}

              {/* Total preview */}
              {formTotal > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">Total Nilai PO</span>
                  <span className="text-sm font-semibold text-primary">{formatRupiah(formTotal)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3.5 shrink-0">
              <p className="text-xs text-muted-foreground">Status awal: <span className="font-medium text-foreground">Draft</span></p>
              <div className="flex gap-2">
                <button type="button" onClick={closeModal}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                  Batal
                </button>
                <button type="button" onClick={handleCreate} disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saved
                    ? <><Check className="size-4" /> Tersimpan!</>
                    : saving
                      ? <><Loader2 className="size-4 animate-spin" /> Menyimpan…</>
                      : <><Save className="size-4" /> Simpan Draft</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────────── */}
      {modal?.type === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">Hapus Purchase Order?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{modal.po.noPO}</span>
              {' '}akan dihapus. Hanya PO berstatus Draft yang dapat dihapus.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={closeModal}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors">
                Batal
              </button>
              <button type="button" onClick={handleDelete}
                className="flex-1 rounded-lg bg-destructive py-2 text-sm font-medium text-white hover:bg-destructive/90 transition-colors">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
