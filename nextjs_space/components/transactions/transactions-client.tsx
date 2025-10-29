
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Filter, Search, Eye, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'

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

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string | null
}

interface TransactionsClientProps {
  transactions: Transaction[]
  categories: Category[]
  totalPages: number
  currentPage: number
  filters: {
    type?: string
    category?: string
  }
}

export function TransactionsClient({
  transactions,
  categories,
  totalPages,
  currentPage,
  filters,
}: TransactionsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(filters.type || 'all')
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all')

  const handleFilterChange = () => {
    const params = new URLSearchParams()
    
    if (selectedType && selectedType !== 'all') {
      params.set('type', selectedType)
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory)
    }
    
    router.push(`/dashboard/transactions?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedType('all')
    setSelectedCategory('all')
    router.push('/dashboard/transactions')
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Erro ao excluir transação')
      }
    } catch (error) {
      alert('Erro ao excluir transação')
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000000]">Transações</h1>
          <p className="text-[#737373] mt-1">
            Gerencie suas receitas e despesas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="btn-outline flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
          <Link href="/dashboard/transactions/new" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      {isFilterOpen && (
        <div className="card bg-gray-50 animate-fade-in">
          <h3 className="font-semibold text-[#000000] mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Tipo
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input"
              >
                <option value="all">Todos</option>
                <option value="INCOME">Receitas</option>
                <option value="EXPENSE">Despesas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type === 'INCOME' ? 'Receita' : 'Despesa'})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={handleFilterChange} className="btn-primary">
              Aplicar Filtros
            </button>
            <button onClick={clearFilters} className="btn-secondary">
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Transações */}
      <div className="card">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-[#000000] mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-[#737373] mb-6">
              Comece adicionando sua primeira receita ou despesa.
            </p>
            <Link href="/dashboard/transactions/new" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'INCOME' 
                      ? 'bg-[#00bf63]/10' 
                      : 'bg-red-100'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <TrendingUp className="h-4 w-4 text-[#00bf63]" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-[#000000]">
                      {transaction.description}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-[#737373]">
                      <span>{transaction.category?.name}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'INCOME' 
                        ? 'text-[#00bf63]' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/transactions/${transaction.id}/edit`}
                      className="p-2 text-[#737373] hover:text-[#00bf63] rounded-lg hover:bg-[#00bf63]/5 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="p-2 text-[#737373] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/dashboard/transactions?page=${page}${filters.type ? `&type=${filters.type}` : ''}${filters.category ? `&category=${filters.category}` : ''}`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                page === currentPage
                  ? 'bg-[#00bf63] text-white'
                  : 'text-[#737373] hover:bg-[#00bf63]/5 hover:text-[#00bf63]'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
