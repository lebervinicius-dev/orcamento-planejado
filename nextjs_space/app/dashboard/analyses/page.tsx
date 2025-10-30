
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AnalysesClient } from '@/components/analyses/analyses-client'

export default async function AnalysesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Buscar análises do usuário
  const analyses = await prisma.aiAnalysis.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Verificar se há dados financeiros para análise
  const transactionCount = await prisma.transaction.count({
    where: {
      userId: session.user.id,
    },
  })

  const transformedAnalyses = analyses.map((analysis: any) => ({
    ...analysis,
    insights: JSON.parse(analysis.insights),
  }))

  return (
    <AnalysesClient 
      analyses={transformedAnalyses}
      hasTransactions={transactionCount > 0}
    />
  )
}
