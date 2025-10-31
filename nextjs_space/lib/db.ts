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

// Opções de configuração otimizadas para serverless
const prismaOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? (['error', 'warn'] as any)
    : (['error'] as any),
  errorFormat: 'minimal' as any,
  // Configurações de datasource para serverless
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}

// Função para criar uma nova instância do Prisma Client
function createPrismaClient() {
  const client = new PrismaClient(prismaOptions)

  // Middleware para gerenciar conexões e prevenir timeouts
  client.$use(async (params, next) => {
    try {
      return await next(params)
    } catch (error: any) {
      // Se houver erro de conexão idle, tenta reconectar
      if (
        error?.code === 'P1017' || // Connection pool timeout
        error?.code === 'P2024' || // Timed out fetching a new connection
        error?.message?.includes('idle-session timeout') ||
        error?.message?.includes('Connection terminated unexpectedly')
      ) {
        console.warn('⚠️ Detectado timeout de conexão, reconectando...')
        // Desconecta e deixa o Prisma reconectar automaticamente
        await client.$disconnect().catch(() => {})
        return await next(params)
      }
      throw error
    }
  })

  return client
}

// Singleton do Prisma Client
export const prisma = 
  globalForPrisma.prisma ?? 
  createPrismaClient()

// Previne múltiplas instâncias em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Em produção (serverless), desconecta após cada operação
// para evitar conexões idle
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  // Adiciona extensão para auto-cleanup em serverless
  const originalQuery = prisma.$queryRaw
  const originalExecuteRaw = prisma.$executeRaw
  
  // Não precisamos de cleanup manual em serverless
  // O Prisma gerencia isso automaticamente com connection pooling
}

// Em desenvolvimento, garante cleanup ao fechar
if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  const cleanup = async () => {
    try {
      await prisma.$disconnect()
    } catch (err) {
      console.error('Erro ao desconectar Prisma:', err)
    }
  }
  
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

// Função helper para executar queries com retry automático
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Se é erro de timeout/conexão e ainda temos tentativas
      const isConnectionError = 
        error?.code === 'P1017' ||
        error?.code === 'P2024' ||
        error?.message?.includes('idle-session timeout') ||
        error?.message?.includes('Connection terminated unexpectedly')
      
      if (isConnectionError && attempt < maxRetries) {
        console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou, tentando novamente...`)
        // Aguarda um pouco antes de tentar novamente (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)))
        // Força desconexão para limpar conexão problemática
        await prisma.$disconnect().catch(() => {})
        continue
      }
      
      throw error
    }
  }
  
  throw lastError
}
