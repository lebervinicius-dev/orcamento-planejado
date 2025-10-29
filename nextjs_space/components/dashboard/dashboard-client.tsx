
'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, LineChart, Brain, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Importação dinâmica dos gráficos para evitar problemas de hidratação
const FinancialCharts = dynamic(() => import('./financial-charts'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 text-[#737373]">Carregando gráficos...</div>
})

interface Transaction {
  id: string
  amount: number
  description: string
  date: Date
  type: 'INCOME' | 'EXPENSE'
  category: {
    id: string
    name: string
    color?: string | null
  }
}

interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
}

interface Analysis {
  id: string
  title: string
  content: string
  insights: {
    totalIncome: number
    totalExpenses: number
    savings: number
    savingsRate: number
    topExpenseCategory: string
    topExpenseAmount: number
    recommendations: string[]
  }
  createdAt: Date
}

interface DashboardData {
  monthlyIncome: Transaction[]
  monthlyExpenses: Transaction[]
  monthlyData: MonthlyData[]
  latestAnalysis: Analysis | null
  currentMonth: string
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Cálculos do resumo financeiro
  const totalIncome = data.monthlyIncome?.reduce((sum, t) => sum + (t.amount || 0), 0) ?? 0
  const totalExpenses = data.monthlyExpenses?.reduce((sum, t) => sum + (t.amount || 0), 0) ?? 0
  const balance = totalIncome - totalExpenses

  // Agrupar por categoria para os gráficos
  const incomeByCategory = data.monthlyIncome?.reduce((acc, transaction) => {
    const categoryName = transaction.category?.name || 'Outros'
    const existing = acc.find(item => item.name === categoryName)
    if (existing) {
      existing.value += transaction.amount || 0
    } else {
      acc.push({
        name: categoryName,
        value: transaction.amount || 0,
        color: transaction.category?.color || '#737373'
      })
    }
    return acc
  }, [] as Array<{ name: string; value: number; color: string }>) || []

  const expensesByCategory = data.monthlyExpenses?.reduce((acc, transaction) => {
    const categoryName = transaction.category?.name || 'Outros'
    const existing = acc.find(item => item.name === categoryName)
    if (existing) {
      existing.value += transaction.amount || 0
    } else {
      acc.push({
        name: categoryName,
        value: transaction.amount || 0,
        color: transaction.category?.color || '#737373'
      })
    }
    return acc
  }, [] as Array<{ name: string; value: number; color: string }>) || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Financeiro</h1>
          <p className="text-[#737373]">Resumo das suas finanças de {data.currentMonth}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/transactions/new" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#737373] text-sm font-medium mb-1">Receitas do Mês</p>
              <p className="text-2xl font-bold text-[#00bf63]">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[#00bf63]/10 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-[#00bf63]" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#737373] text-sm font-medium mb-1">Despesas do Mês</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#737373] text-sm font-medium mb-1">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#00bf63]' : 'text-red-600'}`}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-[#00bf63]/10' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${balance >= 0 ? 'text-[#00bf63]' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Receitas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-[#00bf63]" />
              <span>Receitas por Categoria</span>
            </h3>
          </div>
          <FinancialCharts 
            type="pie"
            data={incomeByCategory}
            title="Receitas"
            isEmpty={totalIncome === 0}
          />
        </div>

        {/* Gráfico de Pizza - Despesas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-red-600" />
              <span>Despesas por Categoria</span>
            </h3>
          </div>
          <FinancialCharts 
            type="pie"
            data={expensesByCategory}
            title="Despesas"
            isEmpty={totalExpenses === 0}
          />
        </div>
      </div>

      {/* Gráfico de Linha - Saldo dos Últimos 12 Meses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <LineChart className="h-5 w-5 text-[#00bf63]" />
            <span>Evolução do Saldo - Últimos 12 Meses</span>
          </h3>
        </div>
        <FinancialCharts 
          type="line"
          data={data.monthlyData}
          title="Saldo Mensal"
        />
      </div>

      {/* Última Análise de IA */}
      {data.latestAnalysis && (
        <div className="card bg-gradient-to-r from-[#00bf63]/5 to-blue-50 border-l-4 border-[#00bf63]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-[#00bf63]/10 p-2 rounded-full">
                <Brain className="h-5 w-5 text-[#00bf63]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{data.latestAnalysis.title}</h3>
                <p className="text-sm text-[#737373]">
                  Gerada em {new Date(data.latestAnalysis.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <Link 
              href="/dashboard/analyses"
              className="btn-outline text-sm flex items-center space-x-1"
            >
              <span>Ver Todas</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white p-4 rounded-lg">
            {/* Preview dos insights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-[#737373]">Taxa de Economia</p>
                <p className="text-xl font-bold text-[#00bf63]">
                  {data.latestAnalysis.insights.savingsRate?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#737373]">Maior Gasto</p>
                <p className="text-lg font-semibold text-white">
                  {data.latestAnalysis.insights.topExpenseCategory || 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#737373]">Economia</p>
                <p className="text-xl font-bold text-[#00bf63]">
                  R$ {(data.latestAnalysis.insights.savings || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#737373]">Recomendações</p>
                <p className="text-lg font-semibold text-blue-600">
                  {data.latestAnalysis.insights.recommendations?.length || 0}
                </p>
              </div>
            </div>
            
            {/* Primeira recomendação */}
            {data.latestAnalysis.insights.recommendations && data.latestAnalysis.insights.recommendations.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800">💡 Dica Principal:</p>
                <p className="text-sm text-blue-700">{data.latestAnalysis.insights.recommendations[0]}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas Recentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Receitas Recentes</h3>
            <Link href="/dashboard/transactions?type=INCOME" className="text-[#00bf63] hover:underline text-sm">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {data.monthlyIncome?.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="text-sm text-[#737373]">{transaction.category?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#00bf63]">
                    +R$ {transaction.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[#737373]">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )) ?? (
              <p className="text-center text-[#737373] py-4">Nenhuma receita este mês</p>
            )}
          </div>
        </div>

        {/* Despesas Recentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Despesas Recentes</h3>
            <Link href="/dashboard/transactions?type=EXPENSE" className="text-[#00bf63] hover:underline text-sm">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {data.monthlyExpenses?.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="text-sm text-[#737373]">{transaction.category?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    -R$ {transaction.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[#737373]">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )) ?? (
              <p className="text-center text-[#737373] py-4">Nenhuma despesa este mês</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
