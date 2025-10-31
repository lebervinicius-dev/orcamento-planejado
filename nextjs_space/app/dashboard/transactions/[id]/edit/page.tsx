
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { TransactionForm } from '@/components/transactions/transaction-form'

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Buscar a transação
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      category: true,
    },
  })

  if (!transaction) {
    notFound()
  }

  // Buscar categorias do usuário (apenas INCOME e EXPENSE, não INVESTMENT)
  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
      type: {
        in: ['INCOME', 'EXPENSE'],
      },
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  })

  const transformedTransaction = {
    ...transaction,
    amount: Number(transaction.amount),
    date: transaction.date.toISOString().split('T')[0],
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Editar Transação</h1>
        <p className="text-[#737373] mt-2">Atualize os dados da sua transação</p>
      </div>

      <div className="card">
        <TransactionForm 
          categories={categories as any}
          mode="edit"
          transaction={transformedTransaction}
        />
      </div>
    </div>
  )
}
