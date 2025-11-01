
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { TransactionsClient } from '@/components/transactions/transactions-client'
import { TransactionType } from '@prisma/client'

// Valores válidos para validação
const VALID_TRANSACTION_TYPES = [TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.INVESTMENT]

interface SearchParams {
  type?: string
  category?: string
  page?: string
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // Filtros
  const where: any = {
    userId: session.user.id,
  }

  if (searchParams.type && VALID_TRANSACTION_TYPES.includes(searchParams.type as TransactionType)) {
    where.type = searchParams.type
  }

  if (searchParams.category) {
    where.categoryId = searchParams.category
  }

  // Buscar transações
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: limit,
    skip: offset,
  })

  // Contar total para paginação
  const totalTransactions = await prisma.transaction.count({ where })

  // Buscar categorias para filtros (todos os tipos)
  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: 'asc',
    },
  })

  const transformedTransactions = transactions.map((t: any) => ({
    ...t,
    amount: Number(t.amount),
  }))

  return (
    <TransactionsClient
      transactions={transformedTransactions}
      categories={categories as any}
      totalPages={Math.ceil(totalTransactions / limit)}
      currentPage={page}
      filters={{
        type: searchParams.type,
        category: searchParams.category,
      }}
    />
  )
}
