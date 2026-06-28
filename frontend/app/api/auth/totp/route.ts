import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateSecret, verifyTOTP, keyuri } from '@/lib/totp'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where:  { id: session.id },
    select: { totpSecret: true },
  })

  return NextResponse.json({ isSetup: !!user?.totpSecret })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { action, secret, code } = await req.json()

  if (action === 'generate') {
    const newSecret = generateSecret()
    const otpauth   = keyuri(session.email, 'Zentory', newSecret)
    const qrSvg     = await QRCode.toString(otpauth, { type: 'svg', width: 240, margin: 2 })
    return NextResponse.json({ secret: newSecret, qrSvg })
  }

  if (action === 'activate') {
    if (!secret || !code) {
      return NextResponse.json({ message: 'Secret dan kode wajib diisi.' }, { status: 400 })
    }
    const isValid = verifyTOTP(String(code), String(secret))
    if (!isValid) {
      return NextResponse.json({ message: 'Kode tidak valid. Coba lagi.' }, { status: 400 })
    }
    await prisma.user.update({
      where: { id: session.id },
      data:  { totpSecret: secret },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ message: 'Action tidak valid.' }, { status: 400 })
}

export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  await prisma.user.update({
    where: { id: session.id },
    data:  { totpSecret: null },
  })

  return NextResponse.json({ success: true })
}
