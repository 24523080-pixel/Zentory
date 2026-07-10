"use client"

import { useState, useEffect } from "react"
import { Boxes, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Masalah", href: "#masalah" },
  { label: "Solusi", href: "#solusi" },
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "FAQ", href: "#faq" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/80 bg-background/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          <span
            className={cn(
              "text-lg font-semibold tracking-tight transition-colors",
              scrolled ? "text-foreground" : "text-white",
            )}
          >
            Zentory
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                scrolled
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-white hover:text-white/80",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            className={cn(!scrolled && "text-white hover:bg-white/10 hover:text-white")}
            asChild
          >
            <a href="/login">Masuk</a>
          </Button>
          <Button className="h-9 px-4" asChild>
            <a href="#cta">Coba Gratis</a>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-9 px-3 text-sm font-medium", !scrolled && "text-white hover:bg-white/10 hover:text-white")}
            asChild
          >
            <a href="/login">Masuk</a>
          </Button>
          <button
            type="button"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-md transition-colors",
              scrolled ? "text-foreground" : "text-white",
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Navigasi mobile">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <a href="/login" onClick={() => setOpen(false)}>
                  Masuk
                </a>
              </Button>
              <Button asChild>
                <a href="#cta" onClick={() => setOpen(false)}>
                  Coba Gratis
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
