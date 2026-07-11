import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SADashboardClient } from './_components/SADashboardClient'

export const dynamic = 'force-dynamic'

type Sub = {
  id: string
  tenantName: string
  email: string
  tier: string
  status: string
  startDate: Date
  mrr: number
  createdAt: Date
}

export default async function SuperAdminDashboard() {
  const cookieStore = await cookies()
  if (cookieStore.get('zentory-superadmin')?.value !== 'authenticated') {
    redirect('/super-admin/login')
  }

  const rows = await prisma.$queryRaw<Sub[]>`
    SELECT id, "tenantName", email, tier, status, "startDate", mrr, "createdAt"
    FROM "SaasSubscription"
    ORDER BY "startDate" DESC
  `

  const subs = rows.map((r) => ({
    ...r,
    startDate: new Date(r.startDate).toISOString(),
    createdAt: new Date(r.createdAt).toISOString(),
  }))

  // KPI
  const totalTenants = subs.length
  const activeTenants = subs.filter((s) => s.status === 'Active').length
  const mrr = subs.filter((s) => s.status === 'Active').reduce((a, b) => a + b.mrr, 0)
  const totalRevenue = subs.reduce((acc, s) => {
    if (s.status !== 'Active') return acc
    const months = Math.max(
      1,
      Math.floor((Date.now() - new Date(s.startDate).getTime()) / (30 * 86_400_000)),
    )
    return acc + s.mrr * months
  }, 0)

  // Tier distribution
  const tierCount: Record<string, number> = { Gratis: 0, Kecil: 0, Sedang: 0, Besar: 0 }
  for (const s of subs) tierCount[s.tier] = (tierCount[s.tier] || 0) + 1

  // Monthly MRR trend (last 6 months)
  const monthlyMRR: { month: string; mrr: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    const monthMrr = subs
      .filter((s) => s.status === 'Active' && new Date(s.startDate) <= d)
      .reduce((a, b) => a + b.mrr, 0)
    monthlyMRR.push({ month: label, mrr: monthMrr })
  }

  return (
    <SADashboardClient
      subs={subs}
      kpi={{ totalTenants, activeTenants, mrr, totalRevenue }}
      tierCount={tierCount}
      monthlyMRR={monthlyMRR}
    />
  )
}
