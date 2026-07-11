import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isAuth = cookieStore.get('zentory-superadmin')?.value === 'authenticated'
  const isLoginPage = false // layout wraps all sub-routes; login page handled below

  return <>{children}</>
}
