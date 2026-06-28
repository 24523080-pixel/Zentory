'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ClipboardList, Clock, PackageCheck, XCircle, PlusCircle,
  Search, Eye, Trash2, X, Save, Check, Plus, Minus,
  ChevronLeft, ChevronRight, SendHorizonal, PackageOpen,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PURCHASE_ORDERS, totalNilai, type PurchaseOrder, type POStatus, type POItem } from '../_data'

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

function nextNoPO(orders: PurchaseOrder[]): string {
  const nums = orders.map(po => parseInt(po.noPO.split('-')[2] ?? '0', 10)).filter(n => !isNaN(n))
  const next = Math.max(0, ...nums) + 1
  return `PO-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`
}

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

// ── Main export ────────────────────────────────────────────────
export function POManager() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS)
  const [modal, setModal]   = useState<ModalState>(null)
  const [form, setForm]     = useState<FormData>(newForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved]   = useState(false)
  const [query, setQuery]   = useState('')
  const [tab, setTab]       = useState('Semua')
  const [page, setPage]     = useState(1)
  const [keyCounter, setKeyCounter] = useState(1000)

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
  function openCreate() { setForm(newForm()); setErrors({}); setSaved(false); setModal({ type: 'create' }) }
  function openDelete(po: PurchaseOrder) { setModal({ type: 'delete', po }) }
  function closeModal() { setModal(null); setSaved(false) }

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
  function handleCreate() {
    if (!validate()) return
    const noPO = nextNoPO(orders)
    const newPO: PurchaseOrder = {
      id:       `po-${Date.now()}`,
      noPO,
      supplier: form.supplier.trim(),
      tanggal:  form.tanggal,
      status:   'Draft',
      items:    form.items.map(({ _key, ...rest }) => rest),
    }
    setOrders(prev => [newPO, ...prev])
    setSaved(true)
    setTimeout(closeModal, 900)
  }

  // ── Status transitions ────────────────────────────────────────
  function kirimPO(id: string) {
    setOrders(prev => prev.map(po => po.id === id ? { ...po, status: 'Dikirim' } : po))
  }
  function terimaPO(id: string) {
    setOrders(prev => prev.map(po => po.id === id ? { ...po, status: 'Diterima' } : po))
  }
  function batalkanPO(id: string) {
    setOrders(prev => prev.map(po => po.id === id ? { ...po, status: 'Dibatalkan' } : po))
  }

  // ── Delete ────────────────────────────────────────────────────
  function handleDelete() {
    if (modal?.type !== 'delete') return
    setOrders(prev => prev.filter(po => po.id !== modal.po.id))
    closeModal()
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
            <button type="button" onClick={openCreate}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <PlusCircle className="size-3.5" /> Buat PO
            </button>
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
                      {/* Draft: Kirim + Hapus */}
                      {po.status === 'Draft' && (
                        <>
                          <button type="button" onClick={() => kirimPO(po.id)} title="Kirim ke Supplier"
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                            <SendHorizonal className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => openDelete(po)} title="Hapus PO"
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      )}
                      {/* Dikirim: Terima + Batalkan */}
                      {po.status === 'Dikirim' && (
                        <>
                          <button type="button" onClick={() => terimaPO(po.id)} title="Tandai Diterima"
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-chart-3/10 hover:text-chart-3 transition-colors">
                            <PackageOpen className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => batalkanPO(po.id)} title="Batalkan PO"
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <XCircle className="size-3.5" />
                          </button>
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
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={item._key} className="grid grid-cols-[1fr_120px_100px_120px_28px] gap-2 items-start">
                      <div>
                        <Input value={item.productName}
                          onChange={e => updateItem(item._key, 'productName', e.target.value)}
                          placeholder="cth: Kopi Arabica 250g"
                          className={`text-sm ${errors[`item_${idx}_name`] ? 'border-destructive' : ''}`} />
                      </div>
                      <div>
                        <Input value={item.sku}
                          onChange={e => updateItem(item._key, 'sku', e.target.value.toUpperCase())}
                          placeholder="KOP-ARB-250" className={`font-mono text-xs ${errors[`item_${idx}_sku`] ? 'border-destructive' : ''}`} />
                      </div>
                      <div>
                        <Input type="number" min="1" value={item.qty || ''}
                          onChange={e => updateItem(item._key, 'qty', Number(e.target.value))}
                          placeholder="0" className={`text-sm ${errors[`item_${idx}_qty`] ? 'border-destructive' : ''}`} />
                      </div>
                      <div>
                        <Input type="number" min="0" value={item.hargaSatuan || ''}
                          onChange={e => updateItem(item._key, 'hargaSatuan', Number(e.target.value))}
                          placeholder="0" className={`text-sm ${errors[`item_${idx}_harga`] ? 'border-destructive' : ''}`} />
                      </div>
                      <button type="button" onClick={() => removeItem(item._key)} disabled={form.items.length === 1}
                        className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 transition-colors">
                        <Minus className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addItem}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                  <Plus className="size-3.5" /> Tambah Item
                </button>
              </div>

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
                <button type="button" onClick={handleCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  {saved
                    ? <><Check className="size-4" /> Tersimpan!</>
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
