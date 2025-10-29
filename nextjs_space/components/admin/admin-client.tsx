

'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Search, Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  hotmartId: string | null
  createdAt: string
  _count: {
    transactions: number
  }
}

export default function AdminClient() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Erro ao carregar usuários')
      const data = await response.json()
      setUsers(data.users)
      setFilteredUsers(data.users)
    } catch (error) {
      toast.error('Erro ao carregar usuários')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      if (!newUser.email || !newUser.password) {
        toast.error('Email e senha são obrigatórios')
        return
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar usuário')
      }

      toast.success('Usuário criado com sucesso!')
      setShowCreateDialog(false)
      setNewUser({ email: '', name: '', password: '', role: 'user' })
      loadUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Erro ao atualizar usuário')

      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
      loadUsers()
    } catch (error) {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success('Usuário deletado com sucesso')
      loadUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bf63]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-[#00bf63]" />
            Painel Administrativo
          </h1>
          <p className="text-[#737373] mt-1">
            Gerencie usuários e acessos do sistema
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-[#00bf63] hover:bg-[#00a055] text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Criar Usuário
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0d0d0d] border-[#2a2a2a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#737373]">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0d0d0d] border-[#2a2a2a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#737373]">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00bf63]">
              {users.filter(u => u.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0d0d0d] border-[#2a2a2a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#737373]">Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {users.filter(u => !u.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0d0d0d] border-[#2a2a2a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#737373]">Via Hotmart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.hotmartId).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card className="bg-[#0d0d0d] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-white">Usuários Cadastrados</CardTitle>
          <CardDescription className="text-[#737373]">
            Gerencie os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#737373]" />
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black border-[#2a2a2a] text-white"
            />
          </div>

          {/* Lista de Usuários */}
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black border border-[#2a2a2a] rounded-lg gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium truncate">
                      {user.name || 'Sem nome'}
                    </p>
                    {user.role === 'admin' && (
                      <Badge className="bg-[#00bf63] text-white">Admin</Badge>
                    )}
                    {user.hotmartId && (
                      <Badge variant="outline" className="border-[#00bf63] text-[#00bf63]">
                        Hotmart
                      </Badge>
                    )}
                  </div>
                  <p className="text-[#737373] text-sm truncate">{user.email}</p>
                  <p className="text-[#737373] text-xs mt-1">
                    {user._count.transactions} transações • Criado em{' '}
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={
                      user.isActive
                        ? 'border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white'
                        : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                    }
                  >
                    {user.isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Inativo
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-[#737373]">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Criar Usuário */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0d0d0d] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription className="text-[#737373]">
              Crie um novo usuário manualmente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-black border-[#2a2a2a] text-white"
              />
            </div>

            <div>
              <Label htmlFor="name" className="text-white">Nome</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="bg-black border-[#2a2a2a] text-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Senha do usuário"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-black border-[#2a2a2a] text-white"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-white">Função</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger className="bg-black border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d0d] border-[#2a2a2a] text-white">
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="border-[#2a2a2a] text-white hover:bg-[#2a2a2a]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateUser}
                className="bg-[#00bf63] hover:bg-[#00a055] text-white"
              >
                Criar Usuário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
