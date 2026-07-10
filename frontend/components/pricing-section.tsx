import { Check, Minus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Gratis",
    sub: "Demo",
    price: null,
    priceNote: "14 hari · tanpa kartu kredit",
    highlight: false,
    badge: null,
    cta: "Coba Sekarang",
    ctaHref: "/login",
    features: [
      { label: "1 akun pengguna", ok: true },
      { label: "Maks 10 produk", ok: true },
      { label: "Point of Sale (POS)", ok: true },
      { label: "Purchase Order & Penerimaan", ok: false },
      { label: "Stock Opname & Sales Return", ok: false },
      { label: "Notifikasi Reorder Point", ok: false },
      { label: "Analitik & Klasifikasi AI", ok: false },
      { label: "Fitur AI (Rekomendasi, Email PO)", ok: false },
    ],
  },
  {
    name: "Kecil",
    sub: "Warehouse Kecil",
    price: 99000,
    priceNote: "per bulan",
    highlight: false,
    badge: null,
    cta: "Mulai Berlangganan",
    ctaHref: "#cta",
    features: [
      { label: "3 akun pengguna", ok: true },
      { label: "Maks 100 produk", ok: true },
      { label: "Point of Sale (POS)", ok: true },
      { label: "Purchase Order & Penerimaan", ok: true },
      { label: "Stock Opname & Sales Return", ok: true },
      { label: "Notifikasi Reorder Point", ok: true },
      { label: "Analitik & Klasifikasi AI", ok: false },
      { label: "Fitur AI (Rekomendasi, Email PO)", ok: false },
    ],
  },
  {
    name: "Sedang",
    sub: "Warehouse Sedang",
    price: 249000,
    priceNote: "per bulan",
    highlight: true,
    badge: "Paling Populer",
    cta: "Mulai Berlangganan",
    ctaHref: "#cta",
    features: [
      { label: "10 akun pengguna", ok: true },
      { label: "Maks 500 produk", ok: true },
      { label: "Point of Sale (POS)", ok: true },
      { label: "Purchase Order & Penerimaan", ok: true },
      { label: "Stock Opname & Sales Return", ok: true },
      { label: "Notifikasi Reorder Point", ok: true },
      { label: "Analitik & Klasifikasi AI", ok: true },
      { label: "Fitur AI (Rekomendasi, Email PO)", ok: false },
    ],
  },
  {
    name: "Besar",
    sub: "Warehouse Besar",
    price: 499000,
    priceNote: "per bulan",
    highlight: false,
    badge: null,
    cta: "Mulai Berlangganan",
    ctaHref: "#cta",
    features: [
      { label: "Akun pengguna tak terbatas", ok: true },
      { label: "Produk tak terbatas", ok: true },
      { label: "Point of Sale (POS)", ok: true },
      { label: "Purchase Order & Penerimaan", ok: true },
      { label: "Stock Opname & Sales Return", ok: true },
      { label: "Notifikasi Reorder Point", ok: true },
      { label: "Analitik & Klasifikasi AI", ok: true },
      { label: "Fitur AI (Rekomendasi, Email PO, Narasi Portfolio, Saran ROP)", ok: true },
    ],
  },
]

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

export function PricingSection() {
  return (
    <section id="harga" className="py-14 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Harga</span>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-4xl">
            Pilih paket sesuai skala gudang Anda
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
            Mulai gratis selama 14 hari. Upgrade kapan saja tanpa kontrak jangka panjang.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-4 transition-all duration-300 sm:p-6",
                plan.highlight
                  ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-foreground px-3 py-1 text-xs font-semibold text-primary shadow">
                  {plan.badge}
                </span>
              )}

              {/* Plan name */}
              <div>
                <p className={cn("text-xs font-medium", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {plan.sub}
                </p>
                <h3 className="mt-0.5 text-lg font-bold sm:text-xl">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mt-3 sm:mt-5">
                {plan.price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold tracking-tight sm:text-3xl">{formatRupiah(plan.price)}</span>
                    <span className={cn("text-xs sm:text-sm", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      /bln
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold tracking-tight sm:text-3xl">Gratis</span>
                  </div>
                )}
                <p className={cn("mt-1 text-xs", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {plan.priceNote}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-4 sm:mt-6">
                <Button
                  asChild
                  size="sm"
                  variant={plan.highlight ? "secondary" : "outline"}
                  className={cn(
                    "w-full",
                    !plan.highlight && "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                  )}
                >
                  <a href={plan.ctaHref}>{plan.cta}</a>
                </Button>
              </div>

              {/* Divider */}
              <div className={cn("my-4 border-t sm:my-6", plan.highlight ? "border-primary-foreground/20" : "border-border")} />

              {/* Features */}
              <ul className="flex flex-col gap-2 sm:gap-3">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    {f.ok ? (
                      <Check className={cn("mt-0.5 size-3.5 shrink-0 sm:size-4", plan.highlight ? "text-primary-foreground" : "text-primary")} />
                    ) : (
                      <Minus className={cn("mt-0.5 size-3.5 shrink-0 sm:size-4", plan.highlight ? "text-primary-foreground/30" : "text-muted-foreground/40")} />
                    )}
                    <span className={cn(
                      "text-xs leading-snug sm:text-sm",
                      !f.ok && (plan.highlight ? "text-primary-foreground/40" : "text-muted-foreground/50"),
                    )}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* AI badge untuk paket Besar */}
              {plan.name === "Besar" && (
                <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 sm:mt-5 sm:px-3 sm:py-2">
                  <Sparkles className="size-3 shrink-0 text-primary sm:size-3.5" />
                  <span className="text-xs font-medium text-primary">Semua fitur AI tersedia</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-muted-foreground sm:mt-10 sm:text-sm">
          Semua paket berbayar sudah termasuk dukungan via email.{" "}
          <a href="#faq" className="font-medium text-primary underline-offset-4 hover:underline">
            Lihat FAQ
          </a>{" "}
          untuk pertanyaan lebih lanjut.
        </p>
      </div>
    </section>
  )
}
