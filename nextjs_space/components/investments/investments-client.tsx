

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Plus, 
  Trash2, 
  Edit2,
  PieChart as PieChartIcon,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

ChartJS.register(ArcElement, ChartTooltip, Legend)

interface Category {
  id: string
  name: string
  type: string
  color?: string | null
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  progress: number
  investments: Investment[]
}

interface Investment {
  id: string
  name: string
  amount: number
  date: Date | string
  category: string
  goalId?: string | null
  goal?: Goal | null
}

interface InvestmentsClientProps {
  initialGoals: Goal[]
  initialInvestments: Investment[]
}

export function InvestmentsClient({ initialGoals, initialInvestments }: InvestmentsClientProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments)
  const [investmentCategories, setInvestmentCategories] = useState<Category[]>([])
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Estados do formulário de meta
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')

  // Estados do formulário de investimento
  const [investmentName, setInvestmentName] = useState('')
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [investmentCategory, setInvestmentCategory] = useState('')
  const [investmentDate, setInvestmentDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')

  // Estados do formulário de categoria
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#00bf63')

  // Carregar categorias de investimento
  useEffect(() => {
    loadInvestmentCategories()
  }, [])

  const loadInvestmentCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=INVESTMENT')
      if (response.ok) {
        const categories = await response.json()
        setInvestmentCategories(categories)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  // Calcular distribuição por categoria
  const categoryDistribution = investments.reduce((acc, inv) => {
    acc[inv.category] = (acc[inv.category] || 0) + inv.amount
    return acc
  }, {} as Record<string, number>)

  const chartData = {
    labels: Object.keys(categoryDistribution),
    datasets: [
      {
        data: Object.values(categoryDistribution),
        backgroundColor: [
          '#00bf63',
          '#20c997',
          '#6f42c1',
          '#ffc107',
          '#dc3545',
        ],
        borderColor: '#0d0d0d',
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#b0b0b0',
          font: {
            size: 12,
          },
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#b0b0b0',
        borderColor: '#2a2a2a',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `${context.label}: R$ ${context.parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
        }
      },
    },
  }

  // Criar nova meta
  const handleCreateGoal = async () => {
    if (!goalName || !goalTarget) {
      toast.error('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goalName,
          targetAmount: parseFloat(goalTarget),
        }),
      })

      if (response.ok) {
        const newGoal = await response.json()
        setGoals([newGoal, ...goals])
        toast.success('Meta criada com sucesso! 🎯')
        setGoalName('')
        setGoalTarget('')
        setIsGoalDialogOpen(false)
      } else {
        throw new Error('Erro ao criar meta')
      }
    } catch (error) {
      toast.error('Erro ao criar meta')
    } finally {
      setIsLoading(false)
    }
  }

  // Criar novo investimento
  const handleCreateInvestment = async () => {
    if (!investmentName || !investmentAmount || !investmentCategory) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: investmentName,
          amount: parseFloat(investmentAmount),
          category: investmentCategory,
          date: investmentDate,
          goalId: selectedGoalId || null,
        }),
      })

      if (response.ok) {
        const newInvestment = await response.json()
        setInvestments([newInvestment, ...investments])
        
        // Atualizar progresso da meta se houver
        if (selectedGoalId) {
          const updatedGoals = await fetch('/api/goals').then(res => res.json())
          setGoals(updatedGoals)
          toast.success('Progresso da meta atualizado com sucesso! 🎉')
        } else {
          toast.success('Investimento adicionado com sucesso! 💰')
        }

        // Limpar formulário
        setInvestmentName('')
        setInvestmentAmount('')
        setInvestmentCategory('')
        setSelectedGoalId('')
        setInvestmentDate(new Date().toISOString().split('T')[0])
        setIsInvestmentDialogOpen(false)
      } else {
        throw new Error('Erro ao criar investimento')
      }
    } catch (error) {
      toast.error('Erro ao criar investimento')
    } finally {
      setIsLoading(false)
    }
  }

  // Deletar meta
  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Deseja realmente excluir esta meta? Os investimentos associados não serão excluídos.')) {
      return
    }

    try {
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGoals(goals.filter(g => g.id !== goalId))
        toast.success('Meta removida com sucesso')
      } else {
        throw new Error('Erro ao deletar meta')
      }
    } catch (error) {
      toast.error('Erro ao deletar meta')
    }
  }

  // Deletar investimento
  const handleDeleteInvestment = async (investmentId: string) => {
    if (!confirm('Deseja realmente excluir este investimento?')) {
      return
    }

    try {
      const response = await fetch(`/api/investments?id=${investmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setInvestments(investments.filter(i => i.id !== investmentId))
        
        // Atualizar metas
        const updatedGoals = await fetch('/api/goals').then(res => res.json())
        setGoals(updatedGoals)
        
        toast.success('Investimento removido com sucesso')
      } else {
        throw new Error('Erro ao deletar investimento')
      }
    } catch (error) {
      toast.error('Erro ao deletar investimento')
    }
  }

  // Criar nova categoria de investimento
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Nome da categoria é obrigatório')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          type: 'INVESTMENT',
          color: newCategoryColor,
        }),
      })

      if (response.ok) {
        await loadInvestmentCategories()
        toast.success('Categoria criada com sucesso! 🎉')
        setNewCategoryName('')
        setNewCategoryColor('#00bf63')
        setIsCategoryDialogOpen(false)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao criar categoria')
      }
    } catch (error) {
      toast.error('Erro ao criar categoria')
    } finally {
      setIsLoading(false)
    }
  }

  // Deletar categoria de investimento
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadInvestmentCategories()
        toast.success('Categoria removida com sucesso')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao deletar categoria')
      }
    } catch (error) {
      toast.error('Erro ao deletar categoria')
    }
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#00bf63]" />
              Investimentos & Metas
            </h1>
            <p className="text-[#737373] mt-2">
              Acompanhe seus aportes e conquiste seus objetivos financeiros
            </p>
          </div>
        </motion.div>

        {/* Resumo Geral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-[#00bf63] to-[#20c997] border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Total Investido</p>
                <h2 className="text-4xl font-bold text-white">
                  R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <DollarSign className="h-16 w-16 text-white/20" />
            </div>
          </Card>
        </motion.div>

        {/* Seção de Metas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-[#00bf63]" />
              Metas Financeiras
            </h2>
            <Button
              onClick={() => setIsGoalDialogOpen(true)}
              className="bg-[#00bf63] hover:bg-[#00a855] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {goals.map((goal, index) => {
                const progressPercentage = Math.min(100, (goal.progress / goal.targetAmount) * 100)
                const isCompleted = progressPercentage >= 100
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-5 hover:border-[#00bf63] transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-1">{goal.name}</h3>
                          <p className="text-[#737373] text-sm">
                            R$ {goal.progress.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir meta</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#b0b0b0]">Progresso</span>
                          <span className={`font-semibold ${isCompleted ? 'text-[#00bf63]' : 'text-white'}`}>
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={progressPercentage} 
                          className="h-2"
                        />
                        {isCompleted && (
                          <div className="flex items-center gap-2 text-[#00bf63] text-sm mt-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-medium">Meta concluída! 🎉</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {goals.length === 0 && (
              <Card className="bg-[#1a1a1a] border-[#2a2a2a] border-dashed p-8 col-span-full">
                <div className="text-center">
                  <Target className="h-12 w-12 text-[#737373] mx-auto mb-3" />
                  <p className="text-[#737373] mb-4">Nenhuma meta criada ainda</p>
                  <Button
                    onClick={() => setIsGoalDialogOpen(true)}
                    variant="outline"
                    className="border-[#2a2a2a] text-[#00bf63] hover:bg-[#00bf63]/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Meta
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Seção de Carteira e Aportes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <PieChartIcon className="h-6 w-6 text-[#00bf63]" />
              Carteira e Aportes
            </h2>
            <Button
              onClick={() => setIsInvestmentDialogOpen(true)}
              className="bg-[#00bf63] hover:bg-[#00a855] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Aporte
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Distribuição */}
            <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 lg:col-span-1">
              <h3 className="text-white font-semibold mb-4">Distribuição por Categoria</h3>
              {investments.length > 0 ? (
                <div className="h-64">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-[#737373] mx-auto mb-3" />
                    <p className="text-[#737373] text-sm">Nenhum investimento ainda</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Lista de Aportes Recentes */}
            <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 lg:col-span-2">
              <h3 className="text-white font-semibold mb-4">Aportes Recentes</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {investments.slice(0, 10).map((investment, index) => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg border border-[#2a2a2a] hover:border-[#00bf63] transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{investment.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#00bf63]/20 text-[#00bf63]">
                          {investment.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#737373]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(investment.date).toLocaleDateString('pt-BR')}
                        </div>
                        {investment.goal && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {investment.goal.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#00bf63] font-semibold">
                        R$ {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteInvestment(investment.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {investments.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-[#737373] mx-auto mb-3" />
                    <p className="text-[#737373] mb-4">Nenhum aporte registrado ainda</p>
                    <Button
                      onClick={() => setIsInvestmentDialogOpen(true)}
                      variant="outline"
                      className="border-[#2a2a2a] text-[#00bf63] hover:bg-[#00bf63]/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Aporte
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Dialog de Nova Meta */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle>Nova Meta Financeira</DialogTitle>
            <DialogDescription className="text-[#737373]">
              Defina uma meta e acompanhe seu progresso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-name">Nome da Meta</Label>
              <Input
                id="goal-name"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Ex: Reserva de Emergência"
                className="bg-[#0d0d0d] border-[#2a2a2a] text-white"
              />
            </div>
            <div>
              <Label htmlFor="goal-target">Valor Alvo (R$)</Label>
              <Input
                id="goal-target"
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="20000.00"
                className="bg-[#0d0d0d] border-[#2a2a2a] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGoalDialogOpen(false)}
              className="border-[#2a2a2a] text-white hover:bg-[#2a2a2a]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={isLoading}
              className="bg-[#00bf63] hover:bg-[#00a855] text-white"
            >
              {isLoading ? 'Criando...' : 'Criar Meta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Nova Categoria de Investimento */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle>Nova Categoria de Investimento</DialogTitle>
            <DialogDescription className="text-[#737373]">
              Crie uma nova categoria para organizar seus investimentos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Imóveis"
                className="bg-[#0d0d0d] border-[#2a2a2a] text-white"
              />
            </div>
            <div>
              <Label htmlFor="category-color">Cor</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="category-color"
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-20 h-10 bg-[#0d0d0d] border-[#2a2a2a]"
                />
                <Input
                  type="text"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  placeholder="#00bf63"
                  className="flex-1 bg-[#0d0d0d] border-[#2a2a2a] text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
              className="border-[#2a2a2a] text-white hover:bg-[#2a2a2a]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isLoading}
              className="bg-[#00bf63] hover:bg-[#00a855] text-white"
            >
              {isLoading ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Novo Investimento */}
      <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle>Novo Aporte</DialogTitle>
            <DialogDescription className="text-[#737373]">
              Registre um novo investimento ou aporte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="investment-name">Descrição</Label>
              <Input
                id="investment-name"
                value={investmentName}
                onChange={(e) => setInvestmentName(e.target.value)}
                placeholder="Ex: CDB Banco XYZ"
                className="bg-[#0d0d0d] border-[#2a2a2a] text-white"
              />
            </div>
            <div>
              <Label htmlFor="investment-amount">Valor (R$)</Label>
              <Input
                id="investment-amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="1000.00"
                className="bg-[#0d0d0d] border-[#2a2a2a] text-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="investment-category">Categoria</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCategoryDialogOpen(true)}
                  className="h-6 text-xs text-[#00bf63] hover:text-[#00a855] hover:bg-[#00bf63]/10"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nova Categoria
                </Button>
              </div>
              <Select value={investmentCategory} onValueChange={setInvestmentCategory}>
                <SelectTrigger className="bg-[#0d0d0d] border-[#2a2a2a] text-white">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  {investmentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className="text-white hover:bg-[#2a2a2a]">
                      <div className="flex items-center gap-2">
                        {cat.color && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                  {investmentCategories.length === 0 && (
                    <div className="p-2 text-center text-[#737373] text-sm">
                      Nenhuma categoria encontrada
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="investment-date">Data</Label>
              <Input
                id="investment-date"
                type="date"
                value={investmentDate}
                onChange={(e) => setInvestmentDate(e.target.value)}
                className="bg-[#0d0d0d] border-[#2a2a2a] text-white"
              />
            </div>
            <div>
              <Label htmlFor="investment-goal">Vincular à Meta (opcional)</Label>
              <Select value={selectedGoalId || 'no-goal'} onValueChange={(value) => setSelectedGoalId(value === 'no-goal' ? '' : value)}>
                <SelectTrigger className="bg-[#0d0d0d] border-[#2a2a2a] text-white">
                  <SelectValue placeholder="Nenhuma meta selecionada" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="no-goal" className="text-white hover:bg-[#2a2a2a]">
                    Nenhuma meta
                  </SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id} className="text-white hover:bg-[#2a2a2a]">
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInvestmentDialogOpen(false)}
              className="border-[#2a2a2a] text-white hover:bg-[#2a2a2a]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateInvestment}
              disabled={isLoading}
              className="bg-[#00bf63] hover:bg-[#00a855] text-white"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Aporte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
