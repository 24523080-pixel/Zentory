import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard']
const GUEST_ONLY        = ['/login']

export function middleware(req: NextRequest) {
  const token = req.cookies.get('zentory-token')?.value
  const { pathname } = req.nextUrl

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (GUEST_ONLY.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
