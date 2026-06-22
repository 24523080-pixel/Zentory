'use client'

import { useState } from 'react'
import { User, Store, Users, Eye, EyeOff, Check, X, Plus, KeyRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MOCK_USERS, MOCK_TOKO, type AppUser, type UserRole, type UserStatus } from '../_data'

type Tab = 'profil' | 'pengguna' | 'toko'

const ROLE_LABEL: Record<UserRole, string>    = { manager: 'Manager', admin: 'Admin Staff', kasir: 'Kasir' }
const ROLE_BADGE: Record<UserRole, string>    = {
  manager: 'bg-primary/10 text-primary',
  admin:   'bg-chart-3/15 text-chart-3',
  kasir:   'bg-chart-4/15 text-chart-4',
}
const STATUS_BADGE: Record<UserStatus, string> = {
  Aktif:    'bg-chart-3/15 text-chart-3',
  Nonaktif: 'bg-muted text-muted-foreground',
}

interface Props {
  role:       string
  userName:   string
  userEmail:  string
}

export function PengaturanClient({ role, userName, userEmail }: Props) {
  const isManager = role === 'manager'

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profil',    label: 'Profil & Akun',       icon: User  },
    ...(isManager ? [{ id: 'pengguna' as Tab, label: 'Manajemen Pengguna', icon: Users }] : []),
    { id: 'toko',      label: 'Pengaturan Toko',      icon: Store },
  ]

  const [activeTab, setActiveTab] = useState<Tab>('profil')

  return (
    <div className="mx-auto max-w-4xl">
      {/* Tab nav */}
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
  const [nama,         setNama]         = useState(userName)
  const [email,        setEmail]        = useState(userEmail)
  const [savedProfil,  setSavedProfil]  = useState(false)

  const [pwLama,       setPwLama]       = useState('')
  const [pwBaru,       setPwBaru]       = useState('')
  const [pwKonfirmasi, setPwKonfirmasi] = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [savedPw,      setSavedPw]      = useState(false)
  const [errPw,        setErrPw]        = useState('')

  const initials = nama.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const roleLabel: Record<string, string> = { manager: 'Manager', admin: 'Admin Staff', kasir: 'Kasir' }

  function saveProfil() {
    setSavedProfil(true)
    setTimeout(() => setSavedProfil(false), 2000)
  }

  function savePw() {
    setErrPw('')
    if (!pwLama) return setErrPw('Masukkan password lama.')
    if (pwBaru.length < 6) return setErrPw('Password baru minimal 6 karakter.')
    if (pwBaru !== pwKonfirmasi) return setErrPw('Konfirmasi password tidak cocok.')
    setSavedPw(true)
    setPwLama(''); setPwBaru(''); setPwKonfirmasi('')
    setTimeout(() => setSavedPw(false), 2000)
  }

  return (
    <div className="space-y-5">

      {/* Info akun */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-sm font-semibold">Informasi Akun</h2>
        <div className="flex items-start gap-5">
          {/* Avatar */}
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
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <p className="text-sm font-medium">{roleLabel[role] ?? role}</p>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={saveProfil} className="gap-2">
                {savedProfil ? <><Check className="size-3.5" /> Tersimpan</> : 'Simpan Perubahan'}
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
          {savedPw && <p className="text-xs text-chart-3 flex items-center gap-1"><Check className="size-3" /> Password berhasil diperbarui.</p>}
          <div className="flex justify-end pt-1">
            <Button size="sm" variant="outline" onClick={savePw} className="gap-2">
              <KeyRound className="size-3.5" />
              Perbarui Password
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ─────────────── TAB: PENGGUNA ─────────────── */

function PenggunaTab() {
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS)
  const [showModal, setShowModal] = useState(false)

  // form state tambah user
  const [formNama,  setFormNama]  = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole,  setFormRole]  = useState<UserRole>('kasir')
  const [saved,     setSaved]     = useState(false)

  function toggleStatus(id: string) {
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, status: u.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : u
    ))
  }

  function resetPassword(id: string) {
    const u = users.find((x) => x.id === id)
    alert(`Link reset password telah dikirim ke ${u?.email}`)
  }

  function tambahUser() {
    if (!formNama || !formEmail) return
    const newUser: AppUser = {
      id:        `u${Date.now()}`,
      nama:       formNama,
      email:      formEmail,
      role:       formRole,
      status:     'Aktif',
      bergabung:  new Date().toISOString().split('T')[0],
    }
    setUsers((prev) => [...prev, newUser])
    setFormNama(''); setFormEmail(''); setFormRole('kasir')
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowModal(false) }, 1200)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} pengguna terdaftar</p>
        <Button size="sm" onClick={() => setShowModal(true)} className="gap-2">
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
                  <div className="flex items-center gap-1">
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
                    <button
                      type="button"
                      onClick={() => resetPassword(u.id)}
                      title="Reset password"
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <KeyRound className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
            </div>
            {saved && (
              <p className="mt-3 flex items-center gap-1 text-xs text-chart-3">
                <Check className="size-3" /> Pengguna berhasil ditambahkan.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
              <Button size="sm" onClick={tambahUser} disabled={!formNama || !formEmail}>
                Tambah
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
    { label: 'Nama Toko',         key: 'nama' },
    { label: 'Alamat',            key: 'alamat' },
    { label: 'Telepon',           key: 'telepon', type: 'tel' },
    { label: 'Email Toko',        key: 'email',   type: 'email' },
    { label: 'Mata Uang',         key: 'mataUang',   readonly: true },
    { label: 'Format Angka',      key: 'formatAngka', readonly: true },
    { label: 'Zona Waktu',        key: 'zonaWaktu',   readonly: true },
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
