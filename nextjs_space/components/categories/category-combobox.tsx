
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronsUpDown, Plus, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string | null
}

interface CategoryComboboxProps {
  categories: Category[]
  value: string
  onChange: (value: string) => void
  type: 'INCOME' | 'EXPENSE'
  onCategoryCreated?: () => void
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
  type,
  onCategoryCreated,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Filtrar categorias por tipo
  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.type === type),
    [categories, type]
  )

  // Categoria selecionada
  const selectedCategory = filteredCategories.find((cat) => cat.id === value)

  // Verificar se a busca corresponde a uma categoria existente
  const exactMatch = filteredCategories.find(
    (cat) => cat.name.toLowerCase() === search.toLowerCase()
  )

  // Mostrar opção de criar nova categoria
  const showCreateOption = search.trim() !== '' && !exactMatch

  const handleCreateCategory = async () => {
    if (!search.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: search.trim(),
          type,
          color: type === 'INCOME' ? '#00bf63' : '#dc3545',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar categoria')
      }

      // Selecionar a nova categoria
      onChange(data.id)
      setSearch('')
      setOpen(false)
      
      toast.success(`Categoria "${data.name}" criada com sucesso!`)
      
      // Notificar o componente pai para recarregar as categorias
      if (onCategoryCreated) {
        onCategoryCreated()
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar categoria')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-[#1a1f2e] border-[#2d3748] text-white hover:bg-[#252d3d] hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#737373]" />
            {selectedCategory ? (
              <span>{selectedCategory.name}</span>
            ) : (
              <span className="text-[#737373]">Selecione uma categoria</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-[#1a1f2e] border-[#2d3748]" align="start">
        <Command className="bg-[#1a1f2e]">
          <CommandInput
            placeholder="Buscar ou criar categoria..."
            value={search}
            onValueChange={setSearch}
            className="text-white"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>
              <div className="text-center py-6">
                <p className="text-sm text-[#737373] mb-2">
                  Nenhuma categoria encontrada
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(category.id)
                    setOpen(false)
                    setSearch('')
                  }}
                  className="text-white hover:bg-[#252d3d] cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === category.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex items-center gap-2">
                    {category.color && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span>{category.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateCategory}
                  disabled={isCreating}
                  className="text-[#00bf63] hover:bg-[#252d3d] cursor-pointer border-t border-[#2d3748]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>
                    {isCreating
                      ? 'Criando...'
                      : `Criar "${search.trim()}"`}
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
