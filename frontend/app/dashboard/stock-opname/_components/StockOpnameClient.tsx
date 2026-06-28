'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, Plus, CheckCircle2, XCircle,
  AlertTriangle, Snowflake, X, ClipboardList, Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const AREA_OPTIONS = ['Area Minuman', 'Area Kemasan', 'Area Bumbu', 'Area Snack', 'Semua Area']
const AREA_TO_KATEGORI: Record<string, string[]> = {
  'Area Minuman': ['Minuman'],
  'Area Kemasan': ['Kemasan'],
  'Area Bumbu':   ['Bumbu'],
  'Area Snack':   ['Makanan', 'Snack'],
  'Semua Area':   [],
}

const STATUS_BADGE: Record<string, string> = {
  'Aktif':             'bg-blue-50 text-blue-600',
  'Menunggu Approval': 'bg-chart-4/15 text-chart-4',
  'Disetujui':         'bg-chart-3/15 text-chart-3',
  'Ditolak':           'bg-destructive/15 text-destructive',
}

interface OpnameItem {
  id:          string
  sku:         string
  productName: string
  stokSistem:  number
  stokFisik:   number | null
  selisih:     number | null
}
interface StockOpname {
  id:             string
  noOpname:       string
  area:           string
  tanggalMulai:   string
  tanggalSelesai: string | null
  status:         string
  createdBy?:     { name: string } | null
  approvedByName: string | null
  items:          OpnameItem[]
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props { role: string }

export function StockOpnameClient({ role }: Props) {
  const [sessions, setSessions]     = useState<StockOpname[]>([])
  const [loading, setLoading]       = useState(true)

  const loadSessions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stock-opname')
      if (res.ok) setSessions(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])
  const [view, setView]             = useState<'list' | 'detail'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [counts, setCounts]         = useState<Record<string, string>>({})
  const [freezeModal, setFreezeModal]             = useState(false)
  const [newArea, setNewArea]                     = useState(AREA_OPTIONS[0])
  const [submitModal, setSubmitModal]             = useState(false)
  const [showVarianceWarning, setShowVarianceWarning] = useState(false)
  const [variancePct, setVariancePct]             = useState(0)

  const selected = sessions.find((s) => s.id === selectedId)

  async function startOpname() {
    const kategoriList = AREA_TO_KATEGORI[newArea]
    const res = await fetch('/api/stock-opname', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area: newArea, kategoriList: kategoriList?.length ? kategoriList : null }),
    })
    if (res.ok) {
      const created: StockOpname = await res.json()
      setSessions(prev => [created, ...prev])
      setSelectedId(created.id)
      setCounts({})
      setFreezeModal(false)
      setView('detail')
    }
  }

  // ── List view ──────────────────────────────────────────────────────────────

  if (view === 'list') {
    const berlangsung     = sessions.filter((s) => s.status === 'Aktif').length
    const menunggu        = sessions.filter((s) => s.status === 'Menunggu Approval').length
    const selesai         = sessions.filter((s) => s.status === 'Disetujui').length

    return (
      <>
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Aktif',            value: berlangsung, icon: Snowflake,    cls: 'text-blue-600',    glow: 'bg-blue-50'        },
              { label: 'Menunggu Approval',value: menunggu,    icon: AlertTriangle, cls: 'text-chart-4',    glow: 'bg-chart-4/10'    },
              { label: 'Disetujui Bulan Ini',value: selesai,  icon: CheckCircle2,  cls: 'text-chart-3',    glow: 'bg-chart-3/10'    },
            ].map((s) => (
              <div key={s.label} className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className={`pointer-events-none absolute right-3 top-3 size-8 rounded-full ${s.glow} blur-xl`} />
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  <s.icon className={`size-4 ${s.cls}`} />
                </div>
                <p className="text-2xl font-semibold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Riwayat Stock Opname</h2>
              <button
                type="button"
                onClick={() => setFreezeModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                Mulai Opname Baru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">No. Opname</th>
                    <th className="px-5 py-3 font-medium">Area</th>
                    <th className="px-5 py-3 font-medium">Mulai</th>
                    <th className="px-5 py-3 font-medium">Dibuat Oleh</th>
                    <th className="px-5 py-3 font-medium">Item</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium sr-only">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={7} className="px-5 py-10 text-center"><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /></td></tr>
                  ) : sessions.map((s) => (
                    <tr key={s.id} className="bg-card transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium">{s.noOpname}</td>
                      <td className="px-5 py-3.5 font-medium">{s.area}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatTanggal(s.tanggalMulai)}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{s.createdBy?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 tabular-nums">{s.items.length}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[s.status]}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => { setSelectedId(s.id); setView('detail') }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {s.status === 'Aktif' ? 'Input' : 'Lihat'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal: Konfirmasi Freeze */}
        {freezeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setFreezeModal(false)} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-4 flex justify-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-blue-50">
                  <Snowflake className="size-6 text-blue-600" />
                </span>
              </div>
              <h2 className="text-center text-base font-semibold">Mulai Stock Opname</h2>
              <p className="mt-1.5 text-center text-xs text-muted-foreground">
                Stok di area yang dipilih akan di-<strong>freeze</strong> selama penghitungan berlangsung.
                Transaksi kasir untuk produk di area ini akan diblokir sementara.
              </p>
              <div className="mt-5 space-y-1.5">
                <label className="text-sm font-medium">Pilih Area</label>
                <select
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-ring"
                >
                  {AREA_OPTIONS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFreezeModal(false)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={startOpname}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Freeze & Mulai
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // ── Detail view ────────────────────────────────────────────────────────────

  if (!selected) return null

  const isBerlangsung = selected.status === 'Aktif'
  const isMenunggu    = selected.status === 'Menunggu Approval'
  const isManager     = role === 'manager'

  // counts keyed by item.id (opname item ID)
  const itemsWithVariance = selected.items.map((item) => {
    const fisik = isBerlangsung
      ? (counts[item.id] !== undefined ? parseInt(counts[item.id]) || 0 : item.stokFisik)
      : item.stokFisik
    const variance = fisik !== null ? fisik - item.stokSistem : null
    return { ...item, stokFisikResolved: fisik, variance }
  })

  const belumDihitung = isBerlangsung
    ? itemsWithVariance.filter((i) => i.stokFisikResolved === null).length
    : 0

  async function handleApprove(confirmed = false) {
    const res = await fetch(`/api/stock-opname/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', confirmed }),
    })
    if (res.status === 409) {
      const d = await res.json()
      if (d.requiresConfirmation) {
        setVariancePct(d.variancePct)
        setShowVarianceWarning(true)
        return
      }
    }
    if (res.ok) {
      const updated: StockOpname = await res.json()
      setSessions(prev => prev.map(s => s.id === selectedId ? updated : s))
      setView('list')
    }
  }

  async function handleReject() {
    const res = await fetch(`/api/stock-opname/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    })
    if (res.ok) {
      const updated: StockOpname = await res.json()
      setSessions(prev => prev.map(s => s.id === selectedId ? updated : s))
      setView('list')
    }
  }

  async function handleSubmit() {
    const res = await fetch(`/api/stock-opname/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit', counts }),
    })
    if (res.ok) {
      const updated: StockOpname = await res.json()
      setSessions(prev => prev.map(s => s.id === selectedId ? updated : s))
      setSubmitModal(false)
      setView('list')
    } else {
      const err = await res.text()
      alert(`Gagal submit opname (${res.status}): ${err}`)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">{selected.noOpname}</h2>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[selected.status]}`}>
                {selected.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{selected.area} · Dibuat oleh {selected.createdBy?.name ?? '—'}</p>
          </div>
          {/* Tombol Manager */}
          {isMenunggu && isManager && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReject}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                <XCircle className="size-3.5" /> Tolak
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-lg bg-chart-3 px-3 py-2 text-xs font-medium text-white hover:bg-chart-3/90"
              >
                <CheckCircle2 className="size-3.5" /> Setujui Adjustment
              </button>
            </div>
          )}
        </div>

        {/* Progress bar (untuk status berlangsung) */}
        {isBerlangsung && (
          <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Progress Penghitungan</span>
              <span className="text-muted-foreground">
                {selected.items.length - belumDihitung} / {selected.items.length} item selesai
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${((selected.items.length - belumDihitung) / selected.items.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Tabel item */}
        <div className="rounded-xl border border-border bg-card shadow-xs">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">
              {isBerlangsung ? 'Input Stok Fisik' : 'Laporan Variance'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Produk</th>
                  <th className="px-5 py-3 font-medium text-right">Stok Sistem</th>
                  <th className="px-5 py-3 font-medium text-right">Stok Fisik</th>
                  <th className="px-5 py-3 font-medium text-right">Variance</th>
                  <th className="px-5 py-3 font-medium text-right">Nilai Selisih</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itemsWithVariance.map((item) => {
                  const v = item.variance
                  const varClass = v === null ? '' : v < 0 ? 'text-destructive' : v > 0 ? 'text-chart-3' : 'text-muted-foreground'

                  return (
                    <tr key={item.id} className="bg-card">
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{item.productName}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{item.sku}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">{item.stokSistem}</td>
                      <td className="px-5 py-3.5 text-right">
                        {isBerlangsung ? (
                          <Input
                            type="number"
                            min={0}
                            placeholder="—"
                            defaultValue={item.stokFisik ?? ''}
                            onChange={(e) => setCounts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            className="ml-auto h-8 w-20 text-right text-sm tabular-nums"
                          />
                        ) : (
                          <span className="tabular-nums">{item.stokFisikResolved ?? '—'}</span>
                        )}
                      </td>
                      <td className={`px-5 py-3.5 text-right tabular-nums font-semibold ${varClass}`}>
                        {v === null ? '—' : v === 0 ? '✓' : v > 0 ? `+${v}` : v}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-xs text-muted-foreground">—</td>
                      <td className="px-5 py-3.5">
                        {v === null ? (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Belum</span>
                        ) : v === 0 ? (
                          <span className="inline-flex items-center rounded-full bg-chart-3/15 px-2 py-0.5 text-xs font-medium text-chart-3">Sesuai</span>
                        ) : v < 0 ? (
                          <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">Kurang</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Lebih</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Tombol submit (Admin, status berlangsung) */}
        {isBerlangsung && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSubmitModal(true)}
              disabled={belumDihitung > 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ClipboardList className="size-4" />
              {belumDihitung > 0 ? `Selesaikan ${belumDihitung} item lagi` : 'Selesai — Ajukan ke Manager'}
            </button>
          </div>
        )}
      </div>

      {/* Modal peringatan selisih besar (NFR-002) */}
      {showVarianceWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowVarianceWarning(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <button type="button" onClick={() => setShowVarianceWarning(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
            <div className="mb-4 flex justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-6 text-destructive" />
              </span>
            </div>
            <h2 className="text-center text-base font-semibold">Perhatian: Selisih Besar</h2>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Selisih stok mencapai{' '}
              <span className="font-semibold text-destructive">{variancePct}%</span>{' '}
              dari nilai inventaris, melebihi ambang batas 10% (NFR-002).
              Konfirmasi otorisasi Manager diperlukan untuk melanjutkan.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowVarianceWarning(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                Batal
              </button>
              <button
                type="button"
                onClick={() => { setShowVarianceWarning(false); handleApprove(true) }}
                className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-medium text-white hover:bg-destructive/90"
              >
                Ya, Setujui Tetap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal konfirmasi submit */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSubmitModal(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <button type="button" onClick={() => setSubmitModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
            <div className="mb-4 flex justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <ClipboardList className="size-6 text-primary" />
              </span>
            </div>
            <h2 className="text-center text-base font-semibold">Kirim Laporan Opname?</h2>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Laporan variance akan dikirim ke Manager untuk disetujui.
              Stok akan di-unfreeze setelah Manager memberikan keputusan.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setSubmitModal(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                Batal
              </button>
              <button type="button" onClick={handleSubmit}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Ya, Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
