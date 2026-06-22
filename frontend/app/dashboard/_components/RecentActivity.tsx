import { ArrowUpRight } from 'lucide-react'

const ACTIVITIES = [
  { label: 'Kopi Arabica 250g mencapai reorder point',  time: '2 mnt lalu',  type: 'warn' },
  { label: 'PO-2026-041 diterima dari Supplier Maju',   time: '18 mnt lalu', type: 'ok'   },
  { label: 'Cup Paper 16oz — stok kritis (6 pcs)',      time: '45 mnt lalu', type: 'crit' },
  { label: 'Stok Sirup Vanilla 1L diperbarui (+48)',    time: '1 jam lalu',  type: 'ok'   },
  { label: 'Gula Aren Cair 500ml — reorder diajukan',  time: '2 jam lalu',  type: 'warn' },
]

const DOT: Record<string, string> = {
  ok:   'bg-chart-3',
  warn: 'bg-chart-4',
  crit: 'bg-destructive',
}

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Aktivitas Terbaru</h2>
        <a href="#" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
          Lihat semua <ArrowUpRight className="size-3" />
        </a>
      </div>
      <ul className="space-y-3">
        {ACTIVITIES.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 size-2 shrink-0 rounded-full ${DOT[item.type]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed text-foreground">{item.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
