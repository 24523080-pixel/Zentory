import { ArrowUpRight } from 'lucide-react'

const ROWS = [
  { name: 'Kopi Arabica 250g',   sku: 'KOP-ARB-250', stock: 22,  rop: 25, status: 'Reorder',  tone: 'warn' },
  { name: 'Cup Paper 16oz',      sku: 'CUP-PPR-16',  stock: 6,   rop: 50, status: 'Kritis',   tone: 'crit' },
  { name: 'Gula Aren Cair 500ml',sku: 'GUL-ARN-500', stock: 18,  rop: 20, status: 'Reorder',  tone: 'warn' },
  { name: 'Sirup Vanilla 1L',    sku: 'SRP-VNL-1L',  stock: 240, rop: 30, status: 'Tersedia', tone: 'ok'   },
]

const BADGE: Record<string, string> = {
  ok:   'bg-chart-3/15 text-chart-3',
  warn: 'bg-chart-4/15 text-chart-4',
  crit: 'bg-destructive/15 text-destructive',
}

export function StockTable() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Pemantauan Stok Kritis</h2>
        <a href="#" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
          Lihat semua <ArrowUpRight className="size-3" />
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Produk</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Stok</th>
              <th className="px-5 py-3 font-medium">Reorder Point</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ROWS.map((row) => (
              <tr key={row.sku} className="bg-card transition-colors hover:bg-muted/30">
                <td className="px-5 py-3.5 font-medium">{row.name}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{row.sku}</td>
                <td className="px-5 py-3.5 tabular-nums">{row.stock}</td>
                <td className="px-5 py-3.5 tabular-nums text-muted-foreground">{row.rop}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[row.tone]}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
