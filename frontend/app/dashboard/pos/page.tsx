import { POSInterface } from './_components/POSInterface'

export default function POSPage() {
  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">POS / Transaksi</h1>
          <p className="text-xs text-muted-foreground">{tanggal}</p>
        </div>
        <span className="rounded-full bg-chart-3/15 px-2.5 py-1 text-xs font-medium text-chart-3">
          ● Kasir Aktif
        </span>
      </header>

      {/* overflow-hidden agar katalog + keranjang punya scroll masing-masing */}
      <main className="flex-1 overflow-hidden">
        <POSInterface />
      </main>
    </>
  )
}
