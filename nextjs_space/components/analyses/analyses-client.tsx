
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Plus, Calendar, TrendingUp, Lightbulb, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Analysis {
  id: string
  title: string
  content: string
  insights: {
    totalIncome?: number
    totalExpenses?: number
    savings?: number
    savingsRate?: number
    topExpenseCategory?: string
    topExpenseAmount?: number
    recommendations?: string[]
  }
  periodStart: Date
  periodEnd: Date
  createdAt: Date
}

interface AnalysesClientProps {
  analyses: Analysis[]
  hasTransactions: boolean
}

export function AnalysesClient({ analyses, hasTransactions }: AnalysesClientProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedAnalyses, setExpandedAnalyses] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedAnalyses)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedAnalyses(newExpanded)
  }

  const generateAnalysis = async () => {
    if (!hasTransactions) {
      alert('Adicione algumas transações primeiro para gerar uma análise!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/analyses/generate', {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao gerar análise')
      }
    } catch (error) {
      alert('Erro ao gerar análise')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
            <Brain className="h-8 w-8 text-[#00bf63]" />
            <span>Análises com IA</span>
          </h1>
          <p className="text-[#737373] mt-1">
            Insights inteligentes sobre seus hábitos financeiros
          </p>
        </div>
        
        <button
          onClick={generateAnalysis}
          disabled={isGenerating || !hasTransactions}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          title={!hasTransactions ? 'Adicione transações primeiro' : ''}
        >
          <Plus className="h-4 w-4" />
          <span>{isGenerating ? 'Gerando...' : 'Gerar Nova Análise'}</span>
        </button>
      </div>

      {/* Lista de Análises */}
      {analyses.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {hasTransactions ? 'Nenhuma análise gerada ainda' : 'Precisa de dados para análise'}
          </h3>
          <p className="text-[#737373] mb-6 max-w-md mx-auto">
            {hasTransactions 
              ? 'Clique no botão acima para gerar sua primeira análise financeira com IA.'
              : 'Adicione algumas transações primeiro para que a IA possa analisar seus dados financeiros.'
            }
          </p>
          {hasTransactions ? (
            <button
              onClick={generateAnalysis}
              disabled={isGenerating}
              className="btn-primary"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando Análise...' : 'Gerar Primeira Análise'}
            </button>
          ) : (
            <Link href="/dashboard/transactions/new" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Transação
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const isExpanded = expandedAnalyses.has(analysis.id)
            return (
              <div
                key={analysis.id}
                className="card border-l-4 border-[#00bf63]"
              >
                {/* Cabeçalho da Análise */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {analysis.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-[#737373]">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(analysis.periodStart).toLocaleDateString('pt-BR')} - {' '}
                          {new Date(analysis.periodEnd).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        Criada em {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpanded(analysis.id)}
                    className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-[#737373]" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-[#737373]" />
                    )}
                  </button>
                </div>

                {/* Métricas Resumidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {analysis.insights.totalIncome && (
                    <div className="bg-[#00bf63]/10 p-3 rounded-lg border border-[#00bf63]/20">
                      <p className="text-sm text-[#b0b0b0]">Receitas</p>
                      <p className="text-lg font-bold text-[#00bf63]">
                        R$ {analysis.insights.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {analysis.insights.totalExpenses && (
                    <div className="bg-red-900/10 p-3 rounded-lg border border-red-500/20">
                      <p className="text-sm text-[#b0b0b0]">Despesas</p>
                      <p className="text-lg font-bold text-red-500">
                        R$ {analysis.insights.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {analysis.insights.savings !== undefined && (
                    <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-500/20">
                      <p className="text-sm text-[#b0b0b0]">Economia</p>
                      <p className={`text-lg font-bold ${
                        analysis.insights.savings >= 0 ? 'text-blue-400' : 'text-red-500'
                      }`}>
                        R$ {analysis.insights.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {analysis.insights.savingsRate !== undefined && (
                    <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-[#b0b0b0]">Taxa de Economia</p>
                      <p className="text-lg font-bold text-purple-400">
                        {analysis.insights.savingsRate.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Recomendações Principais */}
                {analysis.insights.recommendations && analysis.insights.recommendations.length > 0 && (
                  <div className="bg-yellow-900/10 p-4 rounded-lg mb-4 border border-yellow-500/20">
                    <h4 className="font-medium text-yellow-400 mb-2 flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Principais Recomendações</span>
                    </h4>
                    <ul className="space-y-1">
                      {analysis.insights.recommendations.slice(0, isExpanded ? undefined : 2).map((rec, index) => (
                        <li key={index} className="text-sm text-[#e0e0e0] flex items-start space-x-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                      {!isExpanded && analysis.insights.recommendations.length > 2 && (
                        <li className="text-sm text-yellow-400/70 italic">
                          +{analysis.insights.recommendations.length - 2} recomendações...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Conteúdo Completo */}
                {isExpanded && (
                  <div className="border-t border-[#2a2a2a] pt-4 mt-4">
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="text-white leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: analysis.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Botão Ver Mais/Menos */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => toggleExpanded(analysis.id)}
                    className="text-[#00bf63] hover:underline text-sm font-medium"
                  >
                    {isExpanded ? 'Ver menos' : 'Ver análise completa'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Informação sobre IA */}
      <div className="card bg-blue-900/10 border-l-4 border-blue-500">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500/20 p-2 rounded-full">
            <Brain className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Consultora Virtual Sofia</h4>
            <div className="text-sm text-[#e0e0e0] space-y-2">
              <p>
                Sofia é sua psicóloga financeira pessoal, trazendo clareza emocional e prática às suas finanças.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Análise empática de padrões comportamentais</li>
                <li>Micro-acordos realistas e sustentáveis</li>
                <li>Foco em bem-estar e prosperidade constante</li>
                <li>Sem julgamentos ou prescrições rígidas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
