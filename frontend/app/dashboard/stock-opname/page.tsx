import { cookies } from 'next/headers'
import { ClipboardCheck } from 'lucide-react'
import { StockOpnameClient } from './_components/StockOpnameClient'
import { PageBanner } from '../_components/PageBanner'

export default async function StockOpnamePage() {
  const cookieStore = await cookies()
  const raw  = cookieStore.get('zentory-token')?.value
  const user = raw ? JSON.parse(raw) : null
  const role = user?.role ?? 'admin'

  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 print:hidden">
        <div>
          <h1 className="text-base font-semibold">Stock Opname</h1>
          <p className="text-xs text-muted-foreground">{tanggal}</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
          {role}
        </span>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-5">
        <PageBanner
          icon={ClipboardCheck}
          variant="blue"
          label="Zentory · Audit Stok"
          title="Stock Opname"
          description="Hitung dan bandingkan stok fisik dengan data sistem untuk menjaga akurasi."
        />
        <StockOpnameClient role={role} />
      </main>
    </>
  )
}
