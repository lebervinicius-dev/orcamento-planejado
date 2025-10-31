

'use client'

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
import { FileText, CheckCircle2 } from 'lucide-react'

interface TermsOfUseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsOfUseModal({ isOpen, onClose }: TermsOfUseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[92vh] bg-[#1a1a1a] border-[#2a2a2a]">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#00bf63]/10">
              <FileText className="h-6 w-6 text-[#00bf63]" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white">
                Termos de Uso
              </DialogTitle>
              <DialogDescription className="text-base mt-1.5 text-[#737373]">
                Última atualização: Outubro de 2025
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-white">
            
            {/* Seção 1: Aceitação dos Termos */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                1. Aceitação dos Termos
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed">
                Ao acessar e usar o aplicativo <strong className="text-white">Orçamento Planejado</strong>, 
                você concorda com os presentes Termos de Uso e nossa Política de Privacidade. 
                Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso serviço.
              </p>
            </section>

            {/* Seção 2: Descrição do Serviço */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                2. Descrição do Serviço
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed">
                O <strong className="text-white">Orçamento Planejado</strong> é uma plataforma de gestão 
                financeira pessoal que permite aos usuários registrar, categorizar e analisar suas transações 
                financeiras, investimentos e metas. O serviço inclui análises inteligentes geradas pela 
                nossa assistente virtual Sofia.
              </p>
            </section>

            {/* Seção 3: Registro e Conta */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                3. Registro e Conta
              </h3>
              <div className="space-y-3 text-[#b0b0b0]">
                <p className="leading-relaxed">
                  Para utilizar o serviço, você deve criar uma conta fornecendo informações precisas e atualizadas. 
                  Você é responsável por:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                  <li>Todas as atividades que ocorrem em sua conta</li>
                  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                </ul>
              </div>
            </section>

            {/* Seção 4: Uso Aceitável */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                4. Uso Aceitável
              </h3>
              <div className="space-y-3 text-[#b0b0b0]">
                <p className="leading-relaxed">Ao usar nosso serviço, você concorda em:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Não usar o serviço para fins ilegais ou não autorizados</li>
                  <li>Não tentar acessar áreas restritas da plataforma</li>
                  <li>Não transmitir vírus, malware ou código malicioso</li>
                  <li>Não fazer engenharia reversa ou tentar extrair o código-fonte</li>
                  <li>Não compartilhar sua conta com terceiros</li>
                </ul>
              </div>
            </section>

            {/* Seção 5: Privacidade e Dados */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                5. Privacidade e Proteção de Dados
              </h3>
              <div className="space-y-3 text-[#b0b0b0]">
                <p className="leading-relaxed">
                  Levamos sua privacidade a sério. Todos os dados financeiros que você registra são:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong className="text-white">Criptografados</strong> e armazenados com segurança</li>
                  <li><strong className="text-white">Privados</strong> - apenas você tem acesso aos seus dados</li>
                  <li><strong className="text-white">Utilizados exclusivamente</strong> para gerar análises personalizadas pela IA Sofia</li>
                  <li><strong className="text-white">Nunca compartilhados</strong> com terceiros para fins de marketing</li>
                </ul>
                <div className="p-3 bg-[#00bf63]/10 rounded-lg border border-[#00bf63]/20 mt-3">
                  <p className="text-white leading-relaxed font-medium">
                    🔒 <strong>Garantia de Privacidade:</strong> Nenhum outro usuário, administrador ou terceiro 
                    tem acesso aos seus dados de transações. Eles são usados exclusivamente pela IA Sofia 
                    para gerar suas análises pessoais.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 6: Análises por IA */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                6. Análises Geradas por Inteligência Artificial
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed">
                As análises fornecidas pela Sofia são geradas por inteligência artificial e têm caráter 
                <strong className="text-white"> informativo e educacional</strong>. Elas não constituem 
                aconselhamento financeiro profissional. Sempre consulte um profissional certificado antes 
                de tomar decisões financeiras importantes.
              </p>
            </section>

            {/* Seção 7: Propriedade Intelectual */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                7. Propriedade Intelectual
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed">
                Todo o conteúdo, design, funcionalidades e recursos do Orçamento Planejado são de 
                propriedade exclusiva da plataforma e estão protegidos por leis de direitos autorais. 
                Você mantém propriedade sobre os dados financeiros que insere na plataforma.
              </p>
            </section>

            {/* Seção 8: Pagamentos e Assinaturas */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                8. Pagamentos e Assinaturas
              </h3>
              <div className="space-y-3 text-[#b0b0b0]">
                <p className="leading-relaxed">
                  O acesso ao Orçamento Planejado pode requerer uma assinatura paga. Os pagamentos são 
                  processados através da <strong className="text-white">Hotmart</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>As assinaturas são renovadas automaticamente</li>
                  <li>Você pode cancelar a qualquer momento através da Hotmart</li>
                  <li>Não oferecemos reembolsos após o período de garantia</li>
                  <li>Reservamos o direito de modificar preços mediante aviso prévio</li>
                </ul>
              </div>
            </section>

            {/* Seção 9: Cancelamento */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                9. Cancelamento e Encerramento
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed">
                Você pode cancelar sua conta a qualquer momento através do painel de configurações ou 
                entrando em contato conosco. Reservamos o direito de suspender ou encerrar contas que 
                violem estes Termos de Uso.
              </p>
            </section>

            {/* Seção 10: Limitação de Responsabilidade */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                10. Limitação de Responsabilidade
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed">
                O Orçamento Planejado é fornecido "como está". Não garantimos que o serviço será 
                ininterrupto ou livre de erros. Não nos responsabilizamos por decisões financeiras 
                tomadas com base nas análises fornecidas pela plataforma.
              </p>
            </section>

            {/* Seção 11: Modificações */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                11. Modificações nos Termos
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed">
                Reservamos o direito de modificar estes termos a qualquer momento. Alterações significativas 
                serão comunicadas por e-mail. O uso continuado do serviço após as alterações constitui 
                aceitação dos novos termos.
              </p>
            </section>

            {/* Seção 12: Contato */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-[#00bf63] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                12. Contato
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed">
                Para questões sobre estes Termos de Uso, entre em contato conosco em:{' '}
                <a 
                  href="mailto:suporteplanejado@gmail.com" 
                  className="text-[#00bf63] hover:underline font-medium"
                >
                  suporteplanejado@gmail.com
                </a>
              </p>
            </section>

            {/* Informações Finais */}
            <div className="p-4 bg-[#0d0d0d] rounded-lg border border-[#2a2a2a] mt-6">
              <p className="text-xs text-[#737373] leading-relaxed text-center">
                Ao continuar usando o Orçamento Planejado, você confirma que leu, compreendeu e 
                concordou com estes Termos de Uso e nossa Política de Privacidade.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-[#00bf63] hover:bg-[#00a555] text-white"
          >
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
