
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { TransactionForm } from '@/components/transactions/transaction-form'

export default async function NewTransactionPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Buscar categorias do usuário
  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Nova Transação</h1>
        <p className="text-[#737373] mt-2">Adicione uma nova receita ou despesa</p>
      </div>

      <div className="card">
        <TransactionForm 
          categories={categories}
          mode="create"
        />
      </div>
    </div>
  )
}
