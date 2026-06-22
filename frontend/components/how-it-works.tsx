const steps = [
  {
    step: "01",
    title: "Impor data produk",
    desc: "Migrasikan nama, SKU, harga, dan stok awal ke Zentory. Sistem siap pakai tanpa mulai dari database kosong.",
  },
  {
    step: "02",
    title: "Jual & scan seperti biasa",
    desc: "Kasir scan barcode, stok berkurang otomatis secara real-time begitu pembayaran POS selesai.",
  },
  {
    step: "03",
    title: "Sistem deteksi reorder point",
    desc: "Saat stok menipis, Zentory membuat draf Purchase Order otomatis untuk ditinjau Manajer.",
  },
  {
    step: "04",
    title: "Approve & terima barang",
    desc: "Manajer menyetujui PO dari dashboard, admin validasi barang masuk dengan scan—stok update otomatis.",
  },
  {
    step: "05",
    title: "Analisis & optimalkan",
    desc: "Pantau tren Fast/Slow/Dead Stock dan ambil keputusan restok berbasis data, bukan tebakan.",
  },
]

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Cara Kerja</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Dari stok masuk sampai keputusan strategis
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Lima langkah sederhana yang berjalan otomatis di latar belakang operasional toko Anda.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-5">
          {steps.map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="font-mono text-sm font-semibold text-primary">{s.step}</span>
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
