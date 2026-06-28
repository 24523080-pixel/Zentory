import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: 'Email dan password wajib diisi.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } })

  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ message: 'Email atau password salah.' }, { status: 401 })
  }

  const payload = JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  res.cookies.set('zentory-token', payload, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8,
    sameSite: 'lax',
  })
  return res
}
