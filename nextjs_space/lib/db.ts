import 'server-only'
import { PrismaClient } from '@prisma/client'

// Validação de ambiente
if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL não está definida! Verifique seu arquivo .env'
  )
}

// Configuração global do Prisma com proteção contra múltiplas instâncias
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Opções de configuração do Prisma Client com logs e timeouts
const prismaOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? (['error', 'warn'] as any)
    : (['error'] as any),
  errorFormat: 'minimal' as any,
}

// Singleton do Prisma Client
export const prisma = 
  globalForPrisma.prisma ?? 
  new PrismaClient(prismaOptions)

// Previne múltiplas instâncias em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Garante que a conexão seja fechada quando o processo terminar
if (typeof window === 'undefined') {
  const cleanup = async () => {
    await prisma.$disconnect()
  }
  
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}
