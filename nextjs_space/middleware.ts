
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')

    // Se está na página de auth e está autenticado, redireciona para dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Se está no dashboard e não está autenticado, redireciona para login
    if (isDashboard && !isAuth) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // Gerenciamos a autorização no middleware acima
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
}
