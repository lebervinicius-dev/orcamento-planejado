
'use client'

import { useState } from 'react'
import { X, Tag, Palette } from 'lucide-react'

interface Category {
  id?: string
  name: string
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT'
  color?: string | null
}

interface CategoryModalProps {
  category: Category | null
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT'
  onClose: () => void
  onSuccess: () => void
}

const PRESET_COLORS = [
  '#00bf63', // Verde principal
  '#dc3545', // Vermelho
  '#ffc107', // Amarelo
  '#007bff', // Azul
  '#6f42c1', // Roxo
  '#fd7e14', // Laranja
  '#e83e8c', // Rosa
  '#17a2b8', // Cyan
  '#28a745', // Verde escuro
  '#737373', // Cinza
  '#343a40', // Preto
  '#6c757d', // Cinza escuro
]

export function CategoryModal({ category, type, onClose, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '')
  const [selectedColor, setSelectedColor] = useState(category?.color || PRESET_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const url = category?.id 
        ? `/api/categories/${category.id}` 
        : '/api/categories'
      
      const method = category?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          color: selectedColor,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar categoria')
      }

      onSuccess()
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar categoria')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Tag className="h-5 w-5 text-[#00bf63]" />
            <span>
              {category ? 'Editar' : 'Nova'} Categoria {type === 'INCOME' ? 'de Receita' : type === 'EXPENSE' ? 'de Despesa' : 'de Investimento'}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[#737373]" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Nome da Categoria
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Digite o nome da categoria"
              required
              maxLength={50}
            />
            <p className="text-xs text-[#737373] mt-1">
              {name.length}/50 caracteres
            </p>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Cor</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-[#000000] scale-110 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Escolha uma cor para identificar facilmente sua categoria
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-white mb-2">Preview:</p>
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-medium text-white">
                {name || 'Nome da categoria'}
              </span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                type === 'INCOME' 
                  ? 'bg-[#00bf63]/10 text-[#00bf63]' 
                  : type === 'EXPENSE'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-[#6f42c1]/10 text-[#6f42c1]'
              }`}>
                {type === 'INCOME' ? 'Receita' : type === 'EXPENSE' ? 'Despesa' : 'Investimento'}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : category ? 'Atualizar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
