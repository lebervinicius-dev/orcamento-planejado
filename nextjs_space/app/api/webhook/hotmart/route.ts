
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
    const body: any = await request.json()
    const timestamp = new Date().toISOString()
    
    console.log('\n' + '='.repeat(80))
    console.log(`🔔 WEBHOOK HOTMART RECEBIDO - ${timestamp}`)
    console.log('='.repeat(80))
    console.log('📦 Payload completo:', JSON.stringify(body, null, 2))
    console.log('='.repeat(80) + '\n')

    // Suporte a múltiplos formatos de payload da Hotmart
    let email: string | undefined
    let name: string | undefined
    let isApproved = false

    // Formato 1: event direto
    if (body.event === 'PURCHASE_APPROVED' || body.event === 'PURCHASE_COMPLETE') {
      isApproved = true
      email = body.data?.buyer?.email
      name = body.data?.buyer?.name
    }

    // Formato 2: status dentro de purchase
    if (body.data?.purchase?.status === 'approved' || body.data?.purchase?.status === 'complete') {
      isApproved = true
      email = body.data?.buyer?.email || body.buyer?.email
      name = body.data?.buyer?.name || body.buyer?.name
    }

    // Formato 3: compra direta (alguns webhooks da Hotmart)
    if (body.purchase?.status === 'approved' || body.purchase?.status === 'complete') {
      isApproved = true
      email = body.buyer?.email || body.customer?.email
      name = body.buyer?.name || body.customer?.name
    }

    // Formato 4: event como COMPRA_APROVADA (português)
    if (body.event === 'COMPRA_APROVADA' || body.evento === 'COMPRA_APROVADA') {
      isApproved = true
      email = body.comprador?.email || body.buyer?.email
      name = body.comprador?.nome || body.buyer?.name
    }

    console.log('🔍 Dados extraídos:', { isApproved, email, name })

    if (!isApproved) {
      console.log('⏭️  Evento ignorado (não é compra aprovada)')
      return NextResponse.json({ 
        message: 'Evento recebido, mas não é uma compra aprovada',
        receivedEvent: body.event || body.evento || 'unknown'
      })
    }

    if (!email || !name) {
      console.error('❌ Email ou nome ausente no payload')
      console.error('Payload completo:', JSON.stringify(body, null, 2))
      return NextResponse.json(
        { 
          error: 'Email e nome são obrigatórios',
          debug: {
            receivedPayload: body,
            extractedData: { email, name }
          }
        },
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
        hotmartId: String(body.data?.product?.id || `hotmart_${Date.now()}`),
      }
    })

    console.log('✅ Novo usuário criado:', newUser.id)

    // Enviar email de boas-vindas
    try {
      await sendWelcomeEmail(email, name, email, defaultPassword)
      console.log('📧 Email de boas-vindas enviado para:', email)
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email (usuário foi criado):', emailError)
      // Não falha o webhook se o email não enviar
    }

    return NextResponse.json({ 
      success: true,
      message: 'Usuário criado e email enviado com sucesso',
      userId: newUser.id 
    })

  } catch (error) {
    const timestamp = new Date().toISOString()
    console.error('\n' + '='.repeat(80))
    console.error(`💥 ERRO NO WEBHOOK HOTMART - ${timestamp}`)
    console.error('='.repeat(80))
    console.error('Error:', error)
    console.error('Stack:', (error as Error).stack)
    console.error('='.repeat(80) + '\n')
    
    return NextResponse.json(
      { 
        error: 'Erro ao processar webhook',
        timestamp,
        details: (error as Error).message
      },
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
