import { cookies } from 'next/headers'
import { Sidebar }    from './_components/Sidebar'
import { MobileNav }  from './_components/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const raw  = cookieStore.get('zentory-token')?.value
  const user = raw
    ? (JSON.parse(raw) as { email: string; name: string; role: string })
    : null

  const role     = user?.role     ?? 'admin'
  const userName = user?.name     ?? 'Pengguna'

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} userName={userName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileNav role={role} userName={userName} />
        {children}
      </div>
    </div>
  )
}
