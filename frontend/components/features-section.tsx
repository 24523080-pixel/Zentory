import {
  Radar,
  FileCheck2,
  ScanLine,
  BarChart3,
  ShieldCheck,
  RotateCcw,
} from "lucide-react"

const features = [
  {
    icon: Radar,
    title: "Pemantauan Stok Otomatis",
    desc: "Sistem memantau level stok real-time dan mendeteksi titik pemesanan ulang (reorder point) secara otomatis.",
  },
  {
    icon: FileCheck2,
    title: "Pengadaan & Approval PO",
    desc: "Draf Purchase Order dibuat otomatis saat stok menipis, lalu disetujui Manajer langsung dari dashboard.",
  },
  {
    icon: ScanLine,
    title: "Validasi Barang via Barcode",
    desc: "Admin gudang memvalidasi barang masuk dengan scan barcode—jumlah cocok, stok langsung ter-update.",
  },
  {
    icon: BarChart3,
    title: "Analisis Fast / Slow / Dead Stock",
    desc: "Dashboard mengklasifikasikan produk berdasarkan data historis penjualan untuk keputusan strategis.",
  },
  {
    icon: ShieldCheck,
    title: "Cycle Counting Terkontrol",
    desc: "Kunci (freeze) stok per rak saat opname, catat selisih, dan terapkan penyesuaian dengan persetujuan Manajer.",
  },
  {
    icon: RotateCcw,
    title: "Retur & Stok Karantina",
    desc: "Retur penjualan otomatis memindahkan barang ke stok karantina menunggu inspeksi dan validasi Manajer.",
  },
]

export function FeaturesSection() {
  return (
    <section id="fitur" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Fitur</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Semua yang dibutuhkan untuk mengendalikan inventaris
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Dari pengadaan hingga opname, setiap alur kerja toko Anda terhubung dalam satu sistem.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
