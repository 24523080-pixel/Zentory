import { TrendingDown, AlertTriangle, ClipboardX, Clock } from "lucide-react"

const problems = [
  {
    icon: AlertTriangle,
    title: "Stok populer habis tanpa disadari",
    desc: "Toko dengan ratusan SKU bisa berhari-hari tidak tahu barang fast-moving sudah kosong—pendapatan hilang dan pelanggan kabur ke kompetitor.",
  },
  {
    icon: TrendingDown,
    title: "Modal terkunci di barang lambat",
    desc: "Kelebihan stok pada barang slow-moving mengikat modal kerja secara rutin tanpa peringatan apa pun terhadap ketidakseimbangan tersebut.",
  },
  {
    icon: ClipboardX,
    title: "Data sistem ≠ stok fisik",
    desc: "Pencatatan manual menyebabkan selisih antara catatan dan gudang, membuat keputusan restok jadi tebak-tebakan.",
  },
  {
    icon: Clock,
    title: "Update inventaris lambat",
    desc: "Input manual butuh 5–7 menit per transaksi—memperlambat operasional kasir dan admin setiap hari.",
  },
]

export function ProblemSection() {
  return (
    <section id="masalah" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Masalahnya nyata</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Lebih dari 65% toko ritel masih bergantung pada catatan manual
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Tanpa sistem yang memberi peringatan dini, ketidakseimbangan stok menggerus pendapatan dan
            arus kas setiap hari.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <p.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
