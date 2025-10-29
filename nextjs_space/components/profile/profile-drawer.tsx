
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, User as UserIcon, Phone, Lock, Save, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
}

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { data: session } = useSession() || {}
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Buscar perfil do usuário
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchProfile()
    }
  }, [isOpen, session])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setName(data.name || '')
        setPhone(data.phone || '')
      } else {
        toast.error('Erro ao carregar perfil')
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      toast.error('Erro ao carregar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    // Validações
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    // Se está alterando senha
    if (newPassword) {
      if (!phone.trim()) {
        toast.error('Telefone é obrigatório para alterar a senha')
        return
      }

      if (!currentPassword) {
        toast.error('Senha atual é obrigatória para alterar a senha')
        return
      }

      if (newPassword.length < 8) {
        toast.error('A nova senha deve ter no mínimo 8 caracteres')
        return
      }

      if (newPassword !== confirmPassword) {
        toast.error('As senhas não coincidem')
        return
      }
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone: phone || null,
          password: newPassword || undefined,
          currentPassword: currentPassword || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Perfil atualizado com sucesso')
        // Limpar campos de senha
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        // Atualizar perfil
        await fetchProfile()
        // Fechar drawer após 1 segundo
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        toast.error(data.error || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0d0d0d] border-l border-[#2a2a2a] z-50 shadow-2xl animate-slide-in-right overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#00bf63]/10 p-2 rounded-full">
                <UserIcon className="h-6 w-6 text-[#00bf63]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
                <p className="text-sm text-[#737373]">Gerencie suas informações</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-[#737373]" />
            </button>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bf63]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="input pl-10 bg-[#1a1a1a] text-[#737373] cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[#737373] mt-1">O email não pode ser alterado</p>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nome *
                </label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-10"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Telefone {newPassword && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Phone className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input pl-10"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                {newPassword && (
                  <p className="text-xs text-yellow-500 mt-1">
                    ⚠️ Telefone obrigatório para alterar senha
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#2a2a2a] pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Alterar Senha</h3>
                <p className="text-sm text-[#737373] mb-4">
                  Para alterar sua senha, preencha os campos abaixo. Telefone é obrigatório.
                </p>
              </div>

              {/* Senha Atual */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Senha Atual
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="Sua senha atual"
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              {/* Botão Salvar */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>

              {/* Email de Suporte */}
              <div className="border-t border-[#2a2a2a] pt-4 mt-6">
                <p className="text-sm text-[#737373] text-center">
                  Precisa de ajuda? Entre em contato:
                </p>
                <a
                  href="mailto:suporteplanejado@gmail.com"
                  className="text-[#00bf63] hover:underline font-medium text-center block mt-2"
                >
                  suporteplanejado@gmail.com
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
