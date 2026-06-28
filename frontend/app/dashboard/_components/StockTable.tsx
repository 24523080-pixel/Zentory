import { ArrowUpRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

const BADGE: Record<string, string> = {
  ok:   'bg-chart-3/15 text-chart-3',
  warn: 'bg-chart-4/15 text-chart-4',
  crit: 'bg-destructive/15 text-destructive',
}

export async function StockTable() {
  let rows: { name: string; sku: string; stok: number; rop: number; status: string; tone: string }[] = []
  try {
    const products = await prisma.product.findMany({
      select: { name: true, sku: true, stok: true, rop: true },
      orderBy: { stok: 'asc' },
    })
    rows = products
      .filter(p => p.stok <= p.rop)
      .slice(0, 6)
      .map(p => ({
        name:   p.name,
        sku:    p.sku,
        stok:   p.stok,
        rop:    p.rop,
        status: p.stok === 0 ? 'Habis' : p.stok <= Math.floor(p.rop * 0.5) ? 'Kritis' : 'Reorder',
        tone:   p.stok === 0 || p.stok <= Math.floor(p.rop * 0.5) ? 'crit' : 'warn',
      }))
  } catch {}

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Pemantauan Stok Kritis</h2>
        <a href="/dashboard/inventaris" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
          Lihat semua <ArrowUpRight className="size-3" />
        </a>
      </div>
      <div className="overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Semua stok di atas reorder point.</p>
        ) : (
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
              {rows.map((row) => (
                <tr key={row.sku} className="bg-card transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5 font-medium">{row.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{row.sku}</td>
                  <td className="px-5 py-3.5 tabular-nums font-semibold">{row.stok}</td>
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
        )}
      </div>
    </div>
  )
}
