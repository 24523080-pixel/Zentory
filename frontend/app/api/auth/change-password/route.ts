import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, verifyPassword, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { oldPassword, newPassword } = await req.json()

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ message: 'Password baru minimal 6 karakter.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } })
  if (!user) return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 })

  const valid = await verifyPassword(oldPassword, user.passwordHash)
  if (!valid) return NextResponse.json({ message: 'Password lama salah.' }, { status: 400 })

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: session.id }, data: { passwordHash } })

  return NextResponse.json({ success: true })
}
