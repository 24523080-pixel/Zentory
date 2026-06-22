import { Boxes, Globe, AtSign, MessageCircle, Mail } from "lucide-react"

const columns = [
  {
    title: "Produk",
    links: ["Fitur", "Cara Kerja", "Harga", "Keamanan"],
  },
  {
    title: "Perusahaan",
    links: ["Tentang Kami", "Karier", "Blog", "Kontak"],
  },
  {
    title: "Sumber Daya",
    links: ["Dokumentasi", "Panduan", "Status", "Bantuan"],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Boxes className="size-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Zentory</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Sistem manajemen inventori pintar berbasis web untuk ritel dan UMKM. Stok akurat,
              keputusan cepat.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Globe, AtSign, MessageCircle, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Media sosial Zentory"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zentory. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Kebijakan Privasi
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Syarat Layanan
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
