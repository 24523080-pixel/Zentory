import { cookies } from 'next/headers'
import { Settings } from 'lucide-react'
import { PengaturanClient } from './_components/PengaturanClient'
import { PageBanner } from '../_components/PageBanner'

export default async function PengaturanPage() {
  const cookieStore = await cookies()
  const raw  = cookieStore.get('zentory-token')?.value
  const user = raw ? JSON.parse(raw) : null
  const role = user?.role  ?? 'manager'
  const name = user?.name  ?? 'Pengguna'
  const email = user?.email ?? ''

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div>
          <h1 className="text-base font-semibold">Pengaturan</h1>
          <p className="text-xs text-muted-foreground">Kelola akun, pengguna, dan konfigurasi toko</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-5">
        <PageBanner
          icon={Settings}
          variant="muted"
          label="Zentory · Konfigurasi"
          title="Pengaturan"
          description="Kelola profil akun, pengguna, dan konfigurasi toko Anda."
        />
        <PengaturanClient role={role} userName={name} userEmail={email} />
      </main>
    </>
  )
}
