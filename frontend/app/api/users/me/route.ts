import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ message: 'Nama tidak boleh kosong.' }, { status: 400 })

  await prisma.user.update({
    where: { id: session.id },
    data: { name: name.trim() },
  })

  return NextResponse.json({ success: true })
}
