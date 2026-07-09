'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, PackageX, Info, Minus, Loader2, RefreshCw, CheckCircle2, X } from 'lucide-react'

type Klasifikasi = 'Fast Moving' | 'Slow Moving' | 'Dead Stock' | 'Insufficient Data'

interface AnalitikProduct {
  id: string; name: string; sku: string; kategori: string
  klasifikasi: Klasifikasi; stok: number; rop: number
  hargaBeli: number; hargaJual: number
}

const KLAS_MAP: Record<string, Klasifikasi> = {
  Fast:              'Fast Moving',
  Slow:              'Slow Moving',
  Dead:              'Dead Stock',
  InsufficientData:  'Insufficient Data',
}

const KLASIFIKASI_CONFIG: Record<Klasifikasi, { cls: string; dot: string; bg: string; icon: React.ElementType; desc: string }> = {
  'Fast Moving':       { cls: 'text-chart-3',          dot: 'bg-chart-3',          bg: 'bg-chart-3/10',    icon: TrendingUp,   desc: 'Perputaran tinggi — prioritaskan di PO berikutnya' },
  'Slow Moving':       { cls: 'text-chart-4',           dot: 'bg-chart-4',          bg: 'bg-chart-4/10',   icon: TrendingDown, desc: 'Perputaran rendah — review harga atau bundling promo' },
  'Dead Stock':        { cls: 'text-destructive',       dot: 'bg-destructive',      bg: 'bg-destructive/10', icon: PackageX,   desc: 'Tidak terjual — pertimbangkan diskon clearance' },
  'Insufficient Data': { cls: 'text-muted-foreground', dot: 'bg-muted-foreground', bg: 'bg-muted',         icon: Info,         desc: 'Data penjualan belum cukup untuk klasifikasi' },
}

const REKOMENDASI: Record<Klasifikasi, string> = {
  'Fast Moving':       'Pertahankan stok minimal 2× reorder point. Prioritaskan di PO berikutnya.',
  'Slow Moving':       'Review harga atau bundling promo. Turunkan stok minimum untuk kurangi modal beku.',
  'Dead Stock':        'Pertimbangkan diskon clearance atau retur ke supplier. Hindari reorder.',
  'Insufficient Data': 'Tunggu minimal 1 bulan data penjualan sebelum mengambil keputusan stok.',
}

function formatRupiah(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

function Distribution({ products }: { products: AnalitikProduct[] }) {
  const counts = {
    'Fast Moving':       products.filter(p => p.klasifikasi === 'Fast Moving').length,
    'Slow Moving':       products.filter(p => p.klasifikasi === 'Slow Moving').length,
    'Dead Stock':        products.filter(p => p.klasifikasi === 'Dead Stock').length,
    'Insufficient Data': products.filter(p => p.klasifikasi === 'Insufficient Data').length,
  }
  const total = products.length || 1
  const bars: Array<{ k: Klasifikasi; count: number }> = [
    { k: 'Fast Moving', count: counts['Fast Moving'] },
    { k: 'Slow Moving', count: counts['Slow Moving'] },
    { k: 'Dead Stock',  count: counts['Dead Stock']  },
    { k: 'Insufficient Data', count: counts['Insufficient Data'] },
  ]

  return (
    <div className="space-y-2.5">
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {bars.map(({ k, count }) => {
          if (!count) return null
          return <div key={k} className={`${KLASIFIKASI_CONFIG[k].dot} h-full`} style={{ width: `${(count / total) * 100}%` }} />
        })}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {bars.map(({ k, count }) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <span className={`size-2 shrink-0 rounded-full ${KLASIFIKASI_CONFIG[k].dot}`} />
            <span className="text-muted-foreground">{k}</span>
            <span className="ml-auto font-semibold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type FilterKlasifikasi = 'Semua' | Klasifikasi
const TABS: FilterKlasifikasi[] = ['Semua', 'Fast Moving', 'Slow Moving', 'Dead Stock', 'Insufficient Data']

export function AnalitikClient({ role }: { role: string }) {
  const [products, setProducts]         = useState<AnalitikProduct[]>([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState<FilterKlasifikasi>('Semua')
  const [reklasLoading, setReklasLoading] = useState(false)
  const [reklasResult, setReklasResult]   = useState<{ changed: number; total: number } | null>(null)

  function loadProducts() {
    setLoading(true)
    fetch('/api/products')
      .then(r => r.ok ? r.json() : [])
      .then(data => setProducts(data.map((p: { id: string; name: string; sku: string; kategori: string; klasifikasi: string; stok: number; rop: number; hargaBeli: number; hargaJual: number }) => ({
        ...p,
        klasifikasi: KLAS_MAP[p.klasifikasi] ?? 'Insufficient Data',
      }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  async function handleReklasifikasi() {
    setReklasLoading(true)
    setReklasResult(null)
    try {
      const res = await fetch('/api/analitik/reklasifikasi', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setReklasResult({ changed: data.changed, total: data.total })
        loadProducts()
      }
    } finally {
      setReklasLoading(false)
    }
  }

  const fast          = products.filter(p => p.klasifikasi === 'Fast Moving')
  const slow          = products.filter(p => p.klasifikasi === 'Slow Moving')
  const dead          = products.filter(p => p.klasifikasi === 'Dead Stock')
  const nilaiDeadStock = dead.reduce((s, p) => s + p.stok * p.hargaBeli, 0)

  const displayed = filter === 'Semua' ? products : products.filter(p => p.klasifikasi === filter)

  if (loading) return (
    <div className="flex h-48 items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Fast Moving',    value: `${fast.length} SKU`,        sub: 'Perputaran tinggi',  cls: 'text-chart-3',    border: 'border-chart-3/20',    bg: 'from-chart-3/[0.08]',    glow: 'bg-chart-3/20'    },
          { label: 'Slow Moving',    value: `${slow.length} SKU`,        sub: 'Perlu perhatian',    cls: 'text-chart-4',    border: 'border-chart-4/20',    bg: 'from-chart-4/[0.08]',    glow: 'bg-chart-4/20'    },
          { label: 'Dead Stock',     value: `${dead.length} SKU`,        sub: 'Risiko kerugian',    cls: 'text-destructive', border: 'border-destructive/20', bg: 'from-destructive/[0.08]', glow: 'bg-destructive/20' },
          { label: 'Nilai Dead Stock', value: formatRupiah(nilaiDeadStock), sub: 'Modal beku',      cls: 'text-destructive', border: 'border-destructive/20', bg: 'from-destructive/[0.08]', glow: 'bg-destructive/20' },
        ].map(c => (
          <div key={c.label} className={`relative overflow-hidden rounded-xl border ${c.border} bg-gradient-to-br ${c.bg} to-card p-4 shadow-xs`}>
            <div className={`pointer-events-none absolute -right-3 -top-3 size-20 rounded-full ${c.glow} blur-2xl`} />
            <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
            <p className={`mt-1.5 text-2xl font-semibold ${c.cls}`}>{c.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Distribusi */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <h3 className="text-sm font-semibold">Distribusi Klasifikasi</h3>
        <p className="mb-4 text-xs text-muted-foreground">{products.length} SKU total</p>
        <Distribution products={products} />
        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Kriteria</p>
          {(Object.entries(KLASIFIKASI_CONFIG) as [Klasifikasi, typeof KLASIFIKASI_CONFIG[Klasifikasi]][]).map(([k, cfg]) => (
            <div key={k} className="text-[11px] text-muted-foreground">
              <span className={`font-medium ${cfg.cls}`}>{k}</span> — {cfg.desc}
            </div>
          ))}
        </div>
      </div>

      {/* Produk table */}
      <div className="rounded-xl border border-border bg-card shadow-xs">
        <div className="border-b border-border px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Klasifikasi Produk</h3>
            {role === 'manager' && (
              <button
                type="button"
                onClick={handleReklasifikasi}
                disabled={reklasLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
              >
                {reklasLoading
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <RefreshCw className="size-3.5" />}
                {reklasLoading ? 'Menganalisis…' : 'Reklasifikasi dari Data Penjualan'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {TABS.map(t => (
              <button key={t} type="button" onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === t
                    ? t === 'Semua' ? 'bg-primary/10 text-primary'
                      : `${KLASIFIKASI_CONFIG[t as Klasifikasi].bg} ${KLASIFIKASI_CONFIG[t as Klasifikasi].cls}`
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Produk</th>
                <th className="px-5 py-3 font-medium text-right">Stok</th>
                <th className="px-5 py-3 font-medium text-right">ROP</th>
                <th className="px-5 py-3 font-medium text-right">Harga Beli</th>
                <th className="px-5 py-3 font-medium text-right">Harga Jual</th>
                <th className="px-5 py-3 font-medium text-right">Margin</th>
                <th className="px-5 py-3 font-medium">Klasifikasi</th>
                <th className="px-5 py-3 font-medium">Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayed.map(p => {
                const cfg        = KLASIFIKASI_CONFIG[p.klasifikasi]
                const KlasIcon   = cfg.icon
                const marginPct  = p.hargaJual > 0 ? Math.round(((p.hargaJual - p.hargaBeli) / p.hargaJual) * 100) : 0
                return (
                  <tr key={p.id} className="bg-card transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{p.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{p.sku} · {p.kategori}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      <span className={p.stok === 0 ? 'font-semibold text-destructive' : p.stok <= p.rop ? 'font-semibold text-chart-4' : ''}>
                        {p.stok}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">{p.rop}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-xs text-muted-foreground">{formatRupiah(p.hargaBeli)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-xs">{formatRupiah(p.hargaJual)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      <span className={marginPct >= 30 ? 'text-chart-3 font-semibold' : marginPct >= 15 ? '' : 'text-destructive font-semibold'}>
                        {marginPct}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.cls}`}>
                        <KlasIcon className="size-3" />{p.klasifikasi}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs text-muted-foreground leading-relaxed">{REKOMENDASI[p.klasifikasi]}</p>
                    </td>
                  </tr>
                )
              })}
              {displayed.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">Tidak ada produk.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Toast hasil reklasifikasi */}
      {reklasResult && (
        <div className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl border border-chart-3/30 bg-card p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-chart-3/10">
              <CheckCircle2 className="size-4 text-chart-3" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-chart-3">Reklasifikasi selesai</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {reklasResult.changed} dari {reklasResult.total} produk berubah klasifikasi
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Berdasarkan penjualan 30 hari terakhir</p>
            </div>
            <button type="button" onClick={() => setReklasResult(null)} className="text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}
  )
}
