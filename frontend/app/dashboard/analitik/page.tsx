import { BarChart2 } from 'lucide-react'
import { AnalitikClient } from './_components/AnalitikClient'
import { PageBanner } from '../_components/PageBanner'

export default function AnalitikPage() {
  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Analitik & DSS</h1>
          <p className="text-xs text-muted-foreground">{tanggal}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          Manager View
        </span>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-5">
        <PageBanner
          icon={BarChart2}
          variant="blue"
          label="Decision Support System"
          title="Analitik & Klasifikasi Stok"
          description="Identifikasi Fast, Slow, dan Dead Stock dari data penjualan 6 bulan terakhir."
        />
        <AnalitikClient />
      </main>
    </>
  )
}
