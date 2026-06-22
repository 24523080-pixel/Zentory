import { cookies } from 'next/headers'
import { Sidebar } from './_components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const raw  = cookieStore.get('zentory-token')?.value
  const user = raw
    ? (JSON.parse(raw) as { email: string; name: string; role: string })
    : null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={user?.role ?? 'admin'} userName={user?.name ?? 'Pengguna'} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
