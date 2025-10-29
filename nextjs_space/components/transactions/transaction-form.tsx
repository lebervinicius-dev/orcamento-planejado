
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Calendar, Tag, FileText } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string | null
}

interface Transaction {
  id?: string
  amount: number
  description: string
  date: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
}

interface TransactionFormProps {
  categories: Category[]
  mode: 'create' | 'edit'
  transaction?: Transaction
}

export function TransactionForm({ categories, mode, transaction }: TransactionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: transaction?.type || 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: transaction?.categoryId || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'categoryId' && value === 'new') {
      setShowNewCategory(true)
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Digite o nome da categoria')
      return
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          type: formData.type,
          color: formData.type === 'INCOME' ? '#00bf63' : '#dc3545',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar categoria')
      }

      // Atualizar o formData com a nova categoria
      setFormData(prev => ({ ...prev, categoryId: data.id }))
      setShowNewCategory(false)
      setNewCategoryName('')
      
      // Recarregar a página para mostrar a nova categoria
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Erro ao criar categoria')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const url = mode === 'create' 
        ? '/api/transactions' 
        : `/api/transactions/${transaction?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          type: formData.type,
          categoryId: formData.categoryId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar transação')
      }

      router.push('/dashboard/transactions')
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar transação')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  // Se mudou o tipo e a categoria não é válida, resetar
  if (formData.categoryId && !filteredCategories.find(cat => cat.id === formData.categoryId)) {
    setFormData(prev => ({ ...prev, categoryId: '' }))
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/transactions"
          className="flex items-center space-x-2 text-[#737373] hover:text-[#00bf63] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar às transações</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tipo de Transação
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'INCOME', categoryId: '' }))}
              className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                formData.type === 'INCOME'
                  ? 'border-[#00bf63] bg-[#00bf63]/5 text-[#00bf63]'
                  : 'border-gray-200 text-[#737373] hover:border-[#00bf63]/30'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              <span className="font-medium">Receita</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'EXPENSE', categoryId: '' }))}
              className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                formData.type === 'EXPENSE'
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-200 text-[#737373] hover:border-red-300'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              <span className="font-medium">Despesa</span>
            </button>
          </div>
        </div>

        {/* Valor */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white mb-2">
            Valor (R$)
          </label>
          <div className="relative">
            <DollarSign className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              id="amount"
              name="amount"
              type="number"
              step="any"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              className="input pl-10"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Descrição
          </label>
          <div className="relative">
            <FileText className="h-5 w-5 text-[#737373] absolute left-3 top-3" />
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input pl-10 h-20 resize-none"
              placeholder="Descreva sua transação..."
              required
            />
          </div>
        </div>

        {/* Data */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-white mb-2">
            Data
          </label>
          <div className="relative">
            <Calendar className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-white mb-2">
            Categoria
          </label>
          
          {!showNewCategory ? (
            <>
              <div className="relative">
                <Tag className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="input pl-10"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="new">+ Nova Categoria</option>
                </select>
              </div>
              <p className="text-sm text-[#737373] mt-1">
                Mostrando apenas categorias de {formData.type === 'INCOME' ? 'receitas' : 'despesas'}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova categoria"
                  className="input flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="btn-primary px-4"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false)
                    setNewCategoryName('')
                  }}
                  className="btn-secondary px-4"
                >
                  Cancelar
                </button>
              </div>
              <p className="text-sm text-[#737373]">
                Digite o nome da nova categoria e clique em criar
              </p>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Transação' : 'Atualizar Transação'}
          </button>
          <Link
            href="/dashboard/transactions"
            className="btn-secondary flex-1 py-3 text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
