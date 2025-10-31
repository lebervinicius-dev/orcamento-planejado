
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
import { Shield, CheckCircle2, Info } from 'lucide-react'
import { toast } from 'sonner'

interface LgpdConsentModalProps {
  isOpen: boolean
  onConsentGiven: () => void
}

export function LgpdConsentModal({ isOpen, onConsentGiven }: LgpdConsentModalProps) {
  const [isLoading, setIsLoading] = useState(false)

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

      toast.success('Consentimento registrado com sucesso!')
      onConsentGiven()
      
    } catch (error: any) {
      console.error('Erro ao registrar consentimento:', error)
      toast.error(error.message || 'Erro ao registrar consentimento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh]" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">
              Consentimento LGPD
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Para utilizar o <strong>Orçamento Planejado</strong>, precisamos do seu consentimento
            para coletar e processar seus dados pessoais conforme a LGPD.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            
            {/* Dados coletados */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Info className="h-4 w-4" />
                <h3>Dados Coletados</h3>
              </div>
              <p>
                Coletamos e armazenamos as seguintes informações:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Dados cadastrais:</strong> nome, e-mail, telefone</li>
                <li><strong>Dados financeiros:</strong> transações, categorias, investimentos</li>
                <li><strong>Dados de uso:</strong> análises de IA, metas financeiras</li>
                <li><strong>Dados de acesso:</strong> histórico de login, preferências</li>
              </ul>
            </div>

            {/* Finalidade */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <h3>Finalidade do Uso</h3>
              </div>
              <p>
                Utilizamos seus dados exclusivamente para:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Fornecer serviços de gestão financeira pessoal</li>
                <li>Gerar análises inteligentes com IA sobre suas finanças</li>
                <li>Melhorar a experiência e funcionalidades do sistema</li>
                <li>Comunicar-nos com você sobre sua conta e atualizações</li>
              </ul>
            </div>

            {/* Compartilhamento */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Shield className="h-4 w-4" />
                <h3>Compartilhamento de Dados</h3>
              </div>
              <p>
                Seus dados <strong>NÃO</strong> são vendidos ou compartilhados com terceiros
                para fins de marketing. Compartilhamos apenas com:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Provedores de infraestrutura (hospedagem, banco de dados)</li>
                <li>Processadores de pagamento (Hotmart)</li>
                <li>Serviços de IA (para análises financeiras)</li>
              </ul>
            </div>

            {/* Direitos */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Info className="h-4 w-4" />
                <h3>Seus Direitos (LGPD)</h3>
              </div>
              <p>
                Você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou incorretos</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar este consentimento a qualquer momento</li>
                <li>Exportar seus dados em formato legível</li>
              </ul>
            </div>

            {/* Contato */}
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="font-semibold text-foreground">
                Dúvidas sobre seus dados?
              </p>
              <p className="text-xs">
                Entre em contato conosco através do e-mail:{' '}
                <a 
                  href="mailto:suporteplanejado@gmail.com" 
                  className="text-primary hover:underline"
                >
                  suporteplanejado@gmail.com
                </a>
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={handleConsent}
            disabled={isLoading}
            className="w-full sm:w-auto"
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
                Li e Concordo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
