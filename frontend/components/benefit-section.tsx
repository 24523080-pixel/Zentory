import { Wallet, ShoppingBag, Gauge, Users } from "lucide-react"

const benefits = [
  {
    icon: ShoppingBag,
    title: "Pendapatan tidak bocor",
    desc: "Produk populer selalu tersedia saat dibutuhkan—kurangi insiden kehabisan stok dari belasan kasus jadi segelintir per bulan.",
  },
  {
    icon: Wallet,
    title: "Modal kerja lebih sehat",
    desc: "Identifikasi dead stock lebih cepat dan bebaskan modal yang sebelumnya terkunci di barang yang tidak laku.",
  },
  {
    icon: Gauge,
    title: "Operasional lebih cepat",
    desc: "Pembaruan inventaris turun dari 5–7 menit jadi di bawah 2 menit per transaksi—staf fokus melayani pelanggan.",
  },
  {
    icon: Users,
    title: "Tim sinkron, satu sumber data",
    desc: "Kasir, admin, manajer, dan supplier bekerja di atas data stok yang sama dan akurat secara real-time.",
  },
]

export function BenefitSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Manfaat</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Dampak yang langsung terasa di neraca toko Anda
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex gap-5 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <b.icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
