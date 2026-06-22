'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Boxes, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const DEMO_ACCOUNTS = [
  { label: 'Manager', email: 'manager@zentory.id', password: 'manager123' },
  { label: 'Admin',   email: 'admin@zentory.id',   password: 'admin123'   },
  { label: 'Kasir',   email: 'kasir@zentory.id',   password: 'kasir123'   },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  function fillDemo(acc: (typeof DEMO_ACCOUNTS)[0]) {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? 'Email atau password salah.')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi dan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ─── LEFT: Branding panel (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-10 overflow-hidden bg-[oklch(0.22_0.03_265)]">

        {/* Background video / image */}
        <img
          src="/hero-supermarket.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-shopping.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div aria-hidden="true" className="absolute inset-0 bg-[oklch(0.18_0.03_265_/_0.75)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[oklch(0.18_0.03_265)] to-transparent" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">Zentory</span>
        </div>

        {/* Copy + stats */}
        <div className="relative z-10">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">
            Smart Inventory Management
          </p>
          <h2 className="text-balance text-2xl font-semibold leading-snug tracking-tight text-white">
            Stok selalu akurat,<br />keputusan restok selalu tepat.
          </h2>
          <div className="mt-6 flex gap-6">
            {[
              { value: '≥ 95%',   label: 'akurasi stok'       },
              { value: '≤ 2 mnt', label: 'update inventaris'  },
              { value: '< 5×',    label: 'stockout per bulan' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Form panel ─── */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-muted/60">

        {/* Decorative: grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(oklch(0.82 0.012 264 / 0.18) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.012 264 / 0.18) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Decorative: ambient glow bottom-right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-[480px] w-[480px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        {/* Decorative: center glow — behind card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[120px]"
        />

        {/* Back button — circular icon */}
        <div className="relative z-10 px-8 pt-7">
          <a
            href="/"
            aria-label="Kembali ke halaman utama"
            className="group flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          >
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </a>
        </div>

        {/* Centered form */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md animate-fade-up">

            {/* Mobile-only logo */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Boxes className="size-4" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Zentory</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Selamat datang kembali
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Masuk untuk melanjutkan ke dashboard inventaris.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@toko.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className="h-10 px-3.5 shadow-xs"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-10 px-3.5 pr-10 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword
                      ? <EyeOff className="size-4" />
                      : <Eye className="size-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="mt-1 h-10 w-full text-sm font-semibold"
                disabled={loading}
              >
                {loading
                  ? <Loader2 className="size-4 animate-spin" />
                  : 'Masuk'
                }
              </Button>
            </form>

            {/* ── Demo quick-fill badges ── */}
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                Coba dengan akun demo — klik untuk mengisi otomatis:
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.label}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border',
                      'bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground',
                      'transition-all duration-150',
                      'hover:border-primary/30 hover:bg-primary/10 hover:text-primary',
                      'active:scale-95',
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-chart-3" aria-hidden="true" />
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
            </div>{/* end card */}

          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between px-8 pb-6 pt-2">
          <p className="text-xs text-muted-foreground/60">
            © 2026 Zentory. Hak Cipta Dilindungi.
          </p>
          <a
            href="#"
            className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            Butuh bantuan?
          </a>
        </div>
      </div>

    </div>
  )
}
