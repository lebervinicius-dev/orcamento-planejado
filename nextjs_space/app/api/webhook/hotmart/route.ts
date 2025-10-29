
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'

// Interface do payload da Hotmart
interface HotmartWebhookData {
  event: string
  data: {
    buyer: {
      email: string
      name: string
    }
    product: {
      id: string
      name: string
    }
    purchase: {
      status: string
      approved_date?: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: HotmartWebhookData = await request.json()
    
    console.log('📦 Webhook Hotmart recebido:', JSON.stringify(body, null, 2))

    // Verificar se é uma compra aprovada
    const isApproved = 
      body.event === 'PURCHASE_APPROVED' || 
      body.data?.purchase?.status === 'approved'

    if (!isApproved) {
      console.log('⏭️  Evento ignorado (não é compra aprovada)')
      return NextResponse.json({ 
        message: 'Evento recebido, mas não é uma compra aprovada' 
      })
    }

    const { buyer } = body.data
    const email = buyer.email
    const name = buyer.name

    if (!email || !name) {
      console.error('❌ Email ou nome ausente no payload')
      return NextResponse.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('👤 Usuário já existe:', email)
      return NextResponse.json({ 
        message: 'Usuário já cadastrado',
        userId: existingUser.id 
      })
    }

    // Criar novo usuário com senha padrão
    const defaultPassword = '12345678'
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        hotmartId: body.data?.product?.id || `hotmart_${Date.now()}`,
      }
    })

    console.log('✅ Novo usuário criado:', newUser.id)

    // Enviar email de boas-vindas
    await sendWelcomeEmail(email, name, email, defaultPassword)
    
    console.log('📧 Email de boas-vindas enviado para:', email)

    return NextResponse.json({ 
      success: true,
      message: 'Usuário criado e email enviado com sucesso',
      userId: newUser.id 
    })

  } catch (error) {
    console.error('❌ Erro no webhook Hotmart:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

// GET para testar se o endpoint está ativo
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook Hotmart ativo',
    timestamp: new Date().toISOString()
  })
}
