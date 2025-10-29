

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

// Interface para o payload do Hotmart
interface HotmartWebhookPayload {
  id: string
  creation_date: number
  event: string
  version: string
  data: {
    buyer: {
      email: string
      name?: string
    }
    purchase: {
      transaction: string
      status: string
      approved_date?: number
    }
    product: {
      id: number
      name: string
    }
  }
}

// Função para gerar senha aleatória
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Função para enviar email (simples)
async function sendWelcomeEmail(email: string, password: string, name?: string) {
  // Se você tiver um serviço de email configurado (SendGrid, Resend, etc)
  // implemente aqui. Por enquanto, apenas log
  console.log('=== EMAIL DE BOAS-VINDAS ===')
  console.log('Para:', email)
  console.log('Nome:', name || 'Cliente')
  console.log('Senha:', password)
  console.log('Login em: https://seu-dominio.com/auth/login')
  console.log('============================')
  
  // TODO: Integrar com serviço de email
  // Exemplo com Resend:
  // await resend.emails.send({
  //   from: 'contato@seudominio.com',
  //   to: email,
  //   subject: 'Bem-vindo ao Orçamento Planejado!',
  //   html: `<h1>Bem-vindo!</h1><p>Seu acesso foi liberado:</p>
  //          <p>Email: ${email}</p><p>Senha: ${password}</p>`
  // })
}

export async function POST(request: NextRequest) {
  try {
    const body: HotmartWebhookPayload = await request.json()

    // Validação básica do payload
    if (!body.data?.buyer?.email || !body.data?.purchase?.transaction) {
      return NextResponse.json(
        { error: 'Payload inválido' },
        { status: 400 }
      )
    }

    const { buyer, purchase } = body.data
    
    // Eventos que liberam acesso
    const allowedEvents = [
      'PURCHASE_COMPLETE',
      'PURCHASE_APPROVED',
      'SUBSCRIPTION_ACTIVE'
    ]

    if (allowedEvents.includes(body.event)) {
      // Verifica se o usuário já existe
      let user = await prisma.user.findUnique({
        where: { email: buyer.email }
      })

      if (!user) {
        // Cria novo usuário
        const password = generatePassword()
        const hashedPassword = await bcryptjs.hash(password, 10)

        user = await prisma.user.create({
          data: {
            email: buyer.email,
            name: buyer.name || buyer.email.split('@')[0],
            password: hashedPassword,
            hotmartId: purchase.transaction,
            isActive: true,
            role: 'user'
          }
        })

        // Envia email com credenciais
        await sendWelcomeEmail(buyer.email, password, buyer.name)

        return NextResponse.json({
          success: true,
          message: 'Usuário criado com sucesso',
          userId: user.id
        })
      } else {
        // Usuário já existe - apenas ativa se estiver inativo
        if (!user.isActive) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isActive: true }
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Usuário já existe e foi ativado'
        })
      }
    }

    // Eventos de cancelamento
    if (body.event === 'PURCHASE_CANCELED' || body.event === 'SUBSCRIPTION_CANCELLATION') {
      const user = await prisma.user.findUnique({
        where: { email: buyer.email }
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: false }
        })

        return NextResponse.json({
          success: true,
          message: 'Usuário desativado'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Evento processado'
    })

  } catch (error) {
    console.error('Erro no webhook Hotmart:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para testar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook Hotmart endpoint funcionando',
    timestamp: new Date().toISOString()
  })
}
