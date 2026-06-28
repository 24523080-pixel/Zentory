import { prisma } from '@/lib/prisma'

const DAYS_ID    = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const CHART_H    = 160
const GRID_LINES = [0, 0.25, 0.5, 0.75, 1]

export async function SalesChart() {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  type Bar = { day: string; value: number; key: string }
  let bars: Bar[] = []
  let totalActivities = 0

  try {
    const [orders, penerimaan] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.penerimaan.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ])

    bars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      const count   =
        orders.filter(o => o.createdAt.toISOString().slice(0, 10) === dateStr).length +
        penerimaan.filter(p => p.createdAt.toISOString().slice(0, 10) === dateStr).length
      return { day: DAYS_ID[d.getDay()], value: count, key: dateStr }
    })
    totalActivities = orders.length + penerimaan.length
  } catch {
    bars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      return { day: DAYS_ID[d.getDay()], value: 0, key: d.toISOString().slice(0, 10) }
    })
  }

  const MAX = Math.max(...bars.map(b => b.value), 1)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold">Aktivitas Pengadaan</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">PO & penerimaan 7 hari terakhir</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {totalActivities} aktivitas
        </span>
      </div>

      {/* Chart area */}
      <div className="flex gap-3">
        {/* Y-axis labels */}
        <div className="relative shrink-0" style={{ height: `${CHART_H}px`, width: '28px' }}>
          {GRID_LINES.map((pct) => (
            <span
              key={pct}
              className="absolute right-0 text-[10px] leading-none text-muted-foreground"
              style={{ bottom: `${pct * CHART_H - 5}px` }}
            >
              {Math.round(pct * MAX)}
            </span>
          ))}
        </div>

        {/* Bars + gridlines */}
        <div className="relative flex-1">
          {/* Gridlines */}
          <div className="absolute inset-0" style={{ height: `${CHART_H}px` }}>
            {GRID_LINES.map((pct) => (
              <div
                key={pct}
                className="absolute w-full border-t border-border/60"
                style={{ bottom: `${pct * CHART_H}px` }}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="relative flex items-end gap-2" style={{ height: `${CHART_H}px` }}>
            {bars.map((bar) => {
              const isMax = bar.value === MAX && MAX > 0
              const barH  = bar.value > 0
                ? Math.max(6, Math.round((bar.value / MAX) * CHART_H))
                : 3
              return (
                <div key={bar.key} className="group relative flex flex-1 flex-col items-center">
                  <span
                    className={`absolute text-[10px] font-semibold transition-opacity ${
                      isMax
                        ? 'text-primary opacity-100'
                        : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                    }`}
                    style={{ bottom: `${barH + 4}px` }}
                  >
                    {bar.value}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      bar.value === 0
                        ? 'bg-border'
                        : isMax
                          ? 'bg-primary'
                          : 'bg-primary/50 group-hover:bg-primary/80'
                    }`}
                    style={{ height: `${barH}px` }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex gap-3 pl-10">
        {bars.map((bar) => (
          <div key={bar.key} className="flex flex-1 justify-center">
            <span className={`text-[10px] font-medium ${bar.value === MAX && MAX > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              {bar.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[10px] text-muted-foreground">Jml. PO + Penerimaan / hari</span>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-sm bg-primary" /> Tertinggi
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-sm bg-primary/50" /> Lainnya
          </span>
        </div>
      </div>
    </div>
  )
}
