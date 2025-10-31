import 'server-only'


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UserStatus } from '@prisma/client'
import { sendWelcomeEmail, sendCancellationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

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
      transaction?: string
    }
  }
}

// Função para gerar senha temporária segura
function generateSecurePassword(length = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%&*'
  const allChars = uppercase + lowercase + numbers + symbols
  
  let password = ''
  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Preencher o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Validar assinatura HMAC (se configurada)
function validateHmacSignature(body: string, signature?: string): boolean {
  const secret = process.env.HOTMART_WEBHOOK_SECRET
  
  if (!secret) {
    console.warn('⚠️ HOTMART_WEBHOOK_SECRET não configurado - validação HMAC desabilitada')
    return true // Permitir se não houver secret configurado
  }
  
  if (!signature) {
    console.warn('⚠️ Assinatura HMAC ausente no webhook')
    return false
  }
  
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const calculatedSignature = hmac.digest('hex')
  
  return calculatedSignature === signature
}

export async function POST(request: NextRequest) {
  try {
    // Ler o body como texto para validação HMAC
    const bodyText = await request.text()
    const body: any = JSON.parse(bodyText)
    const timestamp = new Date().toISOString()
    
    // Validar assinatura HMAC
    const signature = request.headers.get('x-hotmart-hottok')
    if (!validateHmacSignature(bodyText, signature || undefined)) {
      console.error('❌ Assinatura HMAC inválida')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    console.log('\n' + '='.repeat(80))
    console.log(`🔔 WEBHOOK HOTMART RECEBIDO - ${timestamp}`)
    console.log('='.repeat(80))
    console.log('📦 Evento:', body.event || body.evento || 'unknown')
    console.log('='.repeat(80) + '\n')

    // Extrair dados do webhook
    let email: string | undefined
    let name: string | undefined
    let transactionId: string | undefined
    let eventType: 'approved' | 'refunded' | 'cancelled' | 'unknown' = 'unknown'

    // Detectar tipo de evento
    const event = (body.event || body.evento || '').toUpperCase()
    
    if (event.includes('APPROVED') || event.includes('COMPLETE') || event.includes('COMPRA_APROVADA')) {
      eventType = 'approved'
    } else if (event.includes('REFUND') || event.includes('REEMBOLSO')) {
      eventType = 'refunded'
    } else if (event.includes('CANCEL') || event.includes('CHARGEBACK') || event.includes('CANCELADO')) {
      eventType = 'cancelled'
    }

    // Extrair email e nome (múltiplos formatos)
    email = body.data?.buyer?.email || body.buyer?.email || body.customer?.email || body.comprador?.email
    name = body.data?.buyer?.name || body.buyer?.name || body.customer?.name || body.comprador?.nome
    transactionId = body.data?.purchase?.transaction || body.purchase?.transaction || body.transaction

    console.log('🔍 Dados extraídos:', { eventType, email, name, transactionId })

    // ==================== COMPRA APROVADA ====================
    if (eventType === 'approved') {
      if (!email || !name) {
        console.error('❌ Email ou nome ausente no payload de aprovação')
        return NextResponse.json(
          { error: 'Email e nome são obrigatórios para aprovação' },
          { status: 400 }
        )
      }

      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        console.log('👤 Usuário já existe, reativando acesso:', email)
        
        // Reativar usuário se estava inativo ou cancelado
        if (existingUser.status !== UserStatus.ACTIVE) {
          await prisma.user.update({
            where: { email },
            data: { 
              status: UserStatus.ACTIVE,
              isActive: true,
              canceledAt: null
            }
          })
          console.log('✅ Acesso reativado para:', email)
        }
        
        return NextResponse.json({ 
          message: 'Usuário já cadastrado (acesso reativado se necessário)',
          userId: existingUser.id 
        })
      }

      // Gerar senha temporária segura
      const temporaryPassword = generateSecurePassword(16)
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

      // Criar novo usuário
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'user',
          status: 'ACTIVE',
          isActive: true,
          firstLogin: true, // Forçar troca de senha no primeiro login
          hotmartId: transactionId || `hotmart_${Date.now()}`,
        }
      })

      console.log('✅ Novo usuário criado:', newUser.id)

      // Enviar email de boas-vindas
      try {
        await sendWelcomeEmail(email, name, email, temporaryPassword)
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
    }

    // ==================== REEMBOLSO/CANCELAMENTO ====================
    if (eventType === 'refunded' || eventType === 'cancelled') {
      if (!email) {
        console.error('❌ Email ausente no payload de reembolso/cancelamento')
        return NextResponse.json(
          { error: 'Email obrigatório para reembolso/cancelamento' },
          { status: 400 }
        )
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (user) {
        // Cancelar acesso do usuário
        await prisma.user.update({
          where: { email },
          data: { 
            status: UserStatus.CANCELED,
            isActive: false,
            canceledAt: new Date()
          }
        })
        console.log(`🚫 Acesso cancelado para: ${email} (motivo: ${eventType})`)
        
        // Enviar email de cancelamento
        try {
          await sendCancellationEmail(email, user.name || 'Cliente', eventType)
          console.log('📧 Email de cancelamento enviado para:', email)
        } catch (emailError) {
          console.error('⚠️ Erro ao enviar email de cancelamento:', emailError)
          // Não falha o webhook se o email não enviar
        }
        
        return NextResponse.json({
          success: true,
          message: `Acesso cancelado devido a ${eventType}`,
          userId: user.id
        })
      } else {
        console.log('⚠️ Usuário não encontrado para cancelar:', email)
        return NextResponse.json({
          message: 'Usuário não encontrado',
          email
        })
      }
    }

    // ==================== EVENTO NÃO TRATADO ====================
    console.log('⏭️ Evento não tratado:', event)
    return NextResponse.json({ 
      message: 'Evento recebido mas não requer ação',
      receivedEvent: event
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
