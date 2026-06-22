import { NextRequest, NextResponse } from 'next/server'

// Mock users — ganti dengan DB query saat backend nyata tersedia
const MOCK_USERS = [
  { email: 'manager@zentory.id', password: 'manager123', role: 'manager', name: 'Budi Santoso' },
  { email: 'admin@zentory.id',   password: 'admin123',   role: 'admin',   name: 'Sinta Dewi'   },
  { email: 'kasir@zentory.id',   password: 'kasir123',   role: 'kasir',   name: 'Eko Prasetyo'  },
]

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: 'Email dan password wajib diisi.' }, { status: 400 })
  }

  const user = MOCK_USERS.find(
    (u) => u.email === body.email && u.password === body.password,
  )

  if (!user) {
    return NextResponse.json({ message: 'Email atau password salah.' }, { status: 401 })
  }

  const payload = JSON.stringify({ email: user.email, name: user.name, role: user.role })
  const res = NextResponse.json({ user: JSON.parse(payload) }, { status: 200 })
  res.cookies.set('zentory-token', payload, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 jam
    sameSite: 'lax',
  })
  return res
}
