import 'server-only'
import { PrismaClient } from '@prisma/client'

// Validação de ambiente e formatação da DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL não está definida! Verifique seu arquivo .env'
  )
}

// Adiciona parâmetros necessários para Supabase/PgBouncer se não existirem
let databaseUrl = process.env.DATABASE_URL
if (!databaseUrl.includes('pgbouncer=true')) {
  const separator = databaseUrl.includes('?') ? '&' : '?'
  const params = [
    'pgbouncer=true',
    'connection_limit=1',
    'sslmode=require'
  ]
  
  // Adiciona apenas os parâmetros que faltam
  const missingParams = params.filter(param => !databaseUrl.includes(param.split('=')[0]))
  if (missingParams.length > 0) {
    databaseUrl = `${databaseUrl}${separator}${missingParams.join('&')}`
    console.log('✅ Parâmetros de conexão otimizados adicionados automaticamente')
  }
}

// Configuração global do Prisma com proteção contra múltiplas instâncias
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Opções de configuração otimizadas para serverless e Supabase
const prismaOptions = {
  log: ['warn'] as any, // Apenas warnings para reduzir ruído
  errorFormat: 'minimal' as any,
  // Configurações de datasource para serverless
  datasources: {
    db: {
      url: databaseUrl
    }
  }
}

// Função para criar uma nova instância do Prisma Client
function createPrismaClient() {
  const client = new PrismaClient(prismaOptions)

  // Middleware para gerenciar conexões e prevenir timeouts
  client.$use(async (params, next) => {
    const maxRetries = 3
    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await next(params)
      } catch (error: any) {
        lastError = error
        
        // Detecta erros de conexão idle/timeout
        const isConnectionError = 
          error?.code === 'P1017' || // Connection pool timeout
          error?.code === 'P2024' || // Timed out fetching a new connection
          error?.code === 'P1001' || // Can't reach database server
          error?.message?.includes('idle-session timeout') ||
          error?.message?.includes('Connection terminated unexpectedly') ||
          error?.message?.includes('terminating connection due to idle')
        
        if (isConnectionError && attempt < maxRetries) {
          console.warn(`⚠️ Timeout detectado (tentativa ${attempt}/${maxRetries}), reconectando...`)
          // Desconecta e aguarda antes de retry
          await client.$disconnect().catch(() => {})
          await new Promise(resolve => setTimeout(resolve, Math.min(500 * attempt, 2000)))
          continue
        }
        
        // Se não é erro de conexão ou já esgotamos as tentativas
        throw error
      }
    }
    
    throw lastError
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

// Cleanup em desenvolvimento
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
