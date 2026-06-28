import { Bell, TrendingUp } from 'lucide-react'
import { StatCards }      from './_components/StatCards'
import { SalesChart }     from './_components/SalesChart'
import { RecentActivity } from './_components/RecentActivity'
import { StockTable }     from './_components/StockTable'
import { PageBanner }     from './_components/PageBanner'

export default function DashboardPage() {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">{dateStr}</p>
        </div>
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-chart-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <PageBanner
          icon={TrendingUp}
          variant="blue"
          label="Zentory · Overview"
          title="Selamat datang di Dashboard"
          description="Ringkasan kondisi inventaris, penjualan, dan aktivitas toko hari ini."
        />
        <StatCards />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <SalesChart />
          <RecentActivity />
        </div>
        <StockTable />
      </main>
    </>
  )
}
