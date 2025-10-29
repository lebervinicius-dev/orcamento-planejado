
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { DollarSign, TrendingUp, BarChart3, Brain, ArrowRight, Star } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00bf63]"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null // Redirecionando...
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f6f6] to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e9ecef] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-[#00bf63]" />
            <span className="text-xl font-bold text-[#000000]">Orçamento Planejado</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-[#737373] hover:text-[#00bf63] font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="btn-primary"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-[#000000] mb-6 leading-tight">
            Controle suas <span className="text-[#00bf63]">finanças</span><br />
            de forma inteligente
          </h1>
          <p className="text-xl text-[#737373] mb-8 max-w-2xl mx-auto leading-relaxed">
            Organize suas receitas e despesas, visualize seus gastos e receba análises personalizadas 
            com inteligência artificial para tomar melhores decisões financeiras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <span>Começar Agora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="btn-outline text-lg px-8 py-3"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-[#000000] text-center mb-12">
          Tudo que você precisa para organizar suas finanças
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card animate-fade-in hover:shadow-md transition-all group">
            <div className="bg-[#00bf63]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00bf63]/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-[#00bf63]" />
            </div>
            <h3 className="text-xl font-semibold text-[#000000] mb-3">Gestão Completa</h3>
            <p className="text-[#737373] leading-relaxed">
              Registre suas receitas e despesas, organize por categorias personalizadas 
              e tenha controle total sobre seu dinheiro.
            </p>
          </div>

          <div className="card animate-fade-in hover:shadow-md transition-all group" style={{animationDelay: '0.1s'}}>
            <div className="bg-[#00bf63]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00bf63]/20 transition-colors">
              <BarChart3 className="h-6 w-6 text-[#00bf63]" />
            </div>
            <h3 className="text-xl font-semibold text-[#000000] mb-3">Visualizações Inteligentes</h3>
            <p className="text-[#737373] leading-relaxed">
              Gráficos interativos mostram seus gastos por categoria, evolução do saldo 
              e tendências mensais de forma clara e visual.
            </p>
          </div>

          <div className="card animate-fade-in hover:shadow-md transition-all group" style={{animationDelay: '0.2s'}}>
            <div className="bg-[#00bf63]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00bf63]/20 transition-colors">
              <Brain className="h-6 w-6 text-[#00bf63]" />
            </div>
            <h3 className="text-xl font-semibold text-[#000000] mb-3">Análises com IA</h3>
            <p className="text-[#737373] leading-relaxed">
              Receba insights semanais personalizados, identifique padrões de gasto 
              e descubra oportunidades de economia automaticamente.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#00bf63] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar sua vida financeira?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de brasileiros que já organizaram suas finanças conosco.
          </p>
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-medium">4.9/5 de satisfação</span>
          </div>
          <Link
            href="/auth/register"
            className="bg-white text-[#00bf63] hover:bg-gray-100 font-bold px-8 py-4 rounded-lg text-lg transition-colors inline-flex items-center space-x-2"
          >
            <span>Criar Conta Gratuita</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e9ecef] py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <DollarSign className="h-6 w-6 text-[#00bf63]" />
            <span className="text-lg font-bold text-[#000000]">Orçamento Planejado</span>
          </div>
          <p className="text-[#737373]">
            Gestão financeira pessoal simples e inteligente para brasileiros.
          </p>
        </div>
      </footer>
    </div>
  )
}
