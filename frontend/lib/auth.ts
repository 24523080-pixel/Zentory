import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function getSession() {
  const cookieStore = await cookies()
  const raw = cookieStore.get('zentory-token')?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as { id: string; email: string; name: string; role: string }
  } catch {
    return null
  }
}

export function requireRole(session: { role: string } | null, ...roles: string[]) {
  if (!session) return false
  return roles.includes(session.role)
}
