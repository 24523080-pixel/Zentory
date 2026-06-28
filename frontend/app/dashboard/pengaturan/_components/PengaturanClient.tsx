'use client'

import { useState, useEffect } from 'react'
import { User, Store, Users, Eye, EyeOff, Check, X, Plus, KeyRound, Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type UserRole   = 'manager' | 'admin' | 'kasir'
type UserStatus = 'Aktif' | 'Nonaktif'

interface AppUser {
  id:        string
  nama:      string
  email:     string
  role:      UserRole
  status:    UserStatus
  bergabung: string
}

const MOCK_TOKO = {
  nama:        'Toko Segar Jaya',
  alamat:      'Jl. Pasar Baru No. 12, Yogyakarta 55221',
  telepon:     '0274-512345',
  email:       'tokosegarjaya@gmail.com',
  mataUang:   'IDR (Rp)',
  formatAngka: '1.000,00',
  zonaWaktu:  'WIB (UTC+7)',
}

type Tab = 'profil' | 'pengguna' | 'toko'

const ROLE_LABEL: Record<UserRole, string> = { manager: 'Manager', admin: 'Admin Staff', kasir: 'Kasir' }
const ROLE_BADGE: Record<UserRole, string> = {
  manager: 'bg-primary/10 text-primary',
  admin:   'bg-chart-3/15 text-chart-3',
  kasir:   'bg-chart-4/15 text-chart-4',
}
const STATUS_BADGE: Record<UserStatus, string> = {
  Aktif:    'bg-chart-3/15 text-chart-3',
  Nonaktif: 'bg-muted text-muted-foreground',
}

interface Props {
  role:      string
  userName:  string
  userEmail: string
}

export function PengaturanClient({ role, userName, userEmail }: Props) {
  const isManager = role === 'manager'

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profil',   label: 'Profil & Akun',       icon: User  },
    ...(isManager ? [{ id: 'pengguna' as Tab, label: 'Manajemen Pengguna', icon: Users }] : []),
    { id: 'toko',     label: 'Pengaturan Toko',      icon: Store },
  ]

  const [activeTab, setActiveTab] = useState<Tab>('profil')

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ' +
              (activeTab === t.id
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground')
            }
          >
            <t.icon className="size-4 shrink-0" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'profil'   && <ProfilTab userName={userName} userEmail={userEmail} role={role} />}
      {activeTab === 'pengguna' && <PenggunaTab />}
      {activeTab === 'toko'     && <TokoTab />}
    </div>
  )
}

/* ─────────────── TAB: PROFIL ─────────────── */

function ProfilTab({ userName, userEmail, role }: { userName: string; userEmail: string; role: string }) {
  const [nama,          setNama]          = useState(userName)
  const [savedProfil,   setSavedProfil]   = useState(false)
  const [errProfil,     setErrProfil]     = useState('')
  const [loadingProfil, setLoadingProfil] = useState(false)

  const [pwLama,       setPwLama]       = useState('')
  const [pwBaru,       setPwBaru]       = useState('')
  const [pwKonfirmasi, setPwKonfirmasi] = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [savedPw,      setSavedPw]      = useState(false)
  const [errPw,        setErrPw]        = useState('')
  const [loadingPw,    setLoadingPw]    = useState(false)

  const initials  = nama.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const roleLabel: Record<string, string> = { manager: 'Manager', admin: 'Admin Staff', kasir: 'Kasir' }

  async function saveProfil() {
    setErrProfil('')
    if (!nama.trim()) return setErrProfil('Nama tidak boleh kosong.')
    setLoadingProfil(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nama.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setErrProfil(d.message ?? 'Gagal menyimpan.')
      } else {
        setSavedProfil(true)
        setTimeout(() => setSavedProfil(false), 2000)
      }
    } catch {
      setErrProfil('Terjadi kesalahan koneksi.')
    } finally {
      setLoadingProfil(false)
    }
  }

  async function savePw() {
    setErrPw('')
    if (!pwLama) return setErrPw('Masukkan password lama.')
    if (pwBaru.length < 6) return setErrPw('Password baru minimal 6 karakter.')
    if (pwBaru !== pwKonfirmasi) return setErrPw('Konfirmasi password tidak cocok.')
    setLoadingPw(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: pwLama, newPassword: pwBaru }),
      })
      const d = await res.json()
      if (!res.ok) {
        setErrPw(d.message ?? 'Gagal memperbarui password.')
      } else {
        setSavedPw(true)
        setPwLama(''); setPwBaru(''); setPwKonfirmasi('')
        setTimeout(() => setSavedPw(false), 2000)
      }
    } catch {
      setErrPw('Terjadi kesalahan koneksi.')
    } finally {
      setLoadingPw(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Info akun */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-sm font-semibold">Informasi Akun</h2>
        <div className="flex items-start gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
            {initials}
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nama Lengkap</label>
                <Input value={nama} onChange={(e) => setNama(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="flex h-9 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                  {userEmail}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <p className="text-sm font-medium">{roleLabel[role] ?? role}</p>
            </div>
            {errProfil && <p className="text-xs text-destructive">{errProfil}</p>}
            <div className="flex justify-end">
              <Button size="sm" onClick={saveProfil} disabled={loadingProfil} className="gap-2">
                {loadingProfil
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : savedProfil
                    ? <><Check className="size-3.5" /> Tersimpan</>
                    : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ganti password */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-sm font-semibold">Ganti Password</h2>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Password Lama</label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={pwLama}
                onChange={(e) => setPwLama(e.target.value)}
                placeholder="••••••••"
                className="h-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Password Baru</label>
            <Input
              type={showPw ? 'text' : 'password'}
              value={pwBaru}
              onChange={(e) => setPwBaru(e.target.value)}
              placeholder="••••••••"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Konfirmasi Password Baru</label>
            <Input
              type={showPw ? 'text' : 'password'}
              value={pwKonfirmasi}
              onChange={(e) => setPwKonfirmasi(e.target.value)}
              placeholder="••••••••"
              className="h-9"
            />
          </div>
          {errPw && <p className="text-xs text-destructive">{errPw}</p>}
          {savedPw && (
            <p className="text-xs text-chart-3 flex items-center gap-1">
              <Check className="size-3" /> Password berhasil diperbarui.
            </p>
          )}
          <div className="flex justify-end pt-1">
            <Button size="sm" variant="outline" onClick={savePw} disabled={loadingPw} className="gap-2">
              {loadingPw ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
              Perbarui Password
            </Button>
          </div>
        </div>
      </div>

      {/* 2FA — hanya untuk Manager */}
      {role === 'manager' && <TwoFactorSection />}
    </div>
  )
}

/* ─────────────── 2FA SECTION ─────────────── */

function TwoFactorSection() {
  const [isSetup,       setIsSetup]       = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [showModal,     setShowModal]     = useState(false)
  const [qrDataUrl,     setQrDataUrl]     = useState('')
  const [pendingSecret, setPendingSecret] = useState('')
  const [setupCode,     setSetupCode]     = useState('')
  const [setupError,    setSetupError]    = useState('')
  const [setupLoading,  setSetupLoading]  = useState(false)
  const [setupDone,     setSetupDone]     = useState(false)
  const [disabling,     setDisabling]     = useState(false)

  useEffect(() => {
    fetch('/api/auth/totp')
      .then(r => r.ok ? r.json() : { isSetup: false })
      .then(d => setIsSetup(d.isSetup))
      .catch(() => {})
      .finally(() => setLoadingStatus(false))
  }, [])

  async function openSetup() {
    setSetupError(''); setSetupCode(''); setSetupDone(false)
    const res = await fetch('/api/auth/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate' }),
    })
    if (res.ok) {
      const d = await res.json()
      setQrDataUrl(d.qrDataUrl)
      setPendingSecret(d.secret)
      setShowModal(true)
    }
  }

  async function confirmSetup() {
    setSetupError('')
    if (setupCode.length !== 6) { setSetupError('Masukkan 6 digit kode.'); return }
    setSetupLoading(true)
    try {
      const res = await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', secret: pendingSecret, code: setupCode }),
      })
      const d = await res.json()
      if (res.ok) {
        setIsSetup(true); setSetupDone(true)
        setTimeout(() => { setShowModal(false); setSetupCode('') }, 1800)
      } else {
        setSetupError(d.message ?? 'Kode tidak valid.')
      }
    } finally { setSetupLoading(false) }
  }

  async function disableTOTP() {
    if (!confirm('Nonaktifkan Google Authenticator? Anda tidak akan bisa menyetujui adjustment stok besar tanpa 2FA.')) return
    setDisabling(true)
    try {
      const res = await fetch('/api/auth/totp', { method: 'DELETE' })
      if (res.ok) setIsSetup(false)
    } finally { setDisabling(false) }
  }

  if (loadingStatus) return null

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Autentikasi Dua Faktor (2FA)</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Wajib untuk menyetujui penyesuaian stok &gt; 10% nilai inventaris (NFR-002).
            </p>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            isSetup ? 'bg-chart-3/15 text-chart-3' : 'bg-muted text-muted-foreground'
          }`}>
            {isSetup
              ? <><ShieldCheck className="size-3" /> Aktif</>
              : <><ShieldOff className="size-3" /> Nonaktif</>}
          </span>
        </div>
        <div className="mt-4 flex justify-end">
          {isSetup ? (
            <Button size="sm" variant="outline" onClick={disableTOTP} disabled={disabling}
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
              {disabling ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldOff className="size-3.5" />}
              Nonaktifkan
            </Button>
          ) : (
            <Button size="sm" onClick={openSetup} className="gap-2">
              <ShieldCheck className="size-3.5" />
              Setup Google Authenticator
            </Button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <button type="button" onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
            <h3 className="mb-4 text-center text-base font-semibold">Setup Google Authenticator</h3>
            {!setupDone ? (
              <>
                <ol className="mb-4 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                  <li>Buka aplikasi <span className="font-medium text-foreground">Google Authenticator</span> di HP.</li>
                  <li>Tap <span className="font-medium text-foreground">"+"</span> → pilih <span className="font-medium text-foreground">"Scan QR code"</span>.</li>
                  <li>Scan kode QR di bawah ini.</li>
                  <li>Masukkan kode 6 digit yang muncul.</li>
                </ol>
                {qrDataUrl && (
                  <div className="mb-4 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} alt="QR Code 2FA" className="size-48 rounded-lg border border-border" />
                  </div>
                )}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={setupCode}
                  onChange={e => { setSetupCode(e.target.value.replace(/\D/g, '')); setSetupError('') }}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-center text-2xl font-mono font-semibold tracking-[0.5em] outline-none focus:ring-2 focus:ring-ring"
                />
                {setupError && <p className="mt-2 text-center text-xs text-destructive">{setupError}</p>}
                <Button className="mt-4 w-full gap-2" onClick={confirmSetup} disabled={setupCode.length !== 6 || setupLoading}>
                  {setupLoading ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" />}
                  Aktifkan 2FA
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                <span className="flex size-14 items-center justify-center rounded-full bg-chart-3/15">
                  <ShieldCheck className="size-7 text-chart-3" />
                </span>
                <p className="text-sm font-semibold text-chart-3">Google Authenticator Aktif!</p>
                <p className="text-center text-xs text-muted-foreground">
                  2FA berhasil dikonfigurasi. Kode OTP akan diminta saat menyetujui adjustment stok besar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ─────────────── TAB: PENGGUNA ─────────────── */

function PenggunaTab() {
  const [users,     setUsers]     = useState<AppUser[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [formNama,     setFormNama]     = useState('')
  const [formEmail,    setFormEmail]    = useState('')
  const [formRole,     setFormRole]     = useState<UserRole>('kasir')
  const [formPassword, setFormPassword] = useState('Zentory@123')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [errForm,      setErrForm]      = useState('')

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string; name: string; email: string; role: UserRole; createdAt: string }[]) => {
        setUsers(data.map(u => ({
          id:        u.id,
          nama:      u.name,
          email:     u.email,
          role:      u.role,
          status:    'Aktif' as UserStatus,
          bergabung: u.createdAt.slice(0, 10),
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : u
    ))
  }

  async function tambahUser() {
    setErrForm('')
    if (!formNama || !formEmail || !formPassword) {
      setErrForm('Semua field wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formNama, email: formEmail, role: formRole, password: formPassword }),
      })
      const d = await res.json()
      if (!res.ok) {
        setErrForm(d.message ?? 'Gagal menambahkan pengguna.')
      } else {
        setUsers(prev => [...prev, {
          id:        d.id,
          nama:      d.name,
          email:     d.email,
          role:      d.role,
          status:    'Aktif',
          bergabung: d.createdAt.slice(0, 10),
        }])
        setFormNama(''); setFormEmail(''); setFormRole('kasir'); setFormPassword('Zentory@123')
        setSaved(true)
        setTimeout(() => { setSaved(false); setShowModal(false) }, 1500)
      }
    } catch {
      setErrForm('Terjadi kesalahan koneksi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex h-32 items-center justify-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} pengguna terdaftar</p>
        <Button size="sm" onClick={() => { setShowModal(true); setErrForm(''); setSaved(false) }} className="gap-2">
          <Plus className="size-3.5" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Pengguna</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Bergabung</th>
              <th className="px-4 py-3 font-medium sr-only">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="bg-card hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {u.nama.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium">{u.nama}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[u.status]}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground">
                  {new Date(u.bergabung).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleStatus(u.id)}
                    title={u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    className={
                      'flex size-7 items-center justify-center rounded-md text-xs transition-colors ' +
                      (u.status === 'Aktif'
                        ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                        : 'text-muted-foreground hover:bg-chart-3/10 hover:text-chart-3')
                    }
                  >
                    {u.status === 'Aktif' ? <X className="size-3.5" /> : <Check className="size-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Belum ada pengguna.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal tambah pengguna */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-semibold">Tambah Pengguna Baru</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nama Lengkap</label>
                <Input value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Nama pengguna" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} type="email" placeholder="email@zentory.id" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password Sementara</label>
                <Input value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="h-9 font-mono text-xs" />
                <p className="text-[10px] text-muted-foreground">Pengguna dapat mengubah password setelah login pertama.</p>
              </div>
            </div>
            {errForm && <p className="mt-3 text-xs text-destructive">{errForm}</p>}
            {saved && (
              <p className="mt-3 flex items-center gap-1 text-xs text-chart-3">
                <Check className="size-3" /> Pengguna berhasil ditambahkan.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
              <Button size="sm" onClick={tambahUser} disabled={!formNama || !formEmail || saving}>
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : 'Tambah'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────── TAB: TOKO ─────────────── */

function TokoTab() {
  const [toko, setToko] = useState(MOCK_TOKO)
  const [saved, setSaved] = useState(false)

  function set(key: keyof typeof MOCK_TOKO, val: string) {
    setToko((prev) => ({ ...prev, [key]: val }))
  }

  function saveToko() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const rows: { label: string; key: keyof typeof MOCK_TOKO; type?: string; readonly?: boolean }[] = [
    { label: 'Nama Toko',    key: 'nama' },
    { label: 'Alamat',       key: 'alamat' },
    { label: 'Telepon',      key: 'telepon',     type: 'tel' },
    { label: 'Email Toko',   key: 'email',       type: 'email' },
    { label: 'Mata Uang',    key: 'mataUang',    readonly: true },
    { label: 'Format Angka', key: 'formatAngka', readonly: true },
    { label: 'Zona Waktu',   key: 'zonaWaktu',   readonly: true },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-5 text-sm font-semibold">Informasi Toko</h2>
      <div className="space-y-4 max-w-lg">
        {rows.map((r) => (
          <div key={r.key} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{r.label}</label>
            {r.readonly ? (
              <div className="flex h-9 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                {toko[r.key]}
              </div>
            ) : (
              <Input
                value={toko[r.key]}
                onChange={(e) => set(r.key, e.target.value)}
                type={r.type ?? 'text'}
                className="h-9"
              />
            )}
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground/60">
          Mata uang, format angka, dan zona waktu hanya dapat diubah oleh administrator sistem.
        </p>
        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={saveToko} className="gap-2">
            {saved ? <><Check className="size-3.5" /> Tersimpan</> : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </div>
  )
}
