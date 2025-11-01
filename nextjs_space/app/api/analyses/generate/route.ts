import 'server-only'


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TransactionType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Pegar o mês/ano atual
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Primeira data do mês
    const startDate = new Date(year, month - 1, 1)
    // Última data do mês
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Verificar se já existe análise gerada hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingAnalysisToday = await prisma.aiAnalysis.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (existingAnalysisToday) {
      return NextResponse.json(
        { error: 'Você já gerou uma análise hoje. Tente novamente amanhã!' },
        { status: 400 }
      )
    }

    // Buscar transações do mês atual
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    })

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma transação encontrada neste mês' },
        { status: 400 }
      )
    }

    // Buscar metas do usuário
    const goals = await prisma.goal.findMany({
      where: { userId },
      select: {
        name: true,
        targetAmount: true,
        progress: true,
      },
    })

    // Buscar aportes da carteira de investimentos
    const investments = await prisma.investment.findMany({
      where: {
        userId,
      },
      include: {
        goal: {
          select: {
            name: true,
          },
        },
      },
    })

    // Calcular diversificação de investimentos por categoria
    const investmentsByCategory: Record<string, number> = {}
    investments.forEach((inv: any) => {
      const catName = inv.category || 'Outros'
      investmentsByCategory[catName] = (investmentsByCategory[catName] || 0) + Number(inv.amount)
    })

    const totalInvestments = Object.values(investmentsByCategory).reduce((sum, val) => sum + val, 0)
    const investmentDiversification = Object.entries(investmentsByCategory).map(([categoria, total]) => ({
      categoria,
      total,
      percentual: totalInvestments > 0 ? ((total / totalInvestments) * 100).toFixed(1) : 0,
    }))

    // Calcular investimentos por meta
    const investmentsByGoal: Record<string, number> = {}
    investments.forEach((inv: any) => {
      const goalName = inv.goal?.name || 'Sem meta definida'
      investmentsByGoal[goalName] = (investmentsByGoal[goalName] || 0) + Number(inv.amount)
    })

    // Calcular métricas
    const income = transactions
      .filter((t: any) => t.type === TransactionType.INCOME)
      .reduce((sum: any, t: any) => sum + Number(t.amount), 0)

    const expenses = transactions
      .filter((t: any) => t.type === TransactionType.EXPENSE)
      .reduce((sum: any, t: any) => sum + Number(t.amount), 0)

    const balance = income - expenses

    // Médias (4.3 semanas por mês)
    const weeklyIncomeAvg = income / 4.3
    const weeklyExpenseAvg = expenses / 4.3
    const weeklyBalanceAvg = balance / 4.3

    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyIncomeAvg = income / daysInMonth
    const dailyExpenseAvg = expenses / daysInMonth
    const dailyBalanceAvg = balance / daysInMonth

    // Top categorias de renda
    const incomeByCategory: Record<string, number> = {}
    transactions
      .filter((t: any) => t.type === TransactionType.INCOME)
      .forEach((t: any) => {
        const catName = t.category?.name || 'Sem categoria'
        incomeByCategory[catName] = (incomeByCategory[catName] || 0) + Number(t.amount)
      })

    const topIncomeCategories = Object.entries(incomeByCategory)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3)
      .map(([categoria, total]: any) => ({ categoria, total }))

    // Top categorias de despesa
    const expenseByCategory: Record<string, number> = {}
    transactions
      .filter((t: any) => t.type === TransactionType.EXPENSE)
      .forEach((t: any) => {
        const catName = t.category?.name || 'Sem categoria'
        expenseByCategory[catName] = (expenseByCategory[catName] || 0) + Number(t.amount)
      })

    const topExpenseCategories = Object.entries(expenseByCategory)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([categoria, total]: any) => ({ categoria, total }))

    // Outliers (transações > 2x a média diária de despesa)
    const avgExpensePerTransaction =
      expenses / transactions.filter((t: any) => t.type === TransactionType.EXPENSE).length || 0
    const threshold = avgExpensePerTransaction * 2

    const outliers = transactions
      .filter((t: any) => t.type === TransactionType.EXPENSE && Number(t.amount) > threshold)
      .sort((a: any, b: any) => Number(b.amount) - Number(a.amount))
      .slice(0, 3)
      .map((t: any) => ({
        descricao: t.description,
        categoria: t.category?.name || 'Sem categoria',
        valor: Number(t.amount),
        data: t.date.toISOString().split('T')[0],
      }))

    // Montar o payload para a Sofia
    const payload = {
      referencia: {
        ano: year,
        mes: `${year}-${String(month).padStart(2, '0')}`,
      },
      renda: {
        total_mes_reais: income,
        media_semanal_reais: weeklyIncomeAvg,
        media_diaria_reais: dailyIncomeAvg,
        top_categorias: topIncomeCategories,
      },
      gastos: {
        total_mes_reais: expenses,
        media_semanal_reais: weeklyExpenseAvg,
        media_diaria_reais: dailyExpenseAvg,
        top_categorias: topExpenseCategories,
        outliers: outliers.length > 0 ? outliers : undefined,
      },
      saldo: {
        mes_reais: balance,
        media_semanal_reais: weeklyBalanceAvg,
        media_diaria_reais: dailyBalanceAvg,
      },
      metas: goals.length > 0 ? goals.map(g => ({
        nome: g.name,
        meta_reais: Number(g.targetAmount),
        atual_reais: Number(g.progress),
        progresso_percentual: Number(g.targetAmount) > 0 
          ? ((Number(g.progress) / Number(g.targetAmount)) * 100).toFixed(1) 
          : 0,
      })) : undefined,
      investimentos: totalInvestments > 0 ? {
        total_reais: totalInvestments,
        diversificacao: investmentDiversification,
        por_meta: Object.entries(investmentsByGoal).map(([meta, total]) => ({
          meta,
          total_investido: total,
          percentual: totalInvestments > 0 ? ((total / totalInvestments) * 100).toFixed(1) : 0,
        })),
      } : undefined,
    }

    // Chamar a IA com o prompt da Sofia
    const systemPrompt = `Você é Sofia, uma consultora financeira de inteligência artificial especializada em planejamento financeiro pessoal, finanças comportamentais e investimentos baseados em metas (Goal-Based Investing).

Sua missão é ajudar o usuário a compreender, organizar e melhorar sua vida financeira, oferecendo análises, orientações e insights personalizados, de forma empática, clara e objetiva.

Funções principais:

1. **Análise Financeira Geral**: Avalie o orçamento, a renda, os gastos e o comportamento financeiro do usuário, identificando padrões e oportunidades de melhoria.

2. **Metodologia Goal-Based Investing**: Auxilie o usuário a acompanhar e revisar metas financeiras (como aposentadoria, reserva de emergência, compra de imóvel, viagens, etc.), sugerindo estratégias de investimento adequadas a cada meta.

3. **Asset Allocation e Carteira de Investimentos**: Com base nas metas, perfil e horizonte de tempo, ofereça recomendações gerais de alocação de ativos (renda fixa, ações, fundos, multimercados, internacionais, etc.), sempre de forma educativa e sem citar produtos específicos.

4. **Análise de Diversificação**: Apresente uma visão geral da carteira, avaliando se está bem diversificada e equilibrada entre diferentes classes de ativos.

5. **Acompanhamento de Metas**: Traga um resumo simples do progresso das metas financeiras e do desempenho da carteira em relação aos objetivos traçados.

6. **Educação Financeira e Comportamental**: Explique conceitos de forma acessível, ajude o usuário a entender suas decisões financeiras e incentive hábitos saudáveis de consumo e investimento.

Tom e Estilo de Comunicação:
- Clara, empática e inspiradora — nunca técnica em excesso.
- Fale como uma consultora humana próxima, que guia com confiança e respeito.
- Evite jargões e sempre busque gerar consciência e segurança financeira.

Limitações e Ética:
- Não ofereça recomendações de produtos específicos, corretoras ou investimentos diretos.
- Todas as orientações são educacionais e informativas, com o objetivo de ajudar o usuário a tomar decisões mais conscientes.

Estrutura da Análise:
1. Compare renda e gastos em R$, apresente o saldo mensal.
2. Identifique categorias de maior gasto e outliers (se houver).
3. Avalie o progresso das metas financeiras definidas.
4. Analise a diversificação da carteira de investimentos.
5. Proponha 2-3 micro-ajustes práticos.
6. Recapitule em 3-4 bullets curtos e feche com uma frase motivacional.

Limites:
- Use sempre "R$" ou "reais" para valores monetários.
- Resposta: ~200–250 palavras máximo.`

    const userPrompt = `Analise os dados financeiros abaixo e forneça uma consultoria empática e prática:

${JSON.stringify(payload, null, 2)}`

    // Chamar a API da IA
    const aiResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('Erro da API IA:', aiResponse.status, errorText)
      throw new Error(`Erro ao gerar análise com IA: ${aiResponse.status} - ${errorText}`)
    }

    const aiData = await aiResponse.json()
    const analysisContent = aiData.choices?.[0]?.message?.content || 'Análise não disponível'

    // Extrair recomendações (bullets após "Recapitulando")
    const recommendations: string[] = []
    const recapMatch = analysisContent.match(/Recapitulando[:\s]*([\s\S]*?)(?:\n\n|$)/i)
    if (recapMatch) {
      const recapText = recapMatch[1]
      const bullets = recapText.match(/[-•*]\s*(.+)/g)
      if (bullets) {
        recommendations.push(...bullets.map((b: string) => b.replace(/^[-•*]\s*/, '').trim()))
      }
    }

    // Criar a análise no banco
    const analysis = await prisma.aiAnalysis.create({
      data: {
        userId,
        title: `Análise Financeira - ${new Date(year, month - 1).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })}`,
        content: analysisContent,
        insights: JSON.stringify({
          totalIncome: income,
          totalExpenses: expenses,
          savings: balance,
          savingsRate: income > 0 ? (balance / income) * 100 : 0,
          topExpenseCategory: topExpenseCategories[0]?.categoria,
          topExpenseAmount: topExpenseCategories[0]?.total,
          recommendations: recommendations.length > 0 ? recommendations : undefined,
        }),
        periodStart: startDate,
        periodEnd: endDate,
      },
    })

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('Erro ao gerar análise:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar análise' },
      { status: 500 }
    )
  }
}
