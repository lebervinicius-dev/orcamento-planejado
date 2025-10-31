
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Calendar, FileText, Edit2 } from 'lucide-react'
import { CategoryCombobox } from '@/components/categories/category-combobox'

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

  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: transaction?.type || 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: transaction?.categoryId || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value
                // Permite apenas números com até 2 casas decimais
                if (value === '' || /^\d+\.?\d{0,2}$/.test(value)) {
                  setFormData(prev => ({ ...prev, amount: value }))
                }
              }}
              onBlur={(e) => {
                // Formata para 2 casas decimais ao perder o foco
                const value = parseFloat(e.target.value)
                if (!isNaN(value) && value > 0) {
                  setFormData(prev => ({ ...prev, amount: value.toFixed(2) }))
                }
              }}
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-white">
              Categoria
            </label>
            <Link 
              href="/dashboard/categories"
              className="text-sm text-[#00bf63] hover:underline flex items-center space-x-1"
            >
              <Edit2 className="h-3 w-3" />
              <span>Editar categorias</span>
            </Link>
          </div>
          
          <CategoryCombobox
            categories={categories}
            value={formData.categoryId}
            onChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            type={formData.type}
            onCategoryCreated={() => router.refresh()}
          />
          
          <p className="text-sm text-[#737373] mt-2">
            Busque ou crie categorias de {formData.type === 'INCOME' ? 'receitas' : 'despesas'}
          </p>
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
