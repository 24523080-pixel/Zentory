import { PackageCheck, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PenerimaanTable } from './_components/PenerimaanTable'
import { PageBanner } from '../_components/PageBanner'

export default async function PenerimaanBarangPage() {
  const list = await prisma.penerimaan.findMany({ select: { status: true } })

  const total      = list.length
  const menunggu   = list.filter(p => p.status === 'Menunggu').length
  const diterima   = list.filter(p => p.status === 'Diterima').length
  const adaSelisih = list.filter(p => p.status === 'Ada Selisih').length

  const SUMMARY = [
    { label: 'Total Penerimaan',    value: `${total} dokumen`,      icon: PackageCheck,  accent: 'text-primary',          glow: 'bg-primary/10'     },
    { label: 'Menunggu Verifikasi', value: `${menunggu} dokumen`,   icon: Clock,         accent: 'text-muted-foreground', glow: 'bg-muted'          },
    { label: 'Diterima Sempurna',   value: `${diterima} dokumen`,   icon: CheckCircle2,  accent: 'text-chart-3',          glow: 'bg-chart-3/10'     },
    { label: 'Ada Selisih',         value: `${adaSelisih} dokumen`, icon: AlertTriangle, accent: 'text-destructive',      glow: 'bg-destructive/10' },
  ]
  return (
    <>
      <header className="flex h-16 items-center border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Penerimaan Barang</h1>
          <p className="text-xs text-muted-foreground">Validasi dan catat barang masuk dari supplier</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">

        <PageBanner
          icon={PackageCheck}
          variant="green"
          label="Zentory · Logistik"
          title="Penerimaan Barang"
          description="Verifikasi dan catat barang masuk dari supplier sesuai PO."
        >
          {menunggu > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-4/15 px-3 py-1.5 text-xs font-semibold text-chart-4">
              <Clock className="size-3.5" />
              {menunggu} menunggu verifikasi
            </span>
          )}
        </PageBanner>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-white to-card p-4 shadow-xs"
            >
              <div className={`pointer-events-none absolute -right-3 -top-3 size-20 rounded-full ${s.glow} blur-2xl opacity-70`} />
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <s.icon className={`size-4 ${s.accent}`} />
              </div>
              <p className="text-xl font-semibold tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        <PenerimaanTable />

      </main>
    </>
  )
}
