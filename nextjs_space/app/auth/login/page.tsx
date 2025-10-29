
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha inválidos')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f6f6] to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <DollarSign className="h-10 w-10 text-[#00bf63]" />
            <span className="text-2xl font-bold text-[#000000]">Orçamento Planejado</span>
          </div>
          <h1 className="text-3xl font-bold text-[#000000] mb-2">Entre na sua conta</h1>
          <p className="text-[#737373]">Gerencie suas finanças de forma inteligente</p>
        </div>

        {/* Form */}
        <div className="card animate-fade-in" style={{animationDelay: '0.1s'}}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#000000] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#000000] mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-[#737373] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-12"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#737373] hover:text-[#00bf63] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#737373]">
              Não tem uma conta?{' '}
              <Link href="/auth/register" className="text-[#00bf63] hover:underline font-medium">
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-[#00bf63]/5 border border-[#00bf63]/20 rounded-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
          <p className="text-sm text-[#00bf63] text-center">
            <strong>Demo:</strong> Use john@doe.com / johndoe123 para testar
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#737373] hover:text-[#00bf63] transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
