

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { InvestmentsClient } from '@/components/investments/investments-client'

export default async function InvestmentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Buscar metas do usuário
  const goals = await prisma.goal.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      investments: {
        orderBy: {
          date: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Buscar todos os investimentos
  const investments = await prisma.investment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      goal: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  // Serializar dados
  const serializedGoals = goals.map((goal: any) => ({
    ...goal,
    targetAmount: Number(goal.targetAmount),
    progress: Number(goal.progress),
    investments: goal.investments.map((inv: any) => ({
      ...inv,
      amount: Number(inv.amount),
    })),
  }))

  const serializedInvestments = investments.map((inv: any) => ({
    ...inv,
    amount: Number(inv.amount),
    goal: inv.goal ? {
      ...inv.goal,
      targetAmount: Number(inv.goal.targetAmount),
      progress: Number(inv.goal.progress),
    } : null,
  }))

  return (
    <InvestmentsClient 
      initialGoals={serializedGoals}
      initialInvestments={serializedInvestments}
    />
  )
}
