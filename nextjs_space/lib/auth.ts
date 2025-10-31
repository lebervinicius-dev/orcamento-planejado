
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Se é um novo login
      if (user) {
        token.id = user.id
        
        // Busca o role, isActive e status do banco
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, isActive: true, status: true }
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.isActive = dbUser.isActive
          token.status = dbUser.status
        }
      }
      
      // Atualiza o status a cada requisição (opcional, mas útil para pegar mudanças)
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isActive: true, status: true }
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.isActive = dbUser.isActive
          token.status = dbUser.status
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
        session.user.status = token.status as string
      }
      return session
    },
  },
}
