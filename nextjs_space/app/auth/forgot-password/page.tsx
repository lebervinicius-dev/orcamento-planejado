
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Digite seu email')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        if (data.resetLink) {
          setResetLink(data.resetLink)
        }
      } else {
        toast.error(data.error || 'Erro ao enviar email de recuperação')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao enviar email de recuperação')
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
              Email Enviado!
            </h1>
            <p className="text-[#737373] mb-6">
              Se o email <strong className="text-white">{email}</strong> estiver cadastrado,
              você receberá um link de recuperação.
            </p>
            
            {resetLink && (
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a] mb-6">
                <p className="text-sm text-[#737373] mb-2">
                  🔧 <strong>Modo Desenvolvimento:</strong>
                </p>
                <a
                  href={resetLink}
                  className="text-[#00bf63] hover:underline text-sm break-all"
                >
                  {resetLink}
                </a>
              </div>
            )}

            <p className="text-sm text-[#737373] mb-6">
              Verifique sua caixa de entrada e spam.
            </p>

            <Link href="/auth/login" className="btn-primary inline-block">
              Voltar para Login
            </Link>
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
            Esqueceu sua senha?
          </h1>
          <p className="text-[#737373]">
            Digite seu email para receber o link de recuperação
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-[#737373] hover:text-[#00bf63] transition-colors inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
