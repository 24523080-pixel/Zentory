import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section id="cta" className="py-24 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-12 sm:py-20">

          {/* Radial glow — center brightening */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_50%_50%,oklch(1_0_0_/_0.10),transparent_75%)]"
          />

          {/* Subtle grid texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(oklch(1 0 0 / 0.06) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.06) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            }}
          />

          {/* Abstract glow orb — bottom-right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          {/* Abstract glow orb — top-left */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/8 blur-2xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
              Berhenti menebak. Mulai kelola stok dengan data.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
              Coba Zentory gratis dan rasakan inventaris yang akurat, restok otomatis, dan keputusan
              yang lebih cepat untuk toko Anda.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                <a href="#cta">
                  Coba Gratis 14 Hari
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/20 bg-white/10 text-primary-foreground backdrop-blur-sm hover:bg-white/20 hover:text-primary-foreground sm:w-auto"
                asChild
              >
                <a href="#cta">Jadwalkan Demo</a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70">
              Tanpa kartu kredit · Batalkan kapan saja
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
