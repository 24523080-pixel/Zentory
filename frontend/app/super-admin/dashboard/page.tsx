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
  startDate: string
  mrr: number
  createdAt: string
  userId: string | null
  userName: string | null
  userEmail: string | null
}

export default async function SuperAdminDashboard() {
  const cookieStore = await cookies()
  if (cookieStore.get('zentory-superadmin')?.value !== 'authenticated') {
    redirect('/super-admin/login')
  }

  const rows = await prisma.$queryRaw<{
    id: string; tenantName: string; email: string; tier: string
    status: string; startDate: Date; mrr: number; createdAt: Date
    userId: string | null; userName: string | null; userEmail: string | null
  }[]>`
    SELECT
      s.id, s."tenantName", s.email, s.tier, s.status,
      s."startDate", s.mrr, s."createdAt",
      s."userId",
      u.name AS "userName",
      u.email AS "userEmail"
    FROM "SaasSubscription" s
    LEFT JOIN "User" u ON s."userId" = u.id
    ORDER BY s."startDate" DESC
  `

  const subs: Sub[] = rows.map((r) => ({
    ...r,
    startDate: new Date(r.startDate).toISOString(),
    createdAt: new Date(r.createdAt).toISOString(),
    userId: r.userId ?? null,
    userName: r.userName ?? null,
    userEmail: r.userEmail ?? null,
  }))

  // Ambil stats sistem nyata untuk tenant yang terhubung
  const [productCount, txCount] = await Promise.all([
    prisma.product.count(),
    prisma.transaction.count(),
  ])

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
      liveStats={{ productCount, txCount }}
    />
  )
}
