"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    q: "Apakah Zentory bisa diakses dari HP dan komputer?",
    a: "Ya. Zentory berbasis web dan dirancang responsif, sehingga dapat dioperasikan baik di perangkat layar standar (laptop/PC) maupun perangkat mobile melalui browser modern seperti Chrome, Edge, atau Firefox.",
  },
  {
    q: "Apakah stok otomatis berkurang setelah transaksi?",
    a: "Benar. Setiap kali transaksi pembayaran POS selesai, sistem langsung mengurangi jumlah stok di database secara real-time tanpa input manual tambahan.",
  },
  {
    q: "Bagaimana cara kerja Purchase Order otomatis?",
    a: "Saat stok suatu barang mencapai reorder point, sistem membuat draf PO secara otomatis. Manajer kemudian meninjau dan menekan Approve dari dashboard, lalu PO dikirim ke supplier secara digital.",
  },
  {
    q: "Siapa saja yang bisa menyesuaikan stok?",
    a: "Penyesuaian stok hanya dapat dilakukan dengan otorisasi atau persetujuan Manajer. Hak akses dibatasi ketat antar peran Admin, Kasir, Manajer, dan Supplier untuk menjaga keamanan data.",
  },
  {
    q: "Apa yang terjadi jika koneksi internet terputus saat transaksi?",
    a: "Sistem menyimpan antrean transaksi secara lokal dan melakukan sinkronisasi otomatis begitu koneksi kembali stabil, sehingga data tetap konsisten.",
  },
  {
    q: "Apakah perlu memasukkan data produk satu per satu?",
    a: "Tidak harus manual semua. Data produk awal (nama, SKU, harga, stok awal) dapat diinput atau dimigrasi ke sistem sebelum go-live, sehingga Anda tidak memulai dari database kosong.",
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold text-primary">FAQ</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Pertanyaan yang sering diajukan
          </h2>
        </div>

        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium sm:text-base">{faq.q}</span>
                  <Plus
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform duration-300",
                      isOpen && "rotate-45",
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
