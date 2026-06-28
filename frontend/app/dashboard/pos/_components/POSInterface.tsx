'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart, X, CheckCircle2, RotateCcw, AlertTriangle, ClipboardList, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface POSProduct {
  id: string; name: string; sku: string; kategori: string; harga: number; stok: number; rop: number
}
interface CartItem { product: POSProduct; qty: number }

function formatRupiah(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

const ICON_STYLE: Record<string, string> = {
  Minuman:    'bg-blue-50 text-blue-600',
  Kemasan:    'bg-amber-50 text-amber-600',
  Bumbu:      'bg-green-50 text-green-700',
  Snack:      'bg-orange-50 text-orange-600',
  Herbal:     'bg-emerald-50 text-emerald-700',
  Kecantikan: 'bg-pink-50 text-pink-600',
  Kesehatan:  'bg-violet-50 text-violet-600',
  Sembako:    'bg-yellow-50 text-yellow-700',
}

// ── ProductCard ───────────────────────────────────────────────────────────────

function ProductCard({ product, cartQty, onAdd }: {
  product: POSProduct; cartQty: number; onAdd: () => void
}) {
  const habis      = product.stok === 0
  const kritis     = product.stok > 0 && product.stok <= 5
  const maxReached = cartQty >= product.stok && !habis

  return (
    <button type="button" onClick={onAdd} disabled={habis || maxReached}
      className={[
        'relative flex flex-col rounded-xl border p-3 text-left transition-all duration-150',
        habis      ? 'cursor-not-allowed border-border bg-muted/20'
        : maxReached ? 'cursor-not-allowed border-border bg-muted/30 opacity-60'
        : kritis   ? 'border-chart-4/60 bg-card shadow-sm hover:border-chart-4 active:scale-[0.98]'
        : 'border-border bg-card hover:border-primary/40 hover:shadow-md active:scale-[0.98]',
      ].join(' ')}
    >
      {habis && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[2px]">
          <span className="rounded-lg bg-destructive px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">Stok Habis</span>
        </div>
      )}
      {kritis && !habis && (
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-chart-4 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
          <span className="size-1.5 animate-pulse rounded-full bg-white" /> Sisa {product.stok}
        </span>
      )}
      {cartQty > 0 && !habis && (
        <span className="absolute left-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{cartQty}</span>
      )}
      <div className={`mb-3 mt-1 flex size-10 items-center justify-center rounded-xl text-sm font-bold ${ICON_STYLE[product.kategori] ?? 'bg-muted text-muted-foreground'}`}>
        {product.name.charAt(0)}
      </div>
      <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">{product.name}</p>
      <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground/65">{product.sku}</span>
      <p className={`mt-2 text-sm font-semibold ${habis ? 'text-muted-foreground/40 line-through' : 'text-primary'}`}>{formatRupiah(product.harga)}</p>
      {maxReached && <p className="mt-1 text-[10px] text-chart-4">Maks. stok tercapai</p>}
    </button>
  )
}

// ── CartRow ───────────────────────────────────────────────────────────────────

function CartRow({ item, onInc, onDec, onRemove }: { item: CartItem; onInc: () => void; onDec: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium">{item.product.name}</p>
        <p className="text-[10px] text-muted-foreground">{formatRupiah(item.product.harga)} / pcs</p>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onDec} className="flex size-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted">
          <Minus className="size-3" />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
        <button type="button" onClick={onInc} disabled={item.qty >= item.product.stok}
          className="flex size-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40">
          <Plus className="size-3" />
        </button>
      </div>
      <p className="w-20 text-right text-xs font-semibold tabular-nums">{formatRupiah(item.product.harga * item.qty)}</p>
      <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function POSInterface() {
  const [products, setProducts]   = useState<POSProduct[]>([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [kategori, setKategori]   = useState('Semua')
  const [cart, setCart]           = useState<CartItem[]>([])
  const [modal, setModal]         = useState<'payment' | 'success' | null>(null)
  const [nominal, setNominal]     = useState('')
  const [reorderList, setReorderList] = useState<string[]>([])
  const [processing, setProcessing]   = useState(false)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.map((p: { id: string; name: string; sku: string; kategori: string; hargaJual: number; stok: number; rop: number }) => ({
          id: p.id, name: p.name, sku: p.sku, kategori: p.kategori,
          harga: p.hargaJual, stok: p.stok, rop: p.rop,
        })))
      }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const KATEGORI = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.kategori))).sort()
    return ['Semua', ...cats]
  }, [products])

  const filtered = useMemo(() => products.filter((p) => {
    const q = query.toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchK = kategori === 'Semua' || p.kategori === kategori
    return matchQ && matchK
  }), [products, query, kategori])

  const total      = cart.reduce((s, i) => s + i.product.harga * i.qty, 0)
  const nominalNum = parseInt(nominal.replace(/\D/g, ''), 10) || 0
  const kembalian  = nominalNum - total

  function getCartQty(id: string) { return cart.find(i => i.product.id === id)?.qty ?? 0 }

  function addToCart(product: POSProduct) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        if (existing.qty >= product.stok) return prev
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { product, qty: 1 }]
    })
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0))
  }

  function removeItem(id: string) { setCart(prev => prev.filter(i => i.product.id !== id)) }

  function clearCart() { setCart([]); setModal(null); setNominal(''); setReorderList([]) }

  async function confirmPayment() {
    if (nominalNum < total || processing) return
    setProcessing(true)
    try {
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => ({ productId: i.product.id, qty: i.qty })) }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(`Transaksi gagal: ${err.message}`)
        return
      }
      const data = await res.json()
      setReorderList(data.reorderTriggered ?? [])
      await loadProducts()
      setModal('success')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* ── LEFT: Katalog ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari produk atau scan SKU…" value={query} onChange={e => setQuery(e.target.value)} className="h-9 pl-8" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <nav className="w-24 shrink-0 overflow-y-auto border-r border-border bg-muted/20 py-2">
            {KATEGORI.map(k => (
              <button key={k} type="button" onClick={() => setKategori(k)}
                className={['w-full px-3 py-2.5 text-left text-xs font-medium transition-colors',
                  kategori === k ? 'border-r-2 border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')}>
                {k}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Produk tidak ditemukan.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} cartQty={getCartQty(p.id)} onAdd={() => addToCart(p)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Keranjang ── */}
      <div className="flex w-72 flex-col border-l border-border bg-card lg:w-80">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-primary" />
            <span className="text-sm font-semibold">Keranjang</span>
            {cart.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button type="button" onClick={clearCart} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
              <RotateCcw className="size-3" /> Bersihkan
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="size-8 text-muted-foreground/30 mb-3" />
              <p className="text-xs text-muted-foreground">Keranjang kosong.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Klik produk untuk menambahkan.</p>
            </div>
          ) : cart.map(item => (
            <CartRow key={item.product.id} item={item}
              onInc={() => updateQty(item.product.id, +1)}
              onDec={() => updateQty(item.product.id, -1)}
              onRemove={() => removeItem(item.product.id)} />
          ))}
        </div>

        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{cart.reduce((s, i) => s + i.qty, 0)} item</span>
            <span className="text-lg font-bold text-primary tabular-nums">{formatRupiah(total)}</span>
          </div>
          <button type="button" onClick={() => cart.length > 0 && setModal('payment')} disabled={cart.length === 0}
            className={['w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200',
              cart.length > 0 ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-[0.98]'
              : 'cursor-not-allowed bg-muted text-muted-foreground',
            ].join(' ')}>
            {cart.length > 0 ? `Bayar · ${formatRupiah(total)}` : 'Bayar Sekarang'}
          </button>
        </div>
      </div>

      {/* ── Modal Pembayaran ── */}
      {modal === 'payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Pembayaran</h2>
              <button type="button" onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <div className="mb-4 max-h-32 overflow-y-auto space-y-1">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.product.name} ×{item.qty}</span>
                  <span className="tabular-nums">{formatRupiah(item.product.harga * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-primary/8 px-4 py-3">
              <span className="text-sm font-medium">Total Tagihan</span>
              <span className="text-lg font-bold text-primary tabular-nums">{formatRupiah(total)}</span>
            </div>
            <div className="mb-4 space-y-1.5">
              <label className="text-sm font-medium">Nominal Bayar</label>
              <Input type="text" inputMode="numeric" placeholder="Contoh: 100000" value={nominal}
                onChange={e => setNominal(e.target.value.replace(/\D/g, ''))}
                className="h-10 text-base font-semibold" autoFocus />
            </div>
            {nominalNum > 0 && (
              <div className={`mb-4 flex items-center justify-between rounded-xl px-4 py-3 ${kembalian >= 0 ? 'bg-chart-3/10' : 'bg-destructive/10'}`}>
                <span className="text-sm font-medium">{kembalian >= 0 ? 'Kembalian' : 'Kurang'}</span>
                <span className={`text-base font-bold tabular-nums ${kembalian >= 0 ? 'text-chart-3' : 'text-destructive'}`}>{formatRupiah(Math.abs(kembalian))}</span>
              </div>
            )}
            <button type="button" onClick={confirmPayment} disabled={nominalNum < total || processing}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
              {processing ? <><Loader2 className="size-4 animate-spin" /> Memproses…</> : 'Konfirmasi Pembayaran'}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Sukses ── */}
      {modal === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl text-center overflow-y-auto max-h-[90vh]">
            <div className="mb-4 flex justify-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-chart-3/15">
                <CheckCircle2 className="size-7 text-chart-3" />
              </span>
            </div>
            <h2 className="text-base font-semibold">Pembayaran Berhasil</h2>
            <p className="mt-1 text-xs text-muted-foreground">Transaksi selesai. Stok inventaris telah diperbarui.</p>
            <div className="my-5 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Tagihan</span>
                <span className="font-semibold tabular-nums">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dibayar</span>
                <span className="font-semibold tabular-nums">{formatRupiah(nominalNum)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm">
                <span className="text-muted-foreground">Kembalian</span>
                <span className="font-bold text-chart-3 tabular-nums">{formatRupiah(kembalian)}</span>
              </div>
            </div>

            {reorderList.length > 0 && (
              <div className="mb-5 rounded-xl border border-chart-4/30 bg-chart-4/5 p-3 text-left">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="size-3.5 shrink-0 text-chart-4" />
                  <span className="text-xs font-semibold text-chart-4">
                    {reorderList.length} produk di bawah ROP — draft PO dibuat otomatis
                  </span>
                </div>
                <div className="space-y-1">
                  {reorderList.map((name, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{name}</p>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ClipboardList className="size-3 shrink-0" />
                  Lihat Purchase Order untuk konfirmasi pengadaan
                </div>
              </div>
            )}

            <button type="button" onClick={clearCart}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Transaksi Baru
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
