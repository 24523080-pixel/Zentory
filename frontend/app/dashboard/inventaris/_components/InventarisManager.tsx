'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Package, AlertTriangle, TrendingDown, PlusCircle,
  Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Save, Check, Info, Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

// ── Types ────────────────────────────────────────────────────
type Klasifikasi = 'Fast' | 'Slow' | 'Dead' | 'InsufficientData'
type Status      = 'Tersedia' | 'Reorder' | 'Kritis'

interface Product {
  id:          string
  sku:         string
  name:        string
  kategori:    string
  hargaBeli:   number
  hargaJual:   number
  stok:        number
  rop:         number
  klasifikasi: Klasifikasi
}

interface FormData {
  name:      string
  sku:       string
  kategori:  string
  hargaBeli: string
  hargaJual: string
  stok:      string
  rop:       string
}

type ModalState =
  | { type: 'add' }
  | { type: 'edit';   product: Product }
  | { type: 'delete'; product: Product }
  | null

// ── Constants ─────────────────────────────────────────────────
const KATEGORIS = ['Minuman', 'Makanan', 'Kemasan', 'Bumbu', 'Lainnya', 'Snack', 'Herbal', 'Sembako', 'Kecantikan', 'Kesehatan']
const TABS      = ['Semua', 'Fast', 'Slow', 'Dead', 'Kritis'] as const
const PAGE_SIZE = 8

const STATUS_BADGE: Record<Status, string> = {
  Tersedia: 'bg-chart-3/15 text-chart-3',
  Reorder:  'bg-chart-4/15 text-chart-4',
  Kritis:   'bg-destructive/15 text-destructive',
}
const KLAS_BADGE: Record<string, string> = {
  Fast:              'bg-primary/10 text-primary',
  Slow:              'bg-chart-4/10 text-chart-4',
  Dead:              'bg-muted text-muted-foreground',
  InsufficientData:  'bg-muted/50 text-muted-foreground/70',
}
const KLAS_LABEL: Record<string, string> = {
  Fast: 'Fast', Slow: 'Slow', Dead: 'Dead', InsufficientData: 'Insufficient Data',
}

const EMPTY_FORM: FormData = {
  name: '', sku: '', kategori: 'Minuman', hargaBeli: '', hargaJual: '', stok: '', rop: '',
}

// ── Helpers ───────────────────────────────────────────────────
function deriveStatus(stok: number, rop: number): Status {
  if (stok <= Math.floor(rop * 0.5)) return 'Kritis'
  if (stok <= rop)                   return 'Reorder'
  return 'Tersedia'
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export function InventarisManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<ModalState>(null)
  const [form, setForm]         = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors]     = useState<Partial<Record<keyof FormData, string>>>({})
  const [saved, setSaved]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [query, setQuery]       = useState('')
  const [tab, setTab]           = useState('Semua')
  const [page, setPage]         = useState(1)

  // ── Fetch ──────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) setProducts(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  // ── Derived summary ────────────────────────────────────────
  const totalStok    = products.reduce((s, p) => s + p.stok, 0)
  const perluReorder = products.filter(p => {
    const st = deriveStatus(p.stok, p.rop)
    return st === 'Reorder' || st === 'Kritis'
  }).length
  const deadStock = products.filter(p => p.klasifikasi === 'Dead').length

  const SUMMARY = [
    { label: 'Total SKU',     value: String(products.length),             icon: Package,       accent: 'text-primary',     glow: 'bg-primary/10'     },
    { label: 'Total Stok',    value: totalStok.toLocaleString('id-ID'),   icon: Package,       accent: 'text-chart-3',     glow: 'bg-chart-3/10'     },
    { label: 'Perlu Reorder', value: `${perluReorder} SKU`,               icon: AlertTriangle, accent: 'text-chart-4',     glow: 'bg-chart-4/10'     },
    { label: 'Dead Stock',    value: `${deadStock} SKU`,                  icon: TrendingDown,  accent: 'text-destructive',  glow: 'bg-destructive/10' },
  ]

  // ── Filter & paginate ──────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return products.filter(p => {
      const matchQ   = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      const status   = deriveStatus(p.stok, p.rop)
      const matchTab = tab === 'Semua' || p.klasifikasi === tab || status === tab
      return matchQ && matchTab
    })
  }, [products, query, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  function changeTab(t: string) { setTab(t); setPage(1) }

  // ── Modal helpers ──────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM); setErrors({}); setSaved(false)
    setModal({ type: 'add' })
  }
  function openEdit(p: Product) {
    setForm({ name: p.name, sku: p.sku, kategori: p.kategori, hargaBeli: String(p.hargaBeli), hargaJual: String(p.hargaJual), stok: String(p.stok), rop: String(p.rop) })
    setErrors({}); setSaved(false)
    setModal({ type: 'edit', product: p })
  }
  function openDelete(p: Product) { setModal({ type: 'delete', product: p }) }
  function closeModal()           { setModal(null); setSaved(false) }

  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  // ── Validation ─────────────────────────────────────────────
  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.name.trim()) e.name = 'Nama produk wajib diisi'
    if (!form.sku.trim())  e.sku  = 'SKU wajib diisi'
    if (modal?.type === 'add' && products.some(p => p.sku.toUpperCase() === form.sku.trim().toUpperCase()))
      e.sku = 'SKU sudah digunakan'
    if (form.stok === '' || isNaN(Number(form.stok)) || Number(form.stok) < 0) e.stok = 'Stok harus angka ≥ 0'
    if (form.rop  === '' || isNaN(Number(form.rop))  || Number(form.rop)  < 0) e.rop  = 'ROP harus angka ≥ 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Save ───────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      if (modal?.type === 'add') {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: form.sku.trim().toUpperCase(), name: form.name.trim(),
            kategori: form.kategori, hargaBeli: form.hargaBeli, hargaJual: form.hargaJual,
            stok: form.stok, rop: form.rop,
          }),
        })
        if (res.ok) {
          const created: Product = await res.json()
          setProducts(prev => [created, ...prev])
        }
      } else if (modal?.type === 'edit') {
        const res = await fetch(`/api/products/${modal.product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: modal.product.sku, name: form.name.trim(),
            kategori: form.kategori, hargaBeli: form.hargaBeli, hargaJual: form.hargaJual,
            stok: form.stok, rop: form.rop,
          }),
        })
        if (res.ok) {
          const updated: Product = await res.json()
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
        }
      }
      setSaved(true)
      setTimeout(closeModal, 900)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  async function handleDelete() {
    if (modal?.type !== 'delete') return
    const res = await fetch(`/api/products/${modal.product.id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== modal.product.id))
      closeModal()
    }
  }

  const isFormModal = modal?.type === 'add' || modal?.type === 'edit'
  const stokNum = Number(form.stok)
  const ropNum  = Number(form.rop)
  const previewStatus = (form.stok !== '' && form.rop !== '' && !isNaN(stokNum) && !isNaN(ropNum))
    ? deriveStatus(stokNum, ropNum) : null

  // ── Render ─────────────────────────────────────────────────
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs">

        {/* Controls */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari produk atau SKU…" value={query}
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
            <button type="button" onClick={openAdd}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <PlusCircle className="size-3.5" /> Tambah
            </button>
          </div>
        </div>

        {/* Table body */}
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Tidak ada produk yang cocok.
                  </td>
                </tr>
              ) : paginated.map(row => {
                const status = deriveStatus(row.stok, row.rop)
                return (
                  <tr key={row.id} className="bg-card transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <p className="font-medium">{row.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{row.sku}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{row.kategori}</td>
                    <td className="px-4 py-3.5 tabular-nums font-medium">{row.stok}</td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{row.rop}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${KLAS_BADGE[row.klasifikasi]}`}>
                        {KLAS_LABEL[row.klasifikasi]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => openEdit(row)} aria-label={`Edit ${row.name}`}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Edit2 className="size-3.5" />
                        </button>
                        <button type="button" onClick={() => openDelete(row)} aria-label={`Hapus ${row.name}`}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">{filtered.length} produk · halaman {page} dari {totalPages}</p>
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

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      {isFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="flex w-full max-w-md flex-col rounded-xl border border-border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-sm font-semibold">
                {modal?.type === 'add' ? 'Tambah Produk Baru' : `Edit: ${modal?.product.name}`}
              </p>
              <button type="button" onClick={closeModal}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5">
              <Field label="Nama Produk *" error={errors.name}>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="cth: Kopi Arabica 250g"
                  className={errors.name ? 'border-destructive' : ''} />
              </Field>

              <Field label="SKU *" error={errors.sku}>
                <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  placeholder="cth: KOP-ARB-250" disabled={modal?.type === 'edit'}
                  className={`font-mono ${errors.sku ? 'border-destructive' : ''} ${modal?.type === 'edit' ? 'opacity-60' : ''}`} />
              </Field>

              <Field label="Kategori">
                <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {KATEGORIS.map(k => <option key={k}>{k}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Harga Beli (Rp)">
                  <Input type="number" min="0" value={form.hargaBeli}
                    onChange={e => setForm(f => ({ ...f, hargaBeli: e.target.value }))} placeholder="0" />
                </Field>
                <Field label="Harga Jual (Rp)">
                  <Input type="number" min="0" value={form.hargaJual}
                    onChange={e => setForm(f => ({ ...f, hargaJual: e.target.value }))} placeholder="0" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Stok Saat Ini *" error={errors.stok}>
                  <Input type="number" min="0" value={form.stok}
                    onChange={e => setForm(f => ({ ...f, stok: e.target.value }))}
                    placeholder="0" className={errors.stok ? 'border-destructive' : ''} />
                </Field>
                <Field label="Reorder Point (ROP) *" error={errors.rop}>
                  <Input type="number" min="0" value={form.rop}
                    onChange={e => setForm(f => ({ ...f, rop: e.target.value }))}
                    placeholder="0" className={errors.rop ? 'border-destructive' : ''} />
                </Field>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
                <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Klasifikasi <span className="font-medium text-foreground">Fast / Slow / Dead Stock</span> ditetapkan
                  otomatis oleh sistem berdasarkan historis penjualan.
                </p>
              </div>

              {previewStatus && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
                  <span>Status otomatis:</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_BADGE[previewStatus]}`}>
                    {previewStatus}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5">
              <button type="button" onClick={closeModal}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                Batal
              </button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saved
                  ? <><Check className="size-4" /> Tersimpan!</>
                  : saving
                    ? <><Loader2 className="size-4 animate-spin" /> Menyimpan…</>
                    : <><Save className="size-4" /> Simpan</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ───────────────────────────────── */}
      {modal?.type === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">Hapus Produk?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{modal.product.name}</span>
              {' '}akan dihapus dari inventaris. Tindakan ini tidak dapat dibatalkan.
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
