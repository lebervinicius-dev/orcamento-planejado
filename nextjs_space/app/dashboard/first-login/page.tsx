
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'

export default function FirstLoginPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validações
    if (newPassword.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('A senha deve conter pelo menos uma letra maiúscula')
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('A senha deve conter pelo menos uma letra minúscula')
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('A senha deve conter pelo menos um número')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          firstLogin: false // Marca que não é mais primeiro login
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao alterar senha')
        return
      }

      setSuccess('Senha alterada com sucesso! Redirecionando...')
      
      // Atualizar sessão
      await update()
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)

    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0d0d0d] border-[#2a2a2a]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-[#00bf63]/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-[#00bf63]" />
          </div>
          <CardTitle className="text-2xl text-white">Bem-vindo(a)! 🎉</CardTitle>
          <CardDescription className="text-[#b0b0b0]">
            Por segurança, você precisa alterar sua senha temporária antes de continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white pr-10"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#00bf63]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white pr-10"
                  placeholder="Digite a senha novamente"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#00bf63]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a]">
              <p className="text-sm text-[#b0b0b0] mb-2">Requisitos de senha:</p>
              <ul className="text-xs text-[#737373] space-y-1">
                <li className={newPassword.length >= 8 ? 'text-[#00bf63]' : ''}>
                  • Mínimo 8 caracteres
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-[#00bf63]' : ''}>
                  • Pelo menos uma letra maiúscula
                </li>
                <li className={/[a-z]/.test(newPassword) ? 'text-[#00bf63]' : ''}>
                  • Pelo menos uma letra minúscula
                </li>
                <li className={/[0-9]/.test(newPassword) ? 'text-[#00bf63]' : ''}>
                  • Pelo menos um número
                </li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-[#00bf63]/20 border-[#00bf63]">
                <CheckCircle className="h-4 w-4 text-[#00bf63]" />
                <AlertDescription className="text-[#00bf63]">{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-[#00bf63] hover:bg-[#00a555] text-white font-semibold py-3 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Alterando...' : 'Confirmar e Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
