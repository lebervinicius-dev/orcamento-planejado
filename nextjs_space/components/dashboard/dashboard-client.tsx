
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, LineChart, Brain, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Importar Chart.js dinamicamente para evitar problemas com SSR
const FinancialChartsChartJS = dynamic(() => import('./financial-charts-chartjs'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bf63]" />
    </div>
  ),
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
  selectedMonth: number
  selectedYear: number
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const [selectedMonth, setSelectedMonth] = useState(data.selectedMonth)
  const [selectedYear, setSelectedYear] = useState(data.selectedYear)
  const [isLoading, setIsLoading] = useState(false)

  // Recarregar dados quando mês/ano mudar
  const handleMonthYearChange = async (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
    setIsLoading(true)
    
    // Recarregar a página com os novos parâmetros
    const searchParams = new URLSearchParams()
    searchParams.set('month', month.toString())
    searchParams.set('year', year.toString())
    window.location.href = `/dashboard?${searchParams.toString()}`
  }

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

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Anos de 2020 a 2035
  const years = Array.from({ length: 16 }, (_, i) => 2020 + i)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-3">Dashboard Financeiro</h1>
          
          {/* Seletores de Mês e Ano */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-[#737373] text-sm font-medium">Período:</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthYearChange(Number(e.target.value), selectedYear)}
              disabled={isLoading}
              className="input px-3 py-1 text-sm w-auto disabled:opacity-50"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => handleMonthYearChange(selectedMonth, Number(e.target.value))}
              disabled={isLoading}
              className="input px-3 py-1 text-sm w-auto disabled:opacity-50"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00bf63]" />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/dashboard/transactions/new" 
            className="btn-primary flex items-center space-x-2 hover:scale-105 transition-transform"
            title="Adicione uma nova receita ou despesa"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-hover-glow" title="Total de receitas no período selecionado">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#737373] text-sm font-medium mb-1">Receitas do Mês</p>
              <p className="text-2xl font-bold text-[#00bf63]">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[#00bf63]/10 p-3 rounded-full group-hover:bg-[#00bf63]/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-[#00bf63]" />
            </div>
          </div>
        </div>

        <div className="card-hover-glow" title="Total de despesas no período selecionado">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#737373] text-sm font-medium mb-1">Despesas do Mês</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full group-hover:bg-red-200 transition-colors">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card-hover-glow" title="Saldo = Receitas - Despesas">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#737373] text-sm font-medium mb-1">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#00bf63]' : 'text-red-600'}`}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`p-3 rounded-full transition-colors ${balance >= 0 ? 'bg-[#00bf63]/10 group-hover:bg-[#00bf63]/20' : 'bg-red-100 group-hover:bg-red-200'}`}>
              <DollarSign className={`h-6 w-6 ${balance >= 0 ? 'text-[#00bf63]' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Última Análise de IA - MOVIDA PARA CIMA */}
      {data.latestAnalysis && (
        <div 
          className="card-hover-glow bg-gradient-to-r from-[#00bf63]/10 to-[#0d0d0d] border-l-4 border-[#00bf63]"
          title="Última análise gerada pela Sofia"
        >
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
              className="btn-outline text-sm flex items-center space-x-1 border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white hover:scale-105 transition-transform"
              title="Ver todas as análises geradas"
            >
              <span>Ver Todas</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
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
                <p className="text-lg font-semibold text-[#00bf63]">
                  {data.latestAnalysis.insights.recommendations?.length || 0}
                </p>
              </div>
            </div>
            
            {/* Primeira recomendação */}
            {data.latestAnalysis.insights.recommendations && data.latestAnalysis.insights.recommendations.length > 0 && (
              <div className="bg-[#00bf63]/10 p-3 rounded-lg border border-[#00bf63]/20">
                <p className="text-sm font-medium text-[#00bf63]">💡 Dica Principal:</p>
                <p className="text-sm text-white">{data.latestAnalysis.insights.recommendations[0]}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Receitas */}
        <div className="card-hover-glow" title="Distribuição das receitas por categoria">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-[#00bf63]" />
              <span>Receitas por Categoria</span>
            </h3>
          </div>
          <FinancialChartsChartJS 
            type="pie"
            data={incomeByCategory}
            title="Receitas"
            isEmpty={totalIncome === 0}
          />
        </div>

        {/* Gráfico de Pizza - Despesas */}
        <div className="card-hover-glow" title="Distribuição das despesas por categoria">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-red-600" />
              <span>Despesas por Categoria</span>
            </h3>
          </div>
          <FinancialChartsChartJS 
            type="pie"
            data={expensesByCategory}
            title="Despesas"
            isEmpty={totalExpenses === 0}
          />
        </div>
      </div>

      {/* Gráfico de Linha - Saldo dos Últimos 12 Meses */}
      <div className="card-hover-glow" title="Evolução das finanças nos últimos 12 meses">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <LineChart className="h-5 w-5 text-[#00bf63]" />
            <span>Evolução do Saldo - Últimos 12 Meses</span>
          </h3>
        </div>
        <FinancialChartsChartJS 
          type="line"
          data={data.monthlyData}
          title="Saldo Mensal"
        />
      </div>

      {/* Transações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas Recentes */}
        <div className="card-hover-glow" title="Últimas receitas registradas">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Receitas Recentes</h3>
            <Link 
              href="/dashboard/transactions?type=INCOME" 
              className="text-[#00bf63] hover:underline text-sm transition-colors hover:text-[#00a555]"
              title="Ver todas as receitas"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {data.monthlyIncome?.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#1a1a1a] rounded px-2 transition-colors"
              >
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
        <div className="card-hover-glow" title="Últimas despesas registradas">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Despesas Recentes</h3>
            <Link 
              href="/dashboard/transactions?type=EXPENSE" 
              className="text-[#00bf63] hover:underline text-sm transition-colors hover:text-[#00a555]"
              title="Ver todas as despesas"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {data.monthlyExpenses?.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#1a1a1a] rounded px-2 transition-colors"
              >
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
