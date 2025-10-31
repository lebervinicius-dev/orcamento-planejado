

'use client'

import Link from 'next/link'
import { DollarSign, TrendingUp, BarChart3, Brain, ArrowRight, Star } from 'lucide-react'

export default function HomePage() {
  const scrollToFooter = () => {
    const footer = document.getElementById('footer-pricing')
    footer?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-[#2a2a2a] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-[#00bf63]" />
            <span className="text-xl font-bold text-white">Orçamento Planejado</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="btn-primary"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Controle suas <span className="text-[#00bf63]">finanças</span><br />
            de forma inteligente
          </h1>
          <p className="text-xl text-[#b0b0b0] mb-8 max-w-2xl mx-auto leading-relaxed">
            Organize suas receitas e despesas, visualize seus gastos e receba análises personalizadas 
            com inteligência artificial para tomar melhores decisões financeiras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
            >
              <span>Acessar Plataforma</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button
              onClick={scrollToFooter}
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
            >
              <span>Conhecer Planos</span>
              <DollarSign className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Tudo que você precisa para organizar suas finanças
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-hover-glow animate-fade-in group">
            <div className="bg-[#00bf63]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00bf63]/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-[#00bf63]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Gestão Completa</h3>
            <p className="text-[#b0b0b0] leading-relaxed">
              Registre suas receitas e despesas, organize por categorias personalizadas 
              e tenha controle total sobre seu dinheiro.
            </p>
          </div>

          <div className="card-hover-glow animate-fade-in group" style={{animationDelay: '0.1s'}}>
            <div className="bg-[#00bf63]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00bf63]/20 transition-colors">
              <BarChart3 className="h-6 w-6 text-[#00bf63]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Visualizações Inteligentes</h3>
            <p className="text-[#b0b0b0] leading-relaxed">
              Gráficos interativos mostram seus gastos por categoria, evolução do saldo 
              e tendências mensais de forma clara e visual.
            </p>
          </div>

          <div className="card-hover-glow animate-fade-in group" style={{animationDelay: '0.2s'}}>
            <div className="bg-[#00bf63]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00bf63]/20 transition-colors">
              <Brain className="h-6 w-6 text-[#00bf63]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Análises com IA - Sofia</h3>
            <p className="text-[#b0b0b0] leading-relaxed">
              Sofia é sua guia financeira pessoal. Ela analisa suas finanças com empatia e inteligência, 
              ajudando você a entender seus hábitos e definir metas sustentáveis.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Veja como é o seu Dashboard
        </h2>
        <p className="text-[#b0b0b0] text-center mb-12 max-w-2xl mx-auto">
          Visualize seus gastos, receitas e saldo de forma clara e organizada
        </p>

        {/* Mock Dashboard Cards */}
        <div className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#0d0d0d] to-[#121212] border border-[#2a2a2a] rounded-lg p-6 shadow-lg hover:shadow-[#00bf63]/10 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#737373] text-sm font-medium mb-1">Receitas do Mês</p>
                  <p className="text-2xl font-bold text-[#00bf63]">R$ 4.500,00</p>
                </div>
                <div className="bg-[#00bf63]/10 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-[#00bf63]" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0d0d0d] to-[#121212] border border-[#2a2a2a] rounded-lg p-6 shadow-lg hover:shadow-red-600/10 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#737373] text-sm font-medium mb-1">Despesas do Mês</p>
                  <p className="text-2xl font-bold text-red-600">R$ 3.200,00</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0d0d0d] to-[#121212] border border-[#2a2a2a] rounded-lg p-6 shadow-lg hover:shadow-[#00bf63]/10 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#737373] text-sm font-medium mb-1">Saldo do Mês</p>
                  <p className="text-2xl font-bold text-[#00bf63]">R$ 1.300,00</p>
                </div>
                <div className="bg-[#00bf63]/10 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-[#00bf63]" />
                </div>
              </div>
            </div>
          </div>

          {/* Análise de IA Mock */}
          <div className="bg-gradient-to-br from-[#0d0d0d] to-[#121212] border-l-4 border-[#00bf63] rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#00bf63]/10 p-2 rounded-full">
                <Brain className="h-5 w-5 text-[#00bf63]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Análise Financeira com Sofia</h3>
                <p className="text-sm text-[#737373]">Sua guia financeira pessoal</p>
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-[#737373]">Taxa de Economia</p>
                  <p className="text-xl font-bold text-[#00bf63]">28.9%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#737373]">Maior Gasto</p>
                  <p className="text-lg font-semibold text-white">Alimentação</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#737373]">Economia</p>
                  <p className="text-xl font-bold text-[#00bf63]">R$ 1.300,00</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#737373]">Recomendações</p>
                  <p className="text-lg font-semibold text-[#00bf63]">3</p>
                </div>
              </div>
              <div className="bg-[#00bf63]/10 p-3 rounded-lg border border-[#00bf63]/20">
                <p className="text-sm font-medium text-[#00bf63]">💡 Dica Principal:</p>
                <p className="text-sm text-white">Seus gastos com alimentação estão 15% acima da média. Considere planejar refeições semanais para economizar.</p>
              </div>
            </div>
          </div>

          {/* Gráficos Mock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#0d0d0d] to-[#121212] border border-[#2a2a2a] rounded-lg p-6 shadow-lg hover:shadow-[#00bf63]/10 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-5 w-5 text-[#00bf63]" />
                <h3 className="text-lg font-semibold text-white">Receitas por Categoria</h3>
              </div>
              <div className="h-48 flex items-center justify-center bg-[#1a1a1a] rounded-lg">
                <div className="text-center">
                  <svg className="h-24 w-24 mx-auto text-[#00bf63] opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                  <p className="text-[#737373] text-sm mt-2">Gráfico de Pizza Interativo</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0d0d0d] to-[#121212] border border-[#2a2a2a] rounded-lg p-6 shadow-lg hover:shadow-red-600/10 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-white">Despesas por Categoria</h3>
              </div>
              <div className="h-48 flex items-center justify-center bg-[#1a1a1a] rounded-lg">
                <div className="text-center">
                  <svg className="h-24 w-24 mx-auto text-red-500 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                  <p className="text-[#737373] text-sm mt-2">Gráfico de Pizza Interativo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action no Preview */}
          <div className="text-center pt-8">
            <p className="text-[#b0b0b0] mb-4">E muito mais funcionalidades esperando por você!</p>
            <Link
              href="/auth/login"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <span>Começar Agora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#00bf63] to-[#00a555] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar sua vida financeira?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Acesse sua conta e comece a organizar suas finanças de forma inteligente.
          </p>
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="flex space-x-1">
              {[...Array(5)].map((_: any, i: number) => (
                <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-medium">4.9/5 de satisfação</span>
          </div>
          <Link
            href="/auth/login"
            className="bg-white text-[#00bf63] hover:bg-gray-100 font-bold px-8 py-4 rounded-lg text-lg transition-all inline-flex items-center space-x-2 shadow-xl hover:scale-105"
          >
            <span>Fazer Login</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer com Pricing */}
      <footer id="footer-pricing" className="bg-black border-t border-[#2a2a2a] py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Seção de Preço */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Invista no seu Futuro Financeiro</h2>
            <p className="text-[#b0b0b0] mb-8 max-w-2xl mx-auto">
              Comece hoje mesmo a transformar sua relação com o dinheiro. 
              Tenha acesso completo a todas as funcionalidades, incluindo análises com IA da Sofia.
            </p>
            
            {/* Card de Preço */}
            <div className="max-w-md mx-auto bg-gradient-to-br from-[#0d0d0d] to-[#121212] border border-[#00bf63] rounded-xl p-8 shadow-2xl hover:shadow-[#00bf63]/20 transition-all">
              <div className="mb-6">
                <p className="text-[#737373] text-lg mb-2">Assinatura Mensal</p>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-[#737373] text-2xl line-through">R$ 34,90</span>
                  <span className="text-[#00bf63] text-5xl font-bold">R$ 19,90</span>
                </div>
                <p className="text-[#00bf63] text-sm mt-2 font-semibold">Economia de 43%</p>
              </div>
              
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-2 text-[#e0e0e0]">
                  <svg className="h-5 w-5 text-[#00bf63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Transações ilimitadas</span>
                </div>
                <div className="flex items-center space-x-2 text-[#e0e0e0]">
                  <svg className="h-5 w-5 text-[#00bf63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Categorias personalizadas</span>
                </div>
                <div className="flex items-center space-x-2 text-[#e0e0e0]">
                  <svg className="h-5 w-5 text-[#00bf63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Análises com IA - Sofia</span>
                </div>
                <div className="flex items-center space-x-2 text-[#e0e0e0]">
                  <svg className="h-5 w-5 text-[#00bf63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gráficos e relatórios avançados</span>
                </div>
                <div className="flex items-center space-x-2 text-[#e0e0e0]">
                  <svg className="h-5 w-5 text-[#00bf63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Exportação de dados</span>
                </div>
                <div className="flex items-center space-x-2 text-[#e0e0e0]">
                  <svg className="h-5 w-5 text-[#00bf63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Suporte prioritário</span>
                </div>
              </div>
              
              <a
                href={process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL || 'https://pay.hotmart.com/V102667493J'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-lg px-8 py-4 w-full inline-flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
              >
                <span>Assinar Agora</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              
              <p className="text-[#737373] text-sm mt-4">
                💳 Pagamento seguro via Hotmart
              </p>
            </div>
          </div>
          
          {/* Rodapé tradicional */}
          <div className="border-t border-[#2a2a2a] pt-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <DollarSign className="h-6 w-6 text-[#00bf63]" />
              <span className="text-lg font-bold text-white">Orçamento Planejado</span>
            </div>
            <p className="text-[#737373]">
              Gestão financeira pessoal simples e inteligente para brasileiros.
            </p>
            <p className="text-[#737373] text-sm mt-2">
              © 2025 Orçamento Planejado. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
