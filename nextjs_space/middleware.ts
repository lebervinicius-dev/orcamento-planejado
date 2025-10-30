
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isHomePage = req.nextUrl.pathname === '/'

  // Verificar se o usuário está ativo (se autenticado)
  if (isAuth && token?.email && isDashboard) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: token.email as string },
        select: { status: true, isActive: true }
      })

      // Se usuário cancelado ou suspenso, redireciona para página de acesso negado
      if (user && (user.status === 'CANCELED' || user.status === 'SUSPENDED' || !user.isActive)) {
        const deniedUrl = new URL('/auth/access-denied', req.url)
        deniedUrl.searchParams.set('reason', user.status === 'CANCELED' ? 'canceled' : 'suspended')
        return NextResponse.redirect(deniedUrl)
      }
    } catch (error) {
      console.error('Erro ao verificar status do usuário:', error)
      // Permite continuar em caso de erro de conexão
    }
  }

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
