
/**
 * Modal de Consentimento LGPD
 * Exibido no primeiro login para coletar consentimento do usuário
 */
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, CheckCircle2, Lock, Eye, UserCheck, Clock, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { TermsOfUseModal } from './terms-of-use-modal'

interface LgpdConsentModalProps {
  isOpen: boolean
  onConsentGiven: () => void
}

export function LgpdConsentModal({ isOpen, onConsentGiven }: LgpdConsentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  const handleConsent = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/user/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar consentimento')
      }

      toast.success('✅ Tudo pronto! Você já pode usar o app com segurança.')
      onConsentGiven()
      
    } catch (error: any) {
      console.error('Erro ao registrar consentimento:', error)
      toast.error(error.message || 'Erro ao registrar consentimento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLater = () => {
    toast.info('Você pode aceitar depois nas configurações do seu perfil.')
    onConsentGiven()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[650px] max-h-[92vh]" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#00bf63]/10">
              <Shield className="h-7 w-7 text-[#00bf63]" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                Bem-vindo ao Orçamento Planejado! 👋
              </DialogTitle>
              <DialogDescription className="text-base mt-1.5 text-muted-foreground">
                Sua privacidade é nossa prioridade. Veja como protegemos seus dados.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[52vh] pr-4">
          <div className="space-y-5 text-sm">
            
            {/* Garantia de Segurança */}
            <div className="p-4 bg-gradient-to-r from-[#00bf63]/10 to-[#00bf63]/5 rounded-lg border border-[#00bf63]/20">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-[#00bf63] mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">🔒 Seus Dados Estão Seguros</h3>
                  <p className="text-foreground leading-relaxed font-medium">
                    <strong>Somente você tem acesso às suas transações e informações financeiras.</strong> Ninguém mais pode visualizá-las, nem mesmo outros usuários.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Utilizamos criptografia de ponta e servidores seguros. Seus dados financeiros 
                    <strong className="text-foreground"> nunca serão vendidos ou compartilhados</strong> com terceiros para marketing.
                  </p>
                </div>
              </div>
            </div>

            {/* Informação sobre a IA Sofia */}
            <div className="p-4 bg-[#6f42c1]/10 rounded-lg border border-[#6f42c1]/20">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-[#6f42c1] mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    🤖 Análises Inteligentes com Sofia
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">As informações de suas transações são utilizadas exclusivamente 
                    para gerar análises pessoais pela IA Sofia.</strong> Nenhum outro usuário, administrador ou 
                    terceiro tem acesso a esses dados. As análises são criadas apenas para você, garantindo 
                    total privacidade e segurança.
                  </p>
                </div>
              </div>
            </div>

            {/* O que coletamos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Eye className="h-4 w-4 text-[#00bf63]" />
                <h3>📊 O Que Usamos</h3>
              </div>
              <div className="grid gap-2 ml-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00bf63] mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Informações básicas</strong> para criar sua conta (nome, e-mail, telefone)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00bf63] mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Transações e categorias</strong> que você registra no app
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00bf63] mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Preferências e configurações</strong> para personalizar sua experiência
                  </p>
                </div>
              </div>
            </div>

            {/* Como usamos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <UserCheck className="h-4 w-4 text-[#00bf63]" />
                <h3>💡 Como Usamos</h3>
              </div>
              <div className="grid gap-2 ml-6">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00bf63] mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Fornecer o serviço de gestão financeira pessoal
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00bf63] mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Gerar análises inteligentes para ajudar você a economizar
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00bf63] mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Melhorar continuamente a experiência do app
                  </p>
                </div>
              </div>
            </div>

            {/* Seus direitos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Shield className="h-4 w-4 text-[#00bf63]" />
                <h3>✅ Você Tem Total Controle</h3>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg ml-6 space-y-2">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Você pode <strong className="text-foreground">acessar, corrigir ou excluir</strong> seus dados a qualquer momento. 
                  Também pode <strong className="text-foreground">exportar todas as suas informações</strong> em formato legível.
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Para exercer seus direitos, acesse <strong className="text-foreground">Meu Perfil</strong> ou entre em contato:{' '}
                  <a 
                    href="mailto:suporteplanejado@gmail.com" 
                    className="text-[#00bf63] hover:underline font-medium"
                  >
                    suporteplanejado@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Termos de Uso */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[#00bf63] mt-0.5 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-foreground">📋 Termos de Uso</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ao usar o Orçamento Planejado, você concorda com nossos termos e condições de uso.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="mt-2 text-[#00bf63] border-[#00bf63]/30 hover:bg-[#00bf63]/10"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Ler Termos Completos
                  </Button>
                </div>
              </div>
            </div>

            {/* Parceiros */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">ℹ️ Compartilhamento:</strong> Utilizamos serviços de infraestrutura 
                (Vercel, Supabase), processamento de pagamentos (Hotmart) e análise de IA. 
                Todos seguem rigorosos padrões de segurança e privacidade.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleLater}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <Clock className="mr-2 h-4 w-4" />
            Aceitar Depois
          </Button>
          <Button
            onClick={handleConsent}
            disabled={isLoading}
            className="w-full sm:w-auto bg-[#00bf63] hover:bg-[#00a555] order-1 sm:order-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aceitar e Continuar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Modal de Termos de Uso */}
      <TermsOfUseModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </Dialog>
  )
}
