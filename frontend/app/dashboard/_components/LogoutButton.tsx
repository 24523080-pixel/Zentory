'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Keluar"
      className="text-muted-foreground transition-colors hover:text-destructive"
    >
      <LogOut className="size-4" />
    </button>
  )
}
