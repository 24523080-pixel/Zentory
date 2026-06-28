import { Package, AlertTriangle, ClipboardList, TrendingUp, TrendingDown } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export async function StatCards() {
  let totalProducts = 0, belowROPCount = 0, pendingPOs = 0
  try {
    const [products, pos] = await Promise.all([
      prisma.product.findMany({ select: { stok: true, rop: true } }),
      prisma.purchaseOrder.count({ where: { status: { in: ['Draft', 'Dikirim'] } } }),
    ])
    totalProducts  = products.length
    belowROPCount  = products.filter(p => p.stok <= p.rop).length
    pendingPOs     = pos
  } catch {}

  const CARDS = [
    {
      title:   'Total Produk',
      value:   String(totalProducts),
      delta:   'produk terdaftar',
      deltaUp: true,
      sub:     'di inventaris',
      icon:    Package,
      accent:  'text-primary',
      glow:    'bg-primary/10',
    },
    {
      title:   'Produk ≤ ROP',
      value:   `${belowROPCount} produk`,
      delta:   belowROPCount > 0 ? 'Perlu restock' : 'Semua aman',
      deltaUp: belowROPCount === 0,
      sub:     'stok di bawah reorder point',
      icon:    AlertTriangle,
      accent:  belowROPCount > 0 ? 'text-chart-4' : 'text-chart-3',
      glow:    belowROPCount > 0 ? 'bg-chart-4/10' : 'bg-chart-3/10',
    },
    {
      title:   'PO Aktif',
      value:   `${pendingPOs} PO`,
      delta:   pendingPOs > 0 ? 'Menunggu proses' : 'Tidak ada PO aktif',
      deltaUp: pendingPOs === 0,
      sub:     'Draft + Dikirim',
      icon:    ClipboardList,
      accent:  'text-chart-4',
      glow:    'bg-chart-4/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map((card) => (
        <div key={card.title} className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs">
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
