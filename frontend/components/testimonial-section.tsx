import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Sebelum Zentory, kami sering kehabisan SKU paling laku tanpa sadar. Sekarang draf PO muncul otomatis dan kami nyaris tidak pernah stockout lagi.",
    name: "Rani Pratiwi",
    role: "Owner, Toko Sembako Berkah",
    initials: "RP",
  },
  {
    quote:
      "Stok opname yang dulu makan waktu seharian sekarang terkontrol per rak. Selisih fisik vs sistem turun drastis ke angka di bawah 5%.",
    name: "Dimas Aryo",
    role: "Manajer Operasional, Mart 24",
    initials: "DA",
  },
  {
    quote:
      "Sebagai kasir, scan barcode langsung mengurangi stok—tidak ada lagi input manual yang bikin antrean panjang di kasir.",
    name: "Sinta Maharani",
    role: "Kasir, Grocer Lokal",
    initials: "SM",
  },
]

export function TestimonialSection() {
  return (
    <section className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Testimoni</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Dipercaya pemilik toko untuk mengendalikan stok
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-chart-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                {`"${t.quote}"`}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
