import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'zentory-owner-2025'

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}))
  if (password !== PASSWORD) {
    return NextResponse.json({ message: 'Password salah.' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('zentory-superadmin', 'authenticated', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8,
    sameSite: 'lax',
  })
  return res
}
