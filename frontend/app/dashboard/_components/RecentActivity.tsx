import { ArrowUpRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

const DOT: Record<string, string> = {
  info:    'bg-primary',
  warning: 'bg-chart-4',
  success: 'bg-chart-3',
  error:   'bg-destructive',
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60)   return `${diff} dtk lalu`
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}

export async function RecentActivity() {
  let notifications: { id: string; title: string; message: string; type: string; createdAt: Date }[] = []
  try {
    notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  } catch {}

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Aktivitas Terbaru</h2>
        <a href="/dashboard/notifikasi" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
          Lihat semua <ArrowUpRight className="size-3" />
        </a>
      </div>
      {notifications.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">Belum ada aktivitas.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-3">
              <span className={`mt-0.5 size-2 shrink-0 rounded-full ${DOT[n.type] ?? 'bg-muted-foreground'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-relaxed text-foreground">{n.title}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
