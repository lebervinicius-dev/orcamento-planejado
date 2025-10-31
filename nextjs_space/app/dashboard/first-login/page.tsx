
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Shield, Info } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function FirstLoginPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [lgpdConsent, setLgpdConsent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validações
    if (!lgpdConsent) {
      setError('Você precisa aceitar os Termos de Privacidade para continuar')
      return
    }

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
      // 1. Registrar consentimento LGPD
      const consentRes = await fetch('/api/user/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!consentRes.ok) {
        const consentData = await consentRes.json()
        setError(consentData.error || 'Erro ao registrar consentimento')
        return
      }

      // 2. Alterar senha e marcar como não sendo mais primeiro login
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          firstLogin: false
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao alterar senha')
        return
      }

      setSuccess('✅ Tudo pronto! Senha alterada e consentimento registrado. Redirecionando...')
      
      // Atualizar sessão
      await update()
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)

    } catch (error) {
      console.error('Erro:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-[#0d0d0d] border-[#2a2a2a]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-[#00bf63]/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-[#00bf63]" />
          </div>
          <CardTitle className="text-2xl text-white">Bem-vindo(a)! 🎉</CardTitle>
          <CardDescription className="text-[#b0b0b0]">
            Para começar, você precisa alterar sua senha temporária e aceitar nossos Termos de Privacidade
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

            {/* Seção de Consentimento LGPD */}
            <div className="bg-gradient-to-r from-[#00bf63]/10 to-[#0d0d0d] border border-[#00bf63]/20 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="h-5 w-5 text-[#00bf63] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">🔒 Privacidade e Segurança</h3>
                  <p className="text-[#b0b0b0] text-sm leading-relaxed">
                    <strong className="text-white">Somente você tem acesso às suas transações e informações financeiras.</strong> Ninguém mais pode visualizá-las, nem mesmo outros usuários.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="privacy-terms" className="border-[#2a2a2a]">
                  <AccordionTrigger className="text-[#00bf63] hover:text-[#00a555] text-sm py-2">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Ver detalhes sobre privacidade e dados
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-[#b0b0b0] text-sm space-y-3 pt-2">
                    <div>
                      <p className="font-semibold text-white mb-1">📊 O que coletamos:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Informações básicas (nome, e-mail, telefone)</li>
                        <li>Transações e categorias que você registra</li>
                        <li>Preferências e configurações do app</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-white mb-1">💡 Como usamos:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Fornecer o serviço de gestão financeira</li>
                        <li>Gerar análises inteligentes (IA)</li>
                        <li>Melhorar sua experiência no app</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-white mb-1">✅ Seus direitos:</p>
                      <p className="text-xs">
                        Você pode acessar, corrigir ou excluir seus dados a qualquer momento através do <strong className="text-white">Meu Perfil</strong> ou pelo e-mail:{' '}
                        <a href="mailto:suporteplanejado@gmail.com" className="text-[#00bf63] hover:underline">
                          suporteplanejado@gmail.com
                        </a>
                      </p>
                    </div>

                    <div className="bg-[#0d0d0d] p-2 rounded border border-[#2a2a2a]">
                      <p className="text-xs">
                        <strong className="text-white">ℹ️ Compartilhamento:</strong> Utilizamos serviços de infraestrutura (Vercel, Supabase), pagamentos (Hotmart) e análise de IA. Todos seguem rigorosos padrões de segurança.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex items-start gap-3 mt-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                <Checkbox 
                  id="lgpdConsent" 
                  checked={lgpdConsent}
                  onCheckedChange={(checked) => setLgpdConsent(checked === true)}
                  className="mt-0.5 border-[#00bf63] data-[state=checked]:bg-[#00bf63]"
                />
                <Label 
                  htmlFor="lgpdConsent" 
                  className="text-white text-sm cursor-pointer leading-relaxed"
                >
                  Li e aceito os <strong className="text-[#00bf63]">Termos de Privacidade</strong> e concordo com o uso dos meus dados conforme descrito acima.
                </Label>
              </div>
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
              disabled={loading || !lgpdConsent}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aceitar e Continuar para o Dashboard
                </>
              )}
            </Button>
            
            {!lgpdConsent && (
              <p className="text-xs text-[#737373] text-center -mt-2">
                ⚠️ Você precisa aceitar os Termos de Privacidade para continuar
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
