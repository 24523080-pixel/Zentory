export type UserRole   = 'manager' | 'admin' | 'kasir'
export type UserStatus = 'Aktif' | 'Nonaktif'

export interface AppUser {
  id:       string
  nama:     string
  email:    string
  role:     UserRole
  status:   UserStatus
  bergabung: string
}

export const MOCK_USERS: AppUser[] = [
  { id: 'u1', nama: 'Budi Santoso',    email: 'manager@zentory.id', role: 'manager', status: 'Aktif',    bergabung: '2024-01-15' },
  { id: 'u2', nama: 'Sari Dewi',       email: 'admin@zentory.id',   role: 'admin',   status: 'Aktif',    bergabung: '2024-02-03' },
  { id: 'u3', nama: 'Andi Pratama',    email: 'kasir@zentory.id',   role: 'kasir',   status: 'Aktif',    bergabung: '2024-03-10' },
  { id: 'u4', nama: 'Rina Kusuma',     email: 'rina@zentory.id',    role: 'kasir',   status: 'Aktif',    bergabung: '2024-05-21' },
  { id: 'u5', nama: 'Hendra Wijaya',   email: 'hendra@zentory.id',  role: 'admin',   status: 'Nonaktif', bergabung: '2024-04-07' },
]

export const MOCK_TOKO = {
  nama:       'Toko Segar Jaya',
  alamat:     'Jl. Pasar Baru No. 12, Yogyakarta 55221',
  telepon:    '0274-512345',
  email:      'tokosegarjaya@gmail.com',
  mataUang:   'IDR (Rp)',
  formatAngka: '1.000,00',
  zonaWaktu:  'WIB (UTC+7)',
}
