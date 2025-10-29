
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenFromUrl = searchParams?.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      toast.error('Token inválido')
      router.push('/auth/login')
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Token inválido')
      return
    }

    if (password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success('Senha alterada com sucesso!')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        toast.error(data.error || 'Erro ao resetar senha')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao resetar senha')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1a] px-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-[#00bf63]/10 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-[#00bf63]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Senha Alterada!
            </h1>
            <p className="text-[#737373] mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para o login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1a] px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Nova Senha
          </h1>
          <p className="text-[#737373]">
            Digite sua nova senha
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Repita a nova senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-[#737373] hover:text-[#00bf63] transition-colors"
            >
              Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bf63]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
