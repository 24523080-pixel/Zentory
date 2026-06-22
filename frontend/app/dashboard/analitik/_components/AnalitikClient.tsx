'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, PackageX, Info, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import {
  PRODUCTS_ANALYTIC, WEEKLY_SALES, MONTHLY_SALES,
  type Klasifikasi, type TrendArah,
} from '../_data'

const TREND_CONFIG: Record<TrendArah, { icon: React.ElementType; cls: string; label: string }> = {
  naik:   { icon: ArrowUp,   cls: 'text-chart-3',    label: 'Naik'   },
  turun:  { icon: ArrowDown, cls: 'text-destructive', label: 'Turun'  },
  stabil: { icon: Minus,     cls: 'text-muted-foreground', label: 'Stabil' },
}

const KLASIFIKASI_CONFIG: Record<Klasifikasi, { cls: string; dot: string; bg: string; icon: React.ElementType; desc: string }> = {
  'Fast Moving':       { cls: 'text-chart-3',       dot: 'bg-chart-3',       bg: 'bg-chart-3/10',      icon: TrendingUp,    desc: 'Terjual > 30 unit/bulan, perputaran tinggi'         },
  'Slow Moving':       { cls: 'text-chart-4',        dot: 'bg-chart-4',       bg: 'bg-chart-4/10',      icon: TrendingDown,  desc: 'Terjual 5–30 unit/bulan, butuh perhatian'           },
  'Dead Stock':        { cls: 'text-destructive',    dot: 'bg-destructive',   bg: 'bg-destructive/10',  icon: PackageX,      desc: 'Terjual < 5 unit/bulan atau nihil, risiko kerugian' },
  'Insufficient Data': { cls: 'text-muted-foreground', dot: 'bg-muted-foreground', bg: 'bg-muted',      icon: Info,          desc: 'Data penjualan belum cukup untuk diklasifikasikan'  },
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

// ── Pure CSS Bar Chart ──────────────────────────────────────────────────────

const CHART_H    = 140
const GRID_LINES = [0, 0.25, 0.5, 0.75, 1]

function BarChart({ data }: { data: { label: string; nilai: number }[] }) {
  const max = Math.max(...data.map((d) => d.nilai))

  return (
    <div>
      {/* Chart area */}
      <div className="flex gap-3">
        {/* Y-axis labels */}
        <div className="relative shrink-0" style={{ height: `${CHART_H}px`, width: '36px' }}>
          {GRID_LINES.map((pct) => (
            <span
              key={pct}
              className="absolute right-0 text-[10px] leading-none text-muted-foreground"
              style={{ bottom: `${pct * CHART_H - 5}px` }}
            >
              {formatRupiah(Math.round(pct * max))}
            </span>
          ))}
        </div>

        {/* Bars + gridlines */}
        <div className="relative flex-1">
          {/* Gridlines */}
          <div className="absolute inset-0" style={{ height: `${CHART_H}px` }}>
            {GRID_LINES.map((pct) => (
              <div
                key={pct}
                className="absolute w-full border-t border-border/60"
                style={{ bottom: `${pct * CHART_H}px` }}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="relative flex items-end gap-2" style={{ height: `${CHART_H}px` }}>
            {data.map((d) => {
              const isMax = d.nilai === max
              const barH  = Math.max(6, Math.round((d.nilai / max) * CHART_H))
              return (
                <div key={d.label} className="group relative flex flex-1 flex-col items-center">
                  <span
                    className={`absolute whitespace-nowrap text-[10px] font-semibold transition-opacity ${
                      isMax
                        ? 'text-primary opacity-100'
                        : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                    }`}
                    style={{ bottom: `${barH + 4}px` }}
                  >
                    {formatRupiah(d.nilai)}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isMax
                        ? 'bg-primary'
                        : 'bg-primary/50 group-hover:bg-primary/80'
                    }`}
                    style={{ height: `${barH}px` }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex gap-2 pl-12">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 justify-center">
            <span className={`text-[10px] font-medium ${d.nilai === max ? 'text-primary' : 'text-muted-foreground'}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Donut-like distribution ─────────────────────────────────────────────────

function Distribution({ products }: { products: typeof PRODUCTS_ANALYTIC }) {
  const counts = {
    'Fast Moving':       products.filter((p) => p.klasifikasi === 'Fast Moving').length,
    'Slow Moving':       products.filter((p) => p.klasifikasi === 'Slow Moving').length,
    'Dead Stock':        products.filter((p) => p.klasifikasi === 'Dead Stock').length,
    'Insufficient Data': products.filter((p) => p.klasifikasi === 'Insufficient Data').length,
  }
  const total = products.length
  const bars: Array<{ k: Klasifikasi; count: number }> = [
    { k: 'Fast Moving',       count: counts['Fast Moving']       },
    { k: 'Slow Moving',       count: counts['Slow Moving']       },
    { k: 'Dead Stock',        count: counts['Dead Stock']        },
    { k: 'Insufficient Data', count: counts['Insufficient Data'] },
  ]

  return (
    <div className="space-y-2.5">
      {/* Segmented bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {bars.map(({ k, count }) => {
          if (!count) return null
          const cfg = KLASIFIKASI_CONFIG[k]
          return (
            <div key={k} className={`${cfg.dot} h-full`} style={{ width: `${(count / total) * 100}%` }} />
          )
        })}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {bars.map(({ k, count }) => {
          const cfg = KLASIFIKASI_CONFIG[k]
          return (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className={`size-2 shrink-0 rounded-full ${cfg.dot}`} />
              <span className="text-muted-foreground">{k}</span>
              <span className="ml-auto font-semibold">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────

type FilterKlasifikasi = 'Semua' | Klasifikasi

export function AnalitikClient() {
  const [trendPeriod, setTrendPeriod] = useState<'mingguan' | 'bulanan'>('bulanan')
  const [filter, setFilter] = useState<FilterKlasifikasi>('Semua')

  const trendData = trendPeriod === 'bulanan' ? MONTHLY_SALES : WEEKLY_SALES

  const fast  = PRODUCTS_ANALYTIC.filter((p) => p.klasifikasi === 'Fast Moving')
  const slow  = PRODUCTS_ANALYTIC.filter((p) => p.klasifikasi === 'Slow Moving')
  const dead  = PRODUCTS_ANALYTIC.filter((p) => p.klasifikasi === 'Dead Stock')
  const nilaiDeadStock = dead.reduce((s, p) => s + p.stokAktif * p.hargaPokok, 0)

  const displayed = filter === 'Semua'
    ? PRODUCTS_ANALYTIC
    : PRODUCTS_ANALYTIC.filter((p) => p.klasifikasi === filter)

  const TABS: FilterKlasifikasi[] = ['Semua', 'Fast Moving', 'Slow Moving', 'Dead Stock', 'Insufficient Data']

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-chart-3/20 bg-gradient-to-br from-chart-3/[0.08] to-card p-4 shadow-xs">
          <div className="pointer-events-none absolute -right-3 -top-3 size-20 rounded-full bg-chart-3/20 blur-2xl" />
          <p className="text-xs font-medium text-muted-foreground">Fast Moving</p>
          <p className="mt-1.5 text-2xl font-semibold text-chart-3">{fast.length} SKU</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Perputaran tinggi</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-chart-4/20 bg-gradient-to-br from-chart-4/[0.08] to-card p-4 shadow-xs">
          <div className="pointer-events-none absolute -right-3 -top-3 size-20 rounded-full bg-chart-4/20 blur-2xl" />
          <p className="text-xs font-medium text-muted-foreground">Slow Moving</p>
          <p className="mt-1.5 text-2xl font-semibold text-chart-4">{slow.length} SKU</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Perlu perhatian</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-destructive/20 bg-gradient-to-br from-destructive/[0.08] to-card p-4 shadow-xs">
          <div className="pointer-events-none absolute -right-3 -top-3 size-20 rounded-full bg-destructive/20 blur-2xl" />
          <p className="text-xs font-medium text-muted-foreground">Dead Stock</p>
          <p className="mt-1.5 text-2xl font-semibold text-destructive">{dead.length} SKU</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Risiko kerugian</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-destructive/20 bg-gradient-to-br from-destructive/[0.08] to-card p-4 shadow-xs">
          <div className="pointer-events-none absolute -right-3 -top-3 size-20 rounded-full bg-destructive/20 blur-2xl" />
          <p className="text-xs font-medium text-muted-foreground">Nilai Dead Stock</p>
          <p className="mt-1.5 text-2xl font-semibold text-destructive">{formatRupiah(nilaiDeadStock)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Modal beku</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tren Penjualan */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Tren Penjualan</h3>
              <p className="text-xs text-muted-foreground">Nilai transaksi total</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(['bulanan', 'mingguan'] as const).map((p) => (
                <button key={p} type="button" onClick={() => setTrendPeriod(p)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    trendPeriod === p ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === 'bulanan' ? '6 Bulan' : '4 Minggu'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <BarChart data={trendData} />
          </div>
        </div>

        {/* Distribusi */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <h3 className="text-sm font-semibold">Distribusi Klasifikasi</h3>
          <p className="mb-4 text-xs text-muted-foreground">{PRODUCTS_ANALYTIC.length} SKU total</p>
          <Distribution products={PRODUCTS_ANALYTIC} />

          <div className="mt-5 space-y-2 border-t border-border pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Kriteria</p>
            {(Object.entries(KLASIFIKASI_CONFIG) as [Klasifikasi, typeof KLASIFIKASI_CONFIG[Klasifikasi]][]).map(([k, cfg]) => (
              <div key={k} className="text-[11px] text-muted-foreground">
                <span className={`font-medium ${cfg.cls}`}>{k}</span> — {cfg.desc}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Produk table */}
      <div className="rounded-xl border border-border bg-card shadow-xs">
        <div className="border-b border-border px-5 py-4">
          <h3 className="mb-3 text-sm font-semibold">Klasifikasi Produk</h3>
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button key={t} type="button" onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === t
                    ? t === 'Semua' ? 'bg-primary/10 text-primary'
                      : `${KLASIFIKASI_CONFIG[t as Klasifikasi].bg} ${KLASIFIKASI_CONFIG[t as Klasifikasi].cls}`
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
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
                <th className="px-5 py-3 font-medium text-right">Velocity</th>
                <th className="px-5 py-3 font-medium text-right">Margin</th>
                <th className="px-5 py-3 font-medium">Trend</th>
                <th className="px-5 py-3 font-medium text-right">Stockout</th>
                <th className="px-5 py-3 font-medium text-right">Return</th>
                <th className="px-5 py-3 font-medium">Klasifikasi</th>
                <th className="px-5 py-3 font-medium">Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayed.map((p) => {
                const cfg      = KLASIFIKASI_CONFIG[p.klasifikasi]
                const trendCfg = TREND_CONFIG[p.trendArah]
                const TrendIcon = trendCfg.icon
                const KlasIcon  = cfg.icon
                const marginPct = Math.round(((p.hargaJual - p.hargaPokok) / p.hargaJual) * 100)
                return (
                  <tr key={p.id} className="bg-card transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{p.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{p.sku} · {p.kategori}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      <span className={
                        p.stokAktif === 0 ? 'font-semibold text-destructive'
                        : p.stokAktif <= p.reorderPoint ? 'font-semibold text-chart-4'
                        : ''
                      }>
                        {p.stokAktif}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-xs text-muted-foreground">
                      {p.velocity > 0 ? `${p.velocity} /bln` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      <span className={marginPct >= 30 ? 'text-chart-3 font-semibold' : marginPct >= 15 ? 'text-foreground' : 'text-destructive font-semibold'}>
                        {marginPct}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${trendCfg.cls}`}>
                        <TrendIcon className="size-3" />
                        {trendCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {p.riwayatStockout > 0
                        ? <span className="font-semibold text-destructive">{p.riwayatStockout}×</span>
                        : <span className="text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {p.jumlahReturn > 0
                        ? <span className="font-semibold text-chart-4">{p.jumlahReturn}</span>
                        : <span className="text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.cls}`}>
                        <KlasIcon className="size-3" />
                        {p.klasifikasi}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs text-muted-foreground leading-relaxed">{REKOMENDASI[p.klasifikasi]}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
