'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Boxes, Lock } from 'lucide-react'

export default function SuperAdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.message || 'Login gagal.')
        return
      }
      router.push('/super-admin/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-600">
            <Boxes className="size-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Zentory Owner</h1>
            <p className="mt-1 text-sm text-slate-400">Panel khusus pemilik platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password owner"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? 'Memverifikasi...' : 'Masuk sebagai Owner'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-600">
          Zentory v0.1 &middot; Owner Dashboard
        </p>
      </div>
    </div>
  )
}
