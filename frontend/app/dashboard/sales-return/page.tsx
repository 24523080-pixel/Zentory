import { cookies } from 'next/headers'
import { RotateCcw } from 'lucide-react'
import { SalesReturnClient } from './_components/SalesReturnClient'
import { PageBanner } from '../_components/PageBanner'

export default async function SalesReturnPage() {
  const cookieStore = await cookies()
  const raw  = cookieStore.get('zentory-token')?.value
  const user = raw ? JSON.parse(raw) : null
  const role = user?.role ?? 'kasir'

  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 print:hidden">
        <div>
          <h1 className="text-base font-semibold">Sales Return</h1>
          <p className="text-xs text-muted-foreground">{tanggal}</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
          {role}
        </span>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-5">
        <PageBanner
          icon={RotateCcw}
          variant="red"
          label="Zentory · Retur"
          title="Sales Return"
          description="Kelola pengembalian barang dari pelanggan melalui alur inspeksi bertahap."
        />
        <SalesReturnClient role={role} />
      </main>
    </>
  )
}
