/**
 * Helpers para queries do Prisma com retry automático e tratamento de erros
 */
import { PrismaClient } from '@prisma/client'
import { prisma, withRetry } from './db'

// Re-exporta o prisma client com as melhorias
export { prisma }

/**
 * Executa uma operação no banco com retry automático em caso de timeout
 * 
 * @example
 * const user = await safeQuery(() => 
 *   prisma.user.findUnique({ where: { id: userId } })
 * )
 */
export async function safeQuery<T>(operation: () => Promise<T>): Promise<T> {
  return withRetry(operation)
}

/**
 * Executa múltiplas queries em uma transação com retry
 * 
 * @example
 * const result = await safeTransaction(async (tx) => {
 *   const user = await tx.user.update({...})
 *   const transaction = await tx.transaction.create({...})
 *   return { user, transaction }
 * })
 */
export async function safeTransaction<T>(
  operation: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return withRetry(async () => {
    return await prisma.$transaction(async (tx) => {
      return await operation(tx)
    })
  })
}

/**
 * Verifica se o erro é relacionado a conexão/timeout
 */
export function isConnectionError(error: any): boolean {
  return (
    error?.code === 'P1017' || // Connection pool timeout
    error?.code === 'P2024' || // Timed out fetching a new connection  
    error?.code === 'P1001' || // Can't reach database server
    error?.message?.includes('idle-session timeout') ||
    error?.message?.includes('Connection terminated unexpectedly') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('ETIMEDOUT')
  )
}

/**
 * Tenta executar uma query e retorna null se falhar (útil para queries opcionais)
 */
export async function tryQuery<T>(
  operation: () => Promise<T>,
  defaultValue: T | null = null
): Promise<T | null> {
  try {
    return await safeQuery(operation)
  } catch (error) {
    console.error('Query falhou (retornando valor padrão):', error)
    return defaultValue
  }
}
