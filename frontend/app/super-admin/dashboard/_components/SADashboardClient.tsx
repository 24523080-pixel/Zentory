'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Boxes, TrendingUp, Users, DollarSign, Activity,
  LogOut, RefreshCw, ChevronUp, ChevronDown,
} from 'lucide-react'

type Sub = {
  id: string; tenantName: string; email: string; tier: string
  status: string; startDate: string; mrr: number; createdAt: string
}
type Props = {
  subs: Sub[]
  kpi: { totalTenants: number; activeTenants: number; mrr: number; totalRevenue: number }
  tierCount: Record<string, number>
  monthlyMRR: { month: string; mrr: number }[]
}

const TIER_COLOR: Record<string, string> = {
  Gratis: 'bg-slate-500',
  Kecil: 'bg-blue-500',
  Sedang: 'bg-violet-500',
  Besar: 'bg-amber-500',
}
const TIER_BADGE: Record<string, string> = {
  Gratis: 'bg-slate-800 text-slate-300 border-slate-700',
  Kecil: 'bg-blue-950 text-blue-300 border-blue-800',
  Sedang: 'bg-violet-950 text-violet-300 border-violet-800',
  Besar: 'bg-amber-950 text-amber-300 border-amber-800',
}
const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  Trial: 'bg-yellow-950 text-yellow-300 border-yellow-800',
  Inactive: 'bg-red-950 text-red-300 border-red-800',
}

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function SADashboardClient({ subs, kpi, tierCount, monthlyMRR }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const maxMRR = Math.max(...monthlyMRR.map((m) => m.mrr), 1)
  const maxTier = Math.max(...Object.values(tierCount), 1)
  const totalTier = Object.values(tierCount).reduce((a, b) => a + b, 0)

  const sortedSubs = [...subs].sort((a, b) => {
    const diff = new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    return sortDir === 'desc' ? diff : -diff
  })

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/super-admin/logout', { method: 'POST' })
    router.push('/super-admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
              <Boxes className="size-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Zentory</span>
              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">Owner</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.refresh()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </button>
            <button
              onClick={logout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut className="size-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-1 text-lg font-bold text-white sm:text-xl">Dashboard Keuntungan</h1>
        <p className="mb-6 text-sm text-slate-400">Pantau revenue dan pertumbuhan subscriber platform Zentory.</p>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard
            label="Total Tenant"
            value={kpi.totalTenants.toString()}
            sub="Semua plan"
            icon={<Users className="size-5" />}
            color="text-blue-400"
            bg="bg-blue-950/50 border-blue-900"
          />
          <KpiCard
            label="Tenant Aktif"
            value={kpi.activeTenants.toString()}
            sub="Status Active"
            icon={<Activity className="size-5" />}
            color="text-emerald-400"
            bg="bg-emerald-950/50 border-emerald-900"
          />
          <KpiCard
            label="MRR"
            value={fmt(kpi.mrr)}
            sub="Monthly Recurring Revenue"
            icon={<TrendingUp className="size-5" />}
            color="text-violet-400"
            bg="bg-violet-950/50 border-violet-900"
          />
          <KpiCard
            label="Total Revenue"
            value={fmt(kpi.totalRevenue)}
            sub="Estimasi kumulatif"
            icon={<DollarSign className="size-5" />}
            color="text-amber-400"
            bg="bg-amber-950/50 border-amber-900"
          />
        </div>

        {/* Charts row */}
        <div className="mb-6 grid gap-4 lg:grid-cols-5">
          {/* MRR Trend */}
          <div className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">Tren MRR (6 Bulan Terakhir)</h2>
            <div className="flex h-36 items-end gap-2">
              {monthlyMRR.map((m) => {
                const pct = (m.mrr / maxMRR) * 100
                return (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-slate-400">{m.mrr > 0 ? (m.mrr / 1_000_000).toFixed(1) + 'jt' : '-'}</span>
                    <div className="relative w-full rounded-t-md bg-violet-600/20" style={{ height: '90px' }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-violet-500 transition-all duration-500"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">Distribusi Plan</h2>
            <div className="flex flex-col gap-3">
              {Object.entries(tierCount).map(([tier, count]) => {
                const pct = Math.round((count / totalTier) * 100)
                return (
                  <div key={tier}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-slate-300">{tier}</span>
                      <span className="text-xs font-medium text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${TIER_COLOR[tier] || 'bg-slate-500'}`}
                        style={{ width: `${(count / maxTier) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Donut-like summary */}
            <div className="mt-5 rounded-lg bg-slate-800/50 p-3">
              <p className="mb-2 text-xs font-medium text-slate-400">Revenue by Tier (MRR)</p>
              {[
                { t: 'Besar', n: tierCount['Besar'] || 0, mrr: 499_000 },
                { t: 'Sedang', n: tierCount['Sedang'] || 0, mrr: 249_000 },
                { t: 'Kecil', n: tierCount['Kecil'] || 0, mrr: 99_000 },
              ].map(({ t, n, mrr }) => (
                <div key={t} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-slate-400">{t}</span>
                  <span className="text-xs font-semibold text-slate-200">{fmt(n * mrr)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscriber Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-white">Daftar Subscriber</h2>
            <button
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              Tanggal {sortDir === 'desc' ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 sm:px-5">Tenant</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Plan</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">MRR</th>
                  <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-slate-500 sm:table-cell sm:px-5">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedSubs.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-800/40">
                    <td className="px-4 py-3 sm:px-5">
                      <p className="font-medium text-white text-xs sm:text-sm">{s.tenantName}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TIER_BADGE[s.tier] || ''}`}>
                        {s.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[s.status] || ''}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-200 text-xs sm:text-sm">
                      {s.mrr === 0 ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        fmt(s.mrr)
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-400 sm:table-cell sm:px-5">
                      {new Date(s.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-800 px-4 py-3 sm:px-5">
            <p className="text-xs text-slate-500">{subs.length} total subscriber</p>
          </div>
        </div>
      </main>
    </div>
  )
}

function KpiCard({
  label, value, sub, icon, color, bg,
}: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string; bg: string
}) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-white leading-tight sm:text-xl">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  )
}
