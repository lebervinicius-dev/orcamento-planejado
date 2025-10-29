
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isHomePage = req.nextUrl.pathname === '/'

  // Se está autenticado e na home, redireciona para dashboard
  if (isHomePage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Se está na página de auth e está autenticado, redireciona para dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Se está no dashboard e não está autenticado, redireciona para login
  if (isDashboard && !isAuth) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth/:path*']
}
