const BARS = [
  { day: 'Sen', value: 68  },
  { day: 'Sel', value: 82  },
  { day: 'Rab', value: 74  },
  { day: 'Kam', value: 91  },
  { day: 'Jum', value: 110 },
  { day: 'Sab', value: 134 },
  { day: 'Min', value: 97  },
]

const MAX        = Math.max(...BARS.map((b) => b.value))
const CHART_H    = 160   // px — tinggi area bar
const GRID_LINES = [0, 0.25, 0.5, 0.75, 1]

export function SalesChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold">Penjualan Mingguan</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Total transaksi 7 hari terakhir</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          Rp 54,6 jt
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
            {BARS.map((bar) => {
              const isMax   = bar.value === MAX
              const barH    = Math.max(6, Math.round((bar.value / MAX) * CHART_H))
              return (
                <div key={bar.day} className="group relative flex flex-1 flex-col items-center">
                  {/* Value label — selalu tampil di bar tertinggi, hover untuk yg lain */}
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
                      isMax
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
        {BARS.map((bar) => (
          <div key={bar.day} className="flex flex-1 justify-center">
            <span className={`text-[10px] font-medium ${bar.value === MAX ? 'text-primary' : 'text-muted-foreground'}`}>
              {bar.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[10px] text-muted-foreground">Jml. Transaksi / hari</span>
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
