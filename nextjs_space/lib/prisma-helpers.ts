
import 'server-only'
import { Prisma } from '@prisma/client'

/**
 * Helper para tratamento de erros do Prisma
 * Converte erros do Prisma em mensagens amigáveis
 */
export function handlePrismaError(error: unknown): { 
  message: string
  code?: string
  statusCode: number
} {
  // Erro do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          message: 'Já existe um registro com esses dados únicos.',
          code: error.code,
          statusCode: 409
        }
      case 'P2025':
        return {
          message: 'Registro não encontrado.',
          code: error.code,
          statusCode: 404
        }
      case 'P2003':
        return {
          message: 'Erro de relacionamento: registro relacionado não existe.',
          code: error.code,
          statusCode: 400
        }
      case 'P2014':
        return {
          message: 'Erro de relacionamento: registro está sendo usado por outros registros.',
          code: error.code,
          statusCode: 400
        }
      default:
        return {
          message: `Erro de banco de dados: ${error.message}`,
          code: error.code,
          statusCode: 500
        }
    }
  }

  // Erro de validação do Prisma
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      message: 'Dados inválidos fornecidos.',
      statusCode: 400
    }
  }

  // Erro de inicialização do Prisma
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      message: 'Erro ao conectar com o banco de dados.',
      statusCode: 503
    }
  }

  // Erro genérico
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500
    }
  }

  return {
    message: 'Erro desconhecido.',
    statusCode: 500
  }
}

/**
 * Wrapper seguro para operações do Prisma
 * Adiciona retry automático e tratamento de erros
 */
export async function safeQuery<T>(
  operation: () => Promise<T>,
  retries = 2
): Promise<{ data: T | null; error: string | null; statusCode: number }> {
  let lastError: unknown = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await operation()
      return { data, error: null, statusCode: 200 }
    } catch (error) {
      lastError = error

      // Se não for erro de conexão, não tenta novamente
      if (!(error instanceof Prisma.PrismaClientInitializationError)) {
        break
      }

      // Aguarda antes de tentar novamente (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  const errorInfo = handlePrismaError(lastError)
  return {
    data: null,
    error: errorInfo.message,
    statusCode: errorInfo.statusCode
  }
}

/**
 * Valida se estamos em ambiente servidor
 * Lança erro se tentar usar no cliente
 */
export function ensureServerSide(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      '❌ Este código só pode ser executado no servidor! ' +
      'Prisma Client não pode ser usado no navegador.'
    )
  }
}
