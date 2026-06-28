import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword, requireRole } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || !requireRole(session, 'manager')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !requireRole(session, 'manager')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, role, password } = body

  if (!name || !email || !role || !password) {
    return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 400 })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, role, passwordHash },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}
