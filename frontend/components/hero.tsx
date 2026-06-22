'use client'

import { useState, useEffect } from "react"
import { ArrowRight, CheckCircle2, TrendingUp, Bell, Boxes } from "lucide-react"
import { Button } from "@/components/ui/button"

const HERO_VIDEOS = ["/hero-supermarket.mp4", "/hero-shopping.mp4"]

export function Hero() {
  const [video, setVideo] = useState(HERO_VIDEOS[0])

  useEffect(() => {
    setVideo(HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)])
  }, [])

  return (
    <section className="relative overflow-hidden">
      {/* Background video */}
      <div aria-hidden="true" className="absolute inset-0 z-0 bg-[oklch(0.22_0.03_265)]">
        {/* High-quality fallback image (shown behind video / if video fails) */}
        <img
          src="/hero-supermarket.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          key={video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-supermarket.png"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>
        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-[oklch(0.18_0.03_265_/_0.62)]" />
        {/* Soft fade into page background at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-32 sm:px-6 sm:pt-40 lg:px-8">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-chart-3" />
            Inventaris real-time untuk ritel &amp; UMKM
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
            Stok selalu akurat, keputusan restok selalu tepat
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/85">
            Zentory memantau level stok secara real-time, membuat draf Purchase Order otomatis saat
            mencapai reorder point, dan mengubah data penjualan menjadi insight Fast, Slow, dan Dead
            Stock—tanpa lagi pencatatan manual.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="#cta">
                Coba Gratis 14 Hari
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
              asChild
            >
              <a href="#cara-kerja">Lihat Cara Kerja</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-white/70">
            Tanpa kartu kredit · Setup di bawah 10 menit
          </p>
        </div>

        {/* Product mockup */}
        <div className="mx-auto mt-14 max-w-5xl pb-4 animate-fade-up [animation-delay:120ms]">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}

function DashboardMockup() {
  const rows = [
    { name: "Kopi Arabica 250g", sku: "KOP-ARB-250", stock: 124, status: "Tersedia", tone: "ok" },
    { name: "Gula Aren Cair 500ml", sku: "GUL-ARN-500", stock: 18, status: "Reorder", tone: "warn" },
    { name: "Cup Paper 16oz", sku: "CUP-PPR-16", stock: 6, status: "Kritis", tone: "low" },
    { name: "Sirup Vanilla 1L", sku: "SRP-VNL-1L", stock: 240, status: "Tersedia", tone: "ok" },
  ]
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
      {/* top bar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-border" />
          <span className="size-3 rounded-full bg-border" />
          <span className="size-3 rounded-full bg-border" />
        </div>
        <div className="ml-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Boxes className="size-3.5" />
          app.zentory.id/dashboard
        </div>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-3">
        {[
          { label: "Akurasi Stok", value: "96.4%", icon: CheckCircle2, accent: "text-chart-3" },
          { label: "Perlu Restok", value: "12 SKU", icon: Bell, accent: "text-chart-4" },
          { label: "Penjualan Hari Ini", value: "Rp 8,4jt", icon: TrendingUp, accent: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              <stat.icon className={`size-4 ${stat.accent}`} />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* table */}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Pemantauan Stok</h3>
          <span className="text-xs text-muted-foreground">Diperbarui real-time</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Produk</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">SKU</th>
                <th className="px-4 py-2.5 font-medium">Stok</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.sku} className="bg-card">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
                    {r.sku}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                        (r.tone === "ok"
                          ? "bg-chart-3/15 text-chart-3"
                          : r.tone === "warn"
                            ? "bg-chart-4/15 text-chart-4"
                            : "bg-destructive/15 text-destructive")
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
