
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, XCircle, Ban } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function AccessDeniedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams?.get('reason') || 'unknown'

  const getMessage = () => {
    switch (reason) {
      case 'canceled':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: 'Assinatura Cancelada',
          description: 'Sua assinatura foi cancelada e o acesso ao sistema foi bloqueado.',
          details: [
            'Você não pode mais acessar o dashboard',
            'Seus dados serão mantidos por 90 dias',
            'Para reativar, entre em contato com o suporte'
          ]
        }
      case 'suspended':
        return {
          icon: <Ban className="h-16 w-16 text-orange-500" />,
          title: 'Conta Suspensa',
          description: 'Sua conta foi temporariamente suspensa.',
          details: [
            'Acesso ao sistema bloqueado temporariamente',
            'Entre em contato com o suporte para resolver',
            'Email: suporteplanejado@gmail.com'
          ]
        }
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-yellow-500" />,
          title: 'Acesso Negado',
          description: 'Você não tem permissão para acessar esta área.',
          details: [
            'Verifique seu status de assinatura',
            'Entre em contato com o suporte se necessário'
          ]
        }
    }
  }

  const message = getMessage()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {message.icon}
          </div>
          <CardTitle className="text-2xl font-bold">{message.title}</CardTitle>
          <CardDescription className="text-base">
            {message.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-800">O que isso significa:</h3>
            <ul className="space-y-2">
              {message.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {reason === 'canceled' && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-2">
                💚 Quer voltar?
              </p>
              <p className="text-sm text-green-700">
                Adoraríamos ter você de volta! Faça uma nova assinatura e retome o controle das suas finanças.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <Button 
            onClick={handleLogout} 
            className="w-full"
            variant="default"
          >
            Voltar para a página inicial
          </Button>
          
          {reason === 'canceled' && (
            <Button 
              onClick={() => window.location.href = process.env.NEXT_PUBLIC_APP_URL || '/'}
              className="w-full"
              variant="outline"
            >
              Fazer nova assinatura
            </Button>
          )}
          
          <p className="text-xs text-center text-gray-500 mt-2">
            Dúvidas? Entre em contato: <br />
            <a href="mailto:suporteplanejado@gmail.com" className="text-green-600 hover:underline">
              suporteplanejado@gmail.com
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
