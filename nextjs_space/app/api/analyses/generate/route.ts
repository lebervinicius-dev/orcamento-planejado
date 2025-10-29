
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se há transações suficientes
    const transactionCount = await prisma.transaction.count({
      where: { userId: session.user.id }
    })

    if (transactionCount < 3) {
      return NextResponse.json(
        { error: 'Adicione pelo menos 3 transações para gerar uma análise' },
        { status: 400 }
      )
    }

    // Definir período de análise (último mês)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)

    // Buscar dados para análise
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      }
    })

    // Se não há transações no período, usar todas
    const analysisTransactions = transactions.length > 0 ? transactions : await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 50, // Últimas 50 transações
    })

    if (analysisTransactions.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma transação encontrada para análise' },
        { status: 400 }
      )
    }

    // Calcular estatísticas
    const income = analysisTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = analysisTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const savings = income - expenses
    const savingsRate = income > 0 ? (savings / income) * 100 : 0

    // Categorias com mais gastos
    const expensesByCategory = analysisTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || 'Outros'
        acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount)
        return acc
      }, {} as Record<string, number>)

    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0]

    // Preparar dados para a IA
    const analysisData = {
      period: transactions.length > 0 ? 'último mês' : 'histórico geral',
      totalTransactions: analysisTransactions.length,
      totalIncome: income,
      totalExpenses: expenses,
      savings: savings,
      savingsRate: savingsRate,
      topExpenseCategory: topExpenseCategory ? topExpenseCategory[0] : null,
      topExpenseAmount: topExpenseCategory ? topExpenseCategory[1] : 0,
      expensesByCategory: Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount }))
    }

    // Chamar a API de IA para gerar a análise
    const aiResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{
          role: 'user',
          content: `Você é um consultor financeiro especialista em finanças pessoais brasileiras. Analise os seguintes dados financeiros e forneça insights personalizados e recomendações práticas.

DADOS FINANCEIROS (${analysisData.period}):
- Total de transações: ${analysisData.totalTransactions}
- Receitas: R$ ${analysisData.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Despesas: R$ ${analysisData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Saldo: R$ ${analysisData.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Taxa de economia: ${analysisData.savingsRate.toFixed(1)}%
- Maior categoria de gasto: ${analysisData.topExpenseCategory} (R$ ${analysisData.topExpenseAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})

DISTRIBUIÇÃO DE GASTOS:
${analysisData.expensesByCategory.map(cat => `- ${cat.name}: R$ ${cat.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')}

Forneça uma análise estruturada incluindo:

1. **RESUMO EXECUTIVO**
   - Avaliação geral da situação financeira
   - Principal ponto forte e área de melhoria

2. **ANÁLISE DETALHADA**
   - Padrões de gastos identificados
   - Comparação com padrões brasileiros saudáveis
   - Tendências preocupantes ou positivas

3. **RECOMENDAÇÕES PRÁTICAS**
   - 3-5 ações específicas e implementáveis
   - Dicas de economia personalizadas
   - Sugestões de metas financeiras

4. **PRÓXIMOS PASSOS**
   - Plano de ação para os próximos 30 dias

Use linguagem acessível, seja direto e prático. Foque em soluções aplicáveis ao contexto brasileiro.`
        }],
        max_tokens: 3000,
        temperature: 0.7
      })
    })

    if (!aiResponse.ok) {
      console.error('Erro na API de IA:', await aiResponse.text())
      return NextResponse.json(
        { error: 'Erro ao gerar análise com IA' },
        { status: 500 }
      )
    }

    const aiData = await aiResponse.json()
    const analysisContent = aiData.choices?.[0]?.message?.content

    if (!analysisContent) {
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      )
    }

    // Gerar recomendações estruturadas
    const recommendations = [
      savingsRate < 10 ? 'Tente economizar pelo menos 10% da sua renda mensal' : null,
      analysisData.topExpenseAmount > (income * 0.3) ? `Reduza gastos em ${analysisData.topExpenseCategory}` : null,
      income === 0 ? 'Registre suas fontes de renda para ter um controle completo' : null,
      analysisTransactions.length < 10 ? 'Registre todas as suas transações para análises mais precisas' : null,
      savingsRate > 20 ? 'Considere investir parte da sua economia' : null,
    ].filter(Boolean) as string[]

    // Salvar análise no banco
    const analysis = await prisma.aiAnalysis.create({
      data: {
        title: `Análise Financeira - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        content: analysisContent,
        periodStart: transactions.length > 0 ? startDate : new Date(analysisTransactions[analysisTransactions.length - 1]?.date || new Date()),
        periodEnd: endDate,
        insights: JSON.stringify({
          totalIncome: income,
          totalExpenses: expenses,
          savings: savings,
          savingsRate: savingsRate,
          topExpenseCategory: analysisData.topExpenseCategory,
          topExpenseAmount: analysisData.topExpenseAmount,
          recommendations: recommendations
        }),
        userId: session.user.id,
      }
    })

    return NextResponse.json({
      message: 'Análise gerada com sucesso',
      analysisId: analysis.id
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao gerar análise:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
