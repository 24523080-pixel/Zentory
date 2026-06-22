'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, BellOff, CheckCheck, AlertTriangle,
  ShoppingCart, Package, RotateCcw, ClipboardList, Settings, TrendingDown,
} from 'lucide-react'
import { NOTIFIKASI_LIST, type Notifikasi, type NotifType } from '../_data'

const TYPE_CONFIG: Record<NotifType, {
  icon: React.ElementType; iconCls: string; bg: string; label: string
}> = {
  reorder:         { icon: TrendingDown,   iconCls: 'text-chart-4',   bg: 'bg-chart-4/10',   label: 'Reorder Point'    },
  stockout:        { icon: AlertTriangle,  iconCls: 'text-destructive',bg: 'bg-destructive/10',label: 'Stok Habis'      },
  po_approved:     { icon: ShoppingCart,   iconCls: 'text-chart-3',   bg: 'bg-chart-3/10',   label: 'PO Disetujui'    },
  po_rejected:     { icon: ShoppingCart,   iconCls: 'text-destructive',bg: 'bg-destructive/10',label: 'PO Ditolak'     },
  po_received:     { icon: Package,        iconCls: 'text-primary',   bg: 'bg-primary/10',   label: 'Barang Masuk'    },
  return_inspeksi: { icon: RotateCcw,      iconCls: 'text-primary',   bg: 'bg-primary/10',   label: 'Return Inspeksi' },
  return_decision: { icon: RotateCcw,      iconCls: 'text-chart-3',   bg: 'bg-chart-3/10',   label: 'Return Selesai'  },
  opname:          { icon: ClipboardList,  iconCls: 'text-chart-4',   bg: 'bg-chart-4/10',   label: 'Stock Opname'    },
  system:          { icon: Settings,       iconCls: 'text-muted-foreground', bg: 'bg-muted', label: 'Sistem'          },
}

const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-destructive',
  medium: 'bg-chart-4',
  low:    'bg-muted-foreground',
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Baru saja'
  if (mins < 60)  return `${mins} mnt lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${days} hari lalu`
}

// ── Main ────────────────────────────────────────────────────────────────────

interface Props { role: string }

export function NotifikasiClient({ role }: Props) {
  const router = useRouter()
  const initial = NOTIFIKASI_LIST.filter((n) => n.targetRole.includes(role))
  const [notifs, setNotifs] = useState<Notifikasi[]>(initial)
  const [filter, setFilter] = useState<'Semua' | 'Belum Dibaca' | 'Sudah Dibaca'>('Semua')

  const belumDibaca = notifs.filter((n) => !n.dibaca).length

  const displayed = notifs.filter((n) => {
    if (filter === 'Belum Dibaca') return !n.dibaca
    if (filter === 'Sudah Dibaca') return n.dibaca
    return true
  })

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, dibaca: true } : n))
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, dibaca: true })))
  }

  function handleClick(notif: Notifikasi) {
    markRead(notif.id)
    if (notif.link) router.push(notif.link)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header bar */}
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
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <CheckCheck className="size-3.5" />
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(['Semua', 'Belum Dibaca', 'Sudah Dibaca'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              filter === t
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
            {t === 'Belum Dibaca' && belumDibaca > 0 ? ` (${belumDibaca})` : ''}
          </button>
        ))}
      </div>

      {/* Notif list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <BellOff className="mb-3 size-10 opacity-25" />
          <p className="text-sm font-medium">Tidak ada notifikasi</p>
          <p className="mt-1 text-xs">
            {filter === 'Belum Dibaca' ? 'Semua notifikasi sudah dibaca.' : 'Belum ada notifikasi masuk.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type]
            const Icon = cfg.icon
            return (
              <button
                key={notif.id}
                type="button"
                onClick={() => handleClick(notif)}
                className={`group w-full rounded-xl border text-left transition-all ${
                  notif.dibaca
                    ? 'border-border bg-card hover:bg-muted/30'
                    : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Icon */}
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                    <Icon className={`size-5 ${cfg.iconCls}`} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {!notif.dibaca && (
                          <span className={`size-2 shrink-0 rounded-full ${PRIORITY_DOT[notif.priority]}`} />
                        )}
                        <p className={`text-sm font-medium leading-snug ${notif.dibaca ? 'text-foreground' : 'text-foreground'}`}>
                          {notif.title}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatRelative(notif.tanggal)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {notif.body}
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
