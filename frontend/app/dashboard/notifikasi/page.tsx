import { cookies } from 'next/headers'
import { Bell } from 'lucide-react'
import { NotifikasiClient } from './_components/NotifikasiClient'
import { PageBanner } from '../_components/PageBanner'

export default async function NotifikasiPage() {
  const cookieStore = await cookies()
  const raw  = cookieStore.get('zentory-token')?.value
  const user = raw ? JSON.parse(raw) : null
  const role = user?.role ?? 'admin'

  return (
    <>
      <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-6">
        <h1 className="text-base font-semibold">Notifikasi</h1>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-5">
        <PageBanner
          icon={Bell}
          variant="orange"
          label="Zentory · Notifikasi"
          title="Pusat Notifikasi"
          description="Pantau peringatan stok kritis, status PO, dan aktivitas sistem secara real-time."
        />
        <NotifikasiClient role={role} />
      </main>
    </>
  )
}
