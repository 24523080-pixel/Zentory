import { CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

const CARDS = [
  {
    title: 'Akurasi Stok',
    value: '96.4%',
    delta: '+1.2%',
    deltaUp: true,
    sub: 'vs. bulan lalu',
    icon: CheckCircle2,
    accent: 'text-chart-3',
    glow: 'bg-chart-3/10',
  },
  {
    title: 'Rata-rata Update',
    value: '1 mnt 47 dtk',
    delta: '-13 dtk',
    deltaUp: true,
    sub: 'lebih cepat dari target',
    icon: Clock,
    accent: 'text-primary',
    glow: 'bg-primary/10',
  },
  {
    title: 'Stockout Rate',
    value: '3 kejadian',
    delta: '-2',
    deltaUp: true,
    sub: 'vs. bulan lalu',
    icon: AlertTriangle,
    accent: 'text-chart-4',
    glow: 'bg-chart-4/10',
  },
]

export function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs"
        >
          <div className={`pointer-events-none absolute right-4 top-4 size-10 rounded-full ${card.glow} blur-xl`} />
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
            <card.icon className={`size-4 ${card.accent}`} />
          </div>
          <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {card.deltaUp
              ? <TrendingUp className="size-3 text-chart-3" />
              : <TrendingDown className="size-3 text-destructive" />
            }
            <span className={`text-xs font-medium ${card.deltaUp ? 'text-chart-3' : 'text-destructive'}`}>
              {card.delta}
            </span>
            <span className="text-xs text-muted-foreground">{card.sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
