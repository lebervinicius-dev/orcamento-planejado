import 'server-only'


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    // Calcular métricas
    const income = transactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: any, t: any) => sum + Number(t.amount), 0)

    const expenses = transactions
      .filter((t: any) => t.type === 'EXPENSE')
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
      .filter((t: any) => t.type === 'INCOME')
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
      .filter((t: any) => t.type === 'EXPENSE')
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
      expenses / transactions.filter((t: any) => t.type === 'EXPENSE').length || 0
    const threshold = avgExpensePerTransaction * 2

    const outliers = transactions
      .filter((t: any) => t.type === 'EXPENSE' && Number(t.amount) > threshold)
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
        total_mes: income,
        media_semanal_estimada: weeklyIncomeAvg,
        media_diaria_estimada: dailyIncomeAvg,
        top_categorias: topIncomeCategories,
      },
      gastos: {
        total_mes: expenses,
        media_semanal_estimada: weeklyExpenseAvg,
        media_diaria_estimada: dailyExpenseAvg,
        top_categorias: topExpenseCategories,
        outliers: outliers.length > 0 ? outliers : undefined,
      },
      saldo: {
        mes: balance,
        media_semanal_estimada: weeklyBalanceAvg,
        media_diaria_estimada: dailyBalanceAvg,
      },
    }

    // Chamar a IA com o prompt da Sofia
    const systemPrompt = `Você é a Consultora Virtual Sofia, psicóloga financeira e educadora em finanças pessoais. Sua missão é trazer clareza emocional e prática às finanças do usuário. Estilo: empático, observador, conciso e sem julgamentos. Foque nos padrões de comportamento por trás dos números e em pequenos ajustes sustentáveis.

Diretrizes de resposta:

1. Comece com um espelho objetivo: compare renda e gastos do mês atual, apresente o saldo e a visão semanal/diária (médias/estimativas).
2. Interprete padrões de comportamento de forma cuidadosa: ritmo de gastos, categorias que concentram emoções (conforto, urgência, status), presença de 'picos' (outliers) e como reduzi-los sem sensação de perda.
3. Orçamento como cuidado: proponha micro-acordos realistas (ex.: reduzir 10–15% de uma categoria emocional, criar mini-buffer para imprevistos) e rotinas leves (revisão semanal de 10 minutos).
4. Mentalidade: trabalhe gatilhos, expectativas e significado do dinheiro (segurança, autonomia, prazer); evite culpa e prescrição rígida.
5. Recapitule em bullets ao final (3–6 bullets curtos). Feche com uma frase motivacional serena, voltada à prosperidade como bem-estar e constância.

Limites:

- Evite jargões técnicos e recomendações de produtos de investimento.
- Não peça dados sensíveis. Se faltarem dados, assuma estimativas e diga isso.
- Resposta breve: ~220–280 palavras.`

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
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error('Erro ao gerar análise com IA')
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
