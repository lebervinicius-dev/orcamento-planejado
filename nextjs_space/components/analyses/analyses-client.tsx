

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Plus, Calendar, TrendingUp, Lightbulb, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
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
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 hover:scale-105 transition-transform"
          title={!hasTransactions ? 'Adicione transações primeiro' : ''}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Gerar Nova Análise</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback visual ao gerar */}
      {isGenerating && (
        <div className="card bg-gradient-to-r from-[#00bf63]/10 to-[#0d0d0d] border-l-4 border-[#00bf63] animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="bg-[#00bf63]/20 p-3 rounded-full">
              <Brain className="h-6 w-6 text-[#00bf63] animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sofia está analisando suas finanças...</h3>
              <p className="text-sm text-[#737373]">
                A IA está processando suas transações e gerando insights personalizados
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Análises */}
      {analyses.length === 0 ? (
        <div className="card text-center py-12 hover:shadow-[#00bf63]/10 hover:shadow-2xl transition-all">
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
              className="btn-primary hover:scale-105 transition-transform"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando Análise...' : 'Gerar Primeira Análise'}
            </button>
          ) : (
            <Link href="/dashboard/transactions/new" className="btn-primary hover:scale-105 transition-transform">
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
                className="card-hover-glow border-l-4 border-[#00bf63]"
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
                    <div className="bg-gradient-to-br from-[#00bf63]/10 to-[#00bf63]/5 p-3 rounded-lg border border-[#00bf63]/20 hover:border-[#00bf63]/40 transition-colors">
                      <p className="text-sm text-[#b0b0b0]">Receitas</p>
                      <p className="text-lg font-bold text-[#00bf63]">
                        R$ {analysis.insights.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {analysis.insights.totalExpenses && (
                    <div className="bg-gradient-to-br from-red-900/10 to-red-900/5 p-3 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors">
                      <p className="text-sm text-[#b0b0b0]">Despesas</p>
                      <p className="text-lg font-bold text-red-500">
                        R$ {analysis.insights.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {analysis.insights.savings !== undefined && (
                    <div className="bg-gradient-to-br from-blue-900/10 to-blue-900/5 p-3 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                      <p className="text-sm text-[#b0b0b0]">Economia</p>
                      <p className={`text-lg font-bold ${
                        analysis.insights.savings >= 0 ? 'text-blue-400' : 'text-red-500'
                      }`}>
                        R$ {analysis.insights.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {analysis.insights.savingsRate !== undefined && (
                    <div className="bg-gradient-to-br from-purple-900/10 to-purple-900/5 p-3 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                      <p className="text-sm text-[#b0b0b0]">Taxa de Economia</p>
                      <p className="text-lg font-bold text-purple-400">
                        {analysis.insights.savingsRate.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Recomendações Principais */}
                {analysis.insights.recommendations && analysis.insights.recommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-900/10 to-yellow-900/5 p-4 rounded-lg mb-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
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
                    className="text-[#00bf63] hover:underline text-sm font-medium hover:text-[#00a555] transition-colors"
                  >
                    {isExpanded ? 'Ver menos' : 'Ver análise completa'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Informação sobre IA - Sofia */}
      <div className="card-hover-glow bg-gradient-to-br from-blue-900/10 to-[#0d0d0d] border-l-4 border-blue-500">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500/20 p-2 rounded-full">
            <Brain className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Consultora Virtual Sofia</h4>
            <div className="text-sm text-[#e0e0e0] space-y-2">
              <p className="leading-relaxed">
                <strong>Sofia é sua guia financeira pessoal.</strong> Ela analisa suas finanças com empatia e inteligência, 
                ajudando você a entender seus hábitos, enxergar oportunidades e definir metas reais e sustentáveis.
              </p>
              <p className="text-[#00bf63] font-medium">
                💡 Mais clareza, menos culpa. Mais propósito, mais prosperidade.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-[#b0b0b0]">
                <li>Análise empática de padrões comportamentais</li>
                <li>Recomendações realistas e sustentáveis</li>
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
