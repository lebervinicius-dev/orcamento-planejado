
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma, withRetry } from '@/lib/db'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Verificar se é primeiro login e forçar troca de senha
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstLogin: true }
  })

  if (user?.firstLogin) {
    redirect('/dashboard/first-login')
  }

  // Buscar dados do usuário
  const currentDate = new Date()
  const currentMonth = searchParams.month ? parseInt(searchParams.month) : currentDate.getMonth()
  const currentYear = searchParams.year ? parseInt(searchParams.year) : currentDate.getFullYear()
  const startOfMonth = new Date(currentYear, currentMonth, 1)
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

  // Receitas do mês atual
  const monthlyIncome = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      type: 'INCOME',
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  // Despesas do mês atual
  const monthlyExpenses = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      type: 'EXPENSE',
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  // Dados dos últimos 12 meses para o gráfico de linha
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(currentYear, currentMonth - i, 1)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)

    const monthIncome = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: 'INCOME',
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const monthExpenses = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: 'EXPENSE',
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    monthlyData.push({
      month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      income: Number(monthIncome._sum.amount || 0),
      expenses: Number(monthExpenses._sum.amount || 0),
      balance: Number(monthIncome._sum.amount || 0) - Number(monthExpenses._sum.amount || 0),
    })
  }

  // Última análise de IA
  const latestAnalysis = await prisma.aiAnalysis.findFirst({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Transformar dados para o cliente
  const selectedDate = new Date(currentYear, currentMonth, 1)
  const dashboardData = {
    monthlyIncome: monthlyIncome.map((transaction: any) => ({
      ...transaction,
      amount: Number(transaction.amount),
    })),
    monthlyExpenses: monthlyExpenses.map((transaction: any) => ({
      ...transaction,
      amount: Number(transaction.amount),
    })),
    monthlyData,
    latestAnalysis: latestAnalysis ? {
      ...latestAnalysis,
      insights: JSON.parse(latestAnalysis.insights),
    } : null,
    currentMonth: selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    selectedMonth: currentMonth,
    selectedYear: currentYear,
  }

  return <DashboardClient data={dashboardData} />
}
