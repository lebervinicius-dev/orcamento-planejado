import 'server-only'


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = params.id

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    console.log('\n' + '='.repeat(80))
    console.log('📧 REENVIO MANUAL DE EMAIL DE BOAS-VINDAS')
    console.log('='.repeat(80))
    console.log('Usuário:', user.name, '(' + user.email + ')')
    console.log('Solicitado por:', session.user.name)
    console.log('='.repeat(80) + '\n')

    // Senha padrão (mesma do webhook)
    const defaultPassword = '12345678'

    // Enviar email de boas-vindas
    const result = await sendWelcomeEmail(user.email, user.name || 'Usuário', user.email, defaultPassword)

    if (result.success) {
      console.log('✅ Email reenviado com sucesso!')
      return NextResponse.json({ 
        success: true, 
        message: 'Email de boas-vindas enviado com sucesso',
        messageId: result.messageId
      })
    } else {
      console.error('❌ Falha no reenvio:', result.error)
      return NextResponse.json(
        { 
          error: 'Erro ao enviar email',
          details: result.error 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Erro no reenvio de email:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao reenviar email',
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
