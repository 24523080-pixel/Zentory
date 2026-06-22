import { Check } from "lucide-react"

const benefits = [
  "Pemantauan stok otomatis dengan deteksi reorder point",
  "Sinkronisasi real-time setiap transaksi POS selesai",
  "Hak akses ketat antar peran: Admin, Kasir, Manajer, Supplier",
  "Penyesuaian stok hanya dengan otorisasi Manajer",
]

export function SolutionSection() {
  return (
    <section id="solusi" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold text-primary">Solusinya: Zentory</span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Satu platform terpusat yang mengubah data menjadi keputusan
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Alih-alih sekadar mencatat, Zentory bekerja untuk Anda—mengotomatiskan pembaruan stok,
              menyatukan data antar aktor, dan menyajikan analitik inventaris yang akurat sehingga toko
              Anda berhenti kehilangan penjualan akibat kehabisan stok.
            </p>
            <ul className="mt-8 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-chart-3/15 text-chart-3">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { stat: "≥ 95%", label: "Target akurasi stok sistem vs fisik" },
              { stat: "≤ 5", label: "Kasus kehabisan stok per bulan" },
              { stat: "≤ 2 mnt", label: "Waktu update inventaris per transaksi" },
              { stat: "Real-time", label: "Visibilitas stok di semua produk" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-3xl font-semibold tracking-tight text-primary">{item.stat}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
