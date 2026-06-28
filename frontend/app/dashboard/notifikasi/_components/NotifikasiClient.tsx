'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, BellOff, CheckCheck, AlertTriangle,
  Info, CheckCircle2, XCircle, Loader2,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────
interface Notification {
  id:         string
  targetRole: string
  title:      string
  message:    string
  type:       string
  link:       string | null
  isRead:     boolean
  createdAt:  string
}

// ── Config ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ElementType; iconCls: string; bg: string; label: string }> = {
  info:    { icon: Info,          iconCls: 'text-primary',     bg: 'bg-primary/10',     label: 'Info'    },
  warning: { icon: AlertTriangle, iconCls: 'text-chart-4',     bg: 'bg-chart-4/10',     label: 'Peringatan' },
  success: { icon: CheckCircle2,  iconCls: 'text-chart-3',     bg: 'bg-chart-3/10',     label: 'Sukses'  },
  error:   { icon: XCircle,       iconCls: 'text-destructive', bg: 'bg-destructive/10', label: 'Error'   },
}
const FALLBACK = TYPE_CONFIG.info

function formatRelative(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Baru saja'
  if (mins < 60)  return `${mins} mnt lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${days} hari lalu`
}

// ── Main ───────────────────────────────────────────────────────
export function NotifikasiClient({ role }: { role: string }) {
  const router  = useRouter()
  const [notifs,  setNotifs]  = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'Semua' | 'Belum Dibaca' | 'Sudah Dibaca'>('Semua')

  const loadNotifs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setNotifs(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadNotifs() }, [loadNotifs])

  const belumDibaca = notifs.filter(n => !n.isRead).length

  const displayed = notifs.filter(n => {
    if (filter === 'Belum Dibaca') return !n.isRead
    if (filter === 'Sudah Dibaca') return n.isRead
    return true
  })

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  async function markAllRead() {
    await Promise.all(notifs.filter(n => !n.isRead).map(n => fetch(`/api/notifications/${n.id}/read`, { method: 'PUT' })))
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  async function handleClick(notif: Notification) {
    await markRead(notif.id)
    if (notif.link) router.push(notif.link)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Notifikasi</h2>
          {belumDibaca > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {belumDibaca}
            </span>
          )}
        </div>
        {belumDibaca > 0 && (
          <button type="button" onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
            <CheckCheck className="size-3.5" /> Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(['Semua', 'Belum Dibaca', 'Sudah Dibaca'] as const).map(t => (
          <button key={t} type="button" onClick={() => setFilter(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              filter === t ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {t}{t === 'Belum Dibaca' && belumDibaca > 0 ? ` (${belumDibaca})` : ''}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <BellOff className="mb-3 size-10 opacity-25" />
          <p className="text-sm font-medium">Tidak ada notifikasi</p>
          <p className="mt-1 text-xs">
            {filter === 'Belum Dibaca' ? 'Semua notifikasi sudah dibaca.' : 'Belum ada notifikasi masuk.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(notif => {
            const cfg  = TYPE_CONFIG[notif.type] ?? FALLBACK
            const Icon = cfg.icon
            return (
              <button key={notif.id} type="button" onClick={() => handleClick(notif)}
                className={`group w-full rounded-xl border text-left transition-all ${
                  notif.isRead
                    ? 'border-border bg-card hover:bg-muted/30'
                    : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                }`}>
                <div className="flex gap-4 p-4">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                    <Icon className={`size-5 ${cfg.iconCls}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {!notif.isRead && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                        <p className="text-sm font-medium leading-snug">{notif.title}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatRelative(notif.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.iconCls}`}>
                        {cfg.label}
                      </span>
                      {notif.link && (
                        <span className="text-[11px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Lihat detail →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
