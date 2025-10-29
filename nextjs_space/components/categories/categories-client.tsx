
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Tag, TrendingUp, TrendingDown } from 'lucide-react'
import { CategoryModal } from './category-modal'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string | null
  _count: {
    transactions: number
  }
}

interface CategoriesClientProps {
  categories: Category[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleCreate = (type: 'INCOME' | 'EXPENSE') => {
    setEditingCategory(null)
    setActiveTab(type)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao excluir categoria')
      }
    } catch (error) {
      alert('Erro ao excluir categoria')
    }
  }

  const incomeCategories = categories.filter(cat => cat.type === 'INCOME')
  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE')

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000000]">Categorias</h1>
          <p className="text-[#737373] mt-1">
            Organize suas receitas e despesas
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-md">
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'EXPENSE'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-[#737373] hover:text-red-600'
          }`}
        >
          <TrendingDown className="h-4 w-4" />
          <span>Despesas</span>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
            {expenseCategories.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('INCOME')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'INCOME'
              ? 'bg-white text-[#00bf63] shadow-sm'
              : 'text-[#737373] hover:text-[#00bf63]'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Receitas</span>
          <span className="text-xs bg-[#00bf63]/10 text-[#00bf63] px-2 py-1 rounded-full">
            {incomeCategories.length}
          </span>
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#000000] flex items-center space-x-2">
            {activeTab === 'INCOME' ? (
              <>
                <TrendingUp className="h-5 w-5 text-[#00bf63]" />
                <span>Categorias de Receita</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span>Categorias de Despesa</span>
              </>
            )}
          </h3>
          <button
            onClick={() => handleCreate(activeTab)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Categoria</span>
          </button>
        </div>

        {/* Lista de Categorias */}
        <div className="space-y-3">
          {(activeTab === 'INCOME' ? incomeCategories : expenseCategories).map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all"
            >
              <div className="flex items-center space-x-4">
                <div
                  className="w-4 h-4 rounded-full border-2 border-gray-200"
                  style={{
                    backgroundColor: category.color || '#737373',
                  }}
                />
                <div>
                  <h4 className="font-medium text-[#000000]">{category.name}</h4>
                  <p className="text-sm text-[#737373]">
                    {category._count.transactions} transação{category._count.transactions !== 1 ? 'ões' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-[#737373] hover:text-[#00bf63] rounded-lg hover:bg-[#00bf63]/5 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-[#737373] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  disabled={category._count.transactions > 0}
                  title={category._count.transactions > 0 ? 'Não é possível excluir categoria com transações' : ''}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {(activeTab === 'INCOME' ? incomeCategories : expenseCategories).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'INCOME' ? '💰' : '💸'}
              </div>
              <h3 className="text-lg font-semibold text-[#000000] mb-2">
                Nenhuma categoria de {activeTab === 'INCOME' ? 'receita' : 'despesa'}
              </h3>
              <p className="text-[#737373] mb-6">
                Crie sua primeira categoria para organizar suas {activeTab === 'INCOME' ? 'receitas' : 'despesas'}.
              </p>
              <button
                onClick={() => handleCreate(activeTab)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          type={editingCategory?.type || activeTab}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCategory(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingCategory(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
