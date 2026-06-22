'use client'

import { Fragment, useState } from 'react'
import {
  Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, RotateCcw, Trash2, X,
  Search, ClipboardCheck,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  RETURN_LIST, ALASAN_OPTIONS, totalReturn,
  type SalesReturn, type ReturnStatus, type ReturnItem, type AlasanReturn,
} from '../_data'

const STATUS_BADGE: Record<ReturnStatus, string> = {
  'Menunggu Inspeksi':  'bg-blue-50 text-blue-600',
  'Menunggu Approval':  'bg-chart-4/15 text-chart-4',
  'Disetujui':          'bg-chart-3/15 text-chart-3',
  'Ditolak':            'bg-destructive/15 text-destructive',
}

const ALASAN_BADGE: Record<string, string> = {
  'Produk Rusak':  'bg-destructive/10 text-destructive',
  'Kadaluarsa':    'bg-chart-4/10 text-chart-4',
  'Salah Item':    'bg-primary/10 text-primary',
  'Kelebihan Qty': 'bg-muted text-muted-foreground',
  'Lainnya':       'bg-muted text-muted-foreground',
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

// ── Modal: Buat Return Baru (Kasir) ─────────────────────────────────────────

interface NewReturnItem {
  productName: string; sku: string; harga: string; qty: string
  alasan: AlasanReturn; catatan: string
}
const EMPTY_ITEM: NewReturnItem = {
  productName: '', sku: '', harga: '', qty: '1', alasan: 'Produk Rusak', catatan: '',
}

function NewReturnModal({
  onClose, onSubmit,
}: { onClose: () => void; onSubmit: (noTrx: string, items: ReturnItem[]) => void }) {
  const [noTrx, setNoTrx] = useState('')
  const [rows, setRows]   = useState<NewReturnItem[]>([{ ...EMPTY_ITEM }])

  function updateRow(idx: number, key: keyof NewReturnItem, val: string) {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r))
  }

  function submit() {
    if (!noTrx.trim()) return
    const items: ReturnItem[] = rows
      .filter((r) => r.productName.trim())
      .map((r, i) => ({
        productId:   `new-${i}`,
        productName: r.productName,
        sku:         r.sku || '-',
        harga:       parseInt(r.harga) || 0,
        qty:         parseInt(r.qty) || 1,
        alasan:      r.alasan,
        catatan:     r.catatan || undefined,
      }))
    if (!items.length) return
    onSubmit(noTrx.trim(), items)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-12">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold">Catat Sales Return</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">No. Transaksi Asal</label>
            <Input value={noTrx} onChange={(e) => setNoTrx(e.target.value)}
              placeholder="Contoh: TRX-2026-0901" className="font-mono" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Item yang Dikembalikan</label>
              <button type="button" onClick={() => setRows((p) => [...p, { ...EMPTY_ITEM }])}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Plus className="size-3" /> Tambah Item
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Nama Produk</th>
                    <th className="px-3 py-2.5 font-medium w-16">Qty</th>
                    <th className="px-3 py-2.5 font-medium w-28">Harga Satuan</th>
                    <th className="px-3 py-2.5 font-medium w-36">Alasan</th>
                    <th className="px-3 py-2.5 font-medium">Catatan</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2">
                        <Input value={row.productName} onChange={(e) => updateRow(idx, 'productName', e.target.value)}
                          placeholder="Nama produk" className="h-8 text-xs" />
                      </td>
                      <td className="px-2 py-2">
                        <Input type="number" min={1} value={row.qty} onChange={(e) => updateRow(idx, 'qty', e.target.value)}
                          className="h-8 text-xs text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <Input type="number" min={0} value={row.harga} onChange={(e) => updateRow(idx, 'harga', e.target.value)}
                          placeholder="0" className="h-8 text-xs text-right" />
                      </td>
                      <td className="px-2 py-2">
                        <select value={row.alasan} onChange={(e) => updateRow(idx, 'alasan', e.target.value as AlasanReturn)}
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:border-ring">
                          {ALASAN_OPTIONS.map((a) => <option key={a}>{a}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <Input value={row.catatan} onChange={(e) => updateRow(idx, 'catatan', e.target.value)}
                          placeholder="Opsional" className="h-8 text-xs" />
                      </td>
                      <td className="px-1 py-2">
                        {rows.length > 1 && (
                          <button type="button" onClick={() => setRows((p) => p.filter((_, i) => i !== idx))}
                            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:text-destructive">
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            Return akan masuk ke status <strong>Menunggu Inspeksi</strong> dan diteruskan ke Admin untuk pengecekan fisik barang.
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
            Batal
          </button>
          <button type="button" onClick={submit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Ajukan Return
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Inspeksi Admin ────────────────────────────────────────────────────

function InspeksiModal({
  ret, onClose, onKirim,
}: { ret: SalesReturn; onClose: () => void; onKirim: (catatan: string) => void }) {
  const [catatan, setCatatan] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
        <div className="mb-4 flex justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Search className="size-6 text-primary" />
          </span>
        </div>
        <h2 className="text-center text-base font-semibold">Hasil Inspeksi Fisik</h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {ret.noReturn} · {ret.items.length} item
        </p>
        <div className="mt-5 space-y-1.5">
          <label className="text-sm font-medium">Catatan Inspeksi</label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Deskripsikan kondisi fisik barang yang diterima..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-ring resize-none"
          />
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
            Batal
          </button>
          <button type="button" onClick={() => onKirim(catatan)}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Kirim ke Manager
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

interface Props { role: string }

export function SalesReturnClient({ role }: Props) {
  const [returns, setReturns]       = useState<SalesReturn[]>(RETURN_LIST)
  const [filter, setFilter]         = useState<'Semua' | ReturnStatus>('Semua')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [newModal, setNewModal]     = useState(false)
  const [inspeksiTarget, setInspeksiTarget] = useState<SalesReturn | null>(null)
  const [approveId, setApproveId]   = useState<string | null>(null)
  const [rejectId, setRejectId]     = useState<string | null>(null)

  const isKasir   = role === 'kasir'
  const isAdmin   = role === 'admin'
  const isManager = role === 'manager'

  const filtered = filter === 'Semua' ? returns : returns.filter((r) => r.status === filter)

  const menungguInspeksi = returns.filter((r) => r.status === 'Menunggu Inspeksi').length
  const menungguApproval = returns.filter((r) => r.status === 'Menunggu Approval').length
  const disetujui        = returns.filter((r) => r.status === 'Disetujui').length
  const totalRefund      = returns.filter((r) => r.status === 'Disetujui').reduce((s, r) => s + totalReturn(r), 0)

  function handleCreate(noTrx: string, items: ReturnItem[]) {
    const newReturn: SalesReturn = {
      id:          `sr-new-${Date.now()}`,
      noReturn:    `RTN-2026-${String(returns.length + 13).padStart(3, '0')}`,
      noTransaksi: noTrx,
      tanggal:     new Date().toISOString(),
      kasir:       'Anda',
      status:      'Menunggu Inspeksi',
      items,
    }
    setReturns((prev) => [newReturn, ...prev])
    setNewModal(false)
  }

  function handleKirimKeManager(id: string, catatan: string) {
    setReturns((prev) => prev.map((r) =>
      r.id === id
        ? { ...r, status: 'Menunggu Approval', inspeksiOleh: 'Admin', catatanInspeksi: catatan || 'Barang sudah diperiksa.' }
        : r
    ))
    setInspeksiTarget(null)
  }

  function handleApprove(id: string) {
    setReturns((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: 'Disetujui', disetujuiOleh: 'Manager' } : r
    ))
    setApproveId(null)
  }

  function handleReject(id: string) {
    setReturns((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: 'Ditolak', disetujuiOleh: 'Manager' } : r
    ))
    setRejectId(null)
  }

  const TABS: Array<'Semua' | ReturnStatus> = [
    'Semua', 'Menunggu Inspeksi', 'Menunggu Approval', 'Disetujui', 'Ditolak',
  ]

  return (
    <>
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Menunggu Inspeksi', value: menungguInspeksi, sub: 'perlu dicek Admin',       cls: 'text-blue-600',    glow: 'bg-blue-50'        },
            { label: 'Menunggu Approval', value: menungguApproval, sub: 'perlu keputusan Manager', cls: 'text-chart-4',     glow: 'bg-chart-4/10'    },
            { label: 'Disetujui',         value: disetujui,        sub: 'stok dikembalikan',        cls: 'text-chart-3',     glow: 'bg-chart-3/10'    },
            { label: 'Total Refund',      value: formatRupiah(totalRefund), sub: 'dari return disetujui', cls: 'text-primary', glow: 'bg-primary/10' },
          ].map((c) => (
            <div key={c.label} className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className={`pointer-events-none absolute right-3 top-3 size-8 rounded-full ${c.glow} blur-xl`} />
              <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
              <p className={`mt-1.5 text-2xl font-semibold ${c.cls}`}>{c.value}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Alur info banner */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">K</span>
          <span>Kasir catat return</span>
          <span className="text-border">→</span>
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">A</span>
          <span>Admin inspeksi fisik</span>
          <span className="text-border">→</span>
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">M</span>
          <span>Manager setujui / tolak</span>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex flex-wrap gap-1">
              {TABS.map((t) => (
                <button key={t} type="button" onClick={() => setFilter(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === t
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                  {t === 'Menunggu Inspeksi' && menungguInspeksi > 0 ? ` (${menungguInspeksi})` : ''}
                  {t === 'Menunggu Approval' && menungguApproval > 0 ? ` (${menungguApproval})` : ''}
                </button>
              ))}
            </div>
            {(isKasir || isAdmin) && (
              <button type="button" onClick={() => setNewModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="size-3.5" /> Return Baru
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="w-8 px-5 py-3" />
                  <th className="px-5 py-3 font-medium">No. Return</th>
                  <th className="px-5 py-3 font-medium">No. Transaksi</th>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Kasir</th>
                  <th className="px-5 py-3 font-medium text-right">Nilai</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ret) => (
                  <Fragment key={ret.id}>
                    <tr className="cursor-pointer bg-card transition-colors hover:bg-muted/30"
                      onClick={() => setExpanded(expanded === ret.id ? null : ret.id)}>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {expanded === ret.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-medium">{ret.noReturn}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{ret.noTransaksi}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatTanggal(ret.tanggal)}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{ret.kasir}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-medium">{formatRupiah(totalReturn(ret))}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[ret.status]}`}>
                          {ret.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        {/* Admin: inspeksi fisik */}
                        {isAdmin && ret.status === 'Menunggu Inspeksi' && (
                          <button type="button" onClick={() => setInspeksiTarget(ret)}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20">
                            <ClipboardCheck className="size-3" /> Inspeksi
                          </button>
                        )}
                        {/* Manager: setujui/tolak */}
                        {isManager && ret.status === 'Menunggu Approval' && (
                          <div className="flex gap-1.5">
                            <button type="button" onClick={() => setApproveId(ret.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-chart-3/10 px-2.5 py-1 text-xs font-medium text-chart-3 hover:bg-chart-3/20">
                              <CheckCircle2 className="size-3" /> Setujui
                            </button>
                            <button type="button" onClick={() => setRejectId(ret.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20">
                              <XCircle className="size-3" /> Tolak
                            </button>
                          </div>
                        )}
                        {ret.status !== 'Menunggu Inspeksi' && ret.status !== 'Menunggu Approval' && (
                          <span className="text-xs text-muted-foreground">
                            {ret.disetujuiOleh ? `Oleh ${ret.disetujuiOleh}` : '—'}
                          </span>
                        )}
                        {!isAdmin && !isManager && ret.status === 'Menunggu Inspeksi' && (
                          <span className="text-xs text-muted-foreground">Menunggu Admin</span>
                        )}
                        {!isManager && ret.status === 'Menunggu Approval' && (
                          <span className="text-xs text-muted-foreground">Menunggu Manager</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded detail */}
                    {expanded === ret.id && (
                      <tr className="bg-muted/20">
                        <td colSpan={8} className="px-8 py-4">
                          {ret.catatanInspeksi && (
                            <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
                              <span className="font-semibold text-primary">Catatan Inspeksi Admin ({ret.inspeksiOleh}):</span> {ret.catatanInspeksi}
                            </div>
                          )}
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Item yang Dikembalikan
                          </p>
                          <div className="overflow-hidden rounded-lg border border-border bg-card">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                  <th className="px-4 py-2.5 font-medium">Produk</th>
                                  <th className="px-4 py-2.5 font-medium text-right">Qty</th>
                                  <th className="px-4 py-2.5 font-medium text-right">Harga</th>
                                  <th className="px-4 py-2.5 font-medium text-right">Subtotal</th>
                                  <th className="px-4 py-2.5 font-medium">Alasan</th>
                                  <th className="px-4 py-2.5 font-medium">Catatan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {ret.items.map((item) => (
                                  <tr key={item.productId} className="bg-card">
                                    <td className="px-4 py-2.5">
                                      <p className="font-medium">{item.productName}</p>
                                      <p className="font-mono text-[10px] text-muted-foreground">{item.sku}</p>
                                    </td>
                                    <td className="px-4 py-2.5 text-right tabular-nums">{item.qty}</td>
                                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(item.harga)}</td>
                                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatRupiah(item.harga * item.qty)}</td>
                                    <td className="px-4 py-2.5">
                                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${ALASAN_BADGE[item.alasan] ?? 'bg-muted text-muted-foreground'}`}>
                                        {item.alasan}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-muted-foreground">{item.catatan ?? '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-muted/40">
                                <tr>
                                  <td colSpan={3} className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Total Refund</td>
                                  <td className="px-4 py-2.5 text-right tabular-nums font-bold">{formatRupiah(totalReturn(ret))}</td>
                                  <td colSpan={2} />
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-16 text-muted-foreground">
                <RotateCcw className="mb-3 size-8 opacity-30" />
                <p className="text-sm">Tidak ada data untuk filter ini</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Buat Return Baru */}
      {newModal && <NewReturnModal onClose={() => setNewModal(false)} onSubmit={handleCreate} />}

      {/* Modal: Inspeksi Admin */}
      {inspeksiTarget && (
        <InspeksiModal
          ret={inspeksiTarget}
          onClose={() => setInspeksiTarget(null)}
          onKirim={(catatan) => handleKirimKeManager(inspeksiTarget.id, catatan)}
        />
      )}

      {/* Modal: Konfirmasi Setujui (Manager) */}
      {approveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setApproveId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-chart-3/10">
                <CheckCircle2 className="size-6 text-chart-3" />
              </span>
            </div>
            <h2 className="text-center text-base font-semibold">Setujui Return?</h2>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Stok produk akan dikembalikan ke inventaris aktif dan refund diproses.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setApproveId(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                Batal
              </button>
              <button type="button" onClick={() => handleApprove(approveId)}
                className="flex-1 rounded-lg bg-chart-3 py-2.5 text-sm font-medium text-white hover:bg-chart-3/90">
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Tolak (Manager) */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setRejectId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="size-6 text-destructive" />
              </span>
            </div>
            <h2 className="text-center text-base font-semibold">Tolak Return?</h2>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Return ditolak. Barang tidak dikembalikan ke stok aktif.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setRejectId(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                Batal
              </button>
              <button type="button" onClick={() => handleReject(rejectId)}
                className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-medium text-white hover:bg-destructive/90">
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
