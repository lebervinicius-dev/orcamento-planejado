import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log('\n' + '='.repeat(80))
    console.log('🔒 SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA')
    console.log('='.repeat(80))
    console.log('  → Email solicitado:', email)

    if (!email) {
      console.log('  ❌ Email não fornecido')
      console.log('='.repeat(80) + '\n')
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    })

    console.log('  → Usuário encontrado:', !!user)

    // Sempre retorna sucesso (por segurança, não revelar se o email existe)
    if (!user) {
      console.log('  ℹ️ Email não existe no sistema (resposta genérica enviada)')
      console.log('='.repeat(80) + '\n')
      return NextResponse.json({
        message: 'Se o email existir, você receberá um link de recuperação.',
      })
    }

    console.log('  → Nome do usuário:', user.name)
    console.log('  → Status:', user.status)
    console.log('  → Ativo:', user.isActive)

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    console.log('  → Token gerado:', resetToken.substring(0, 10) + '...')
    console.log('  → Expira em:', resetTokenExpiry.toISOString())

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    console.log('  ✅ Token salvo no banco de dados')
    console.log('  → Enviando email de recuperação...')

    // Enviar email de recuperação
    const emailResult = await sendPasswordResetEmail(user.email, resetToken)

    if (!emailResult.success) {
      console.error('  ❌ ERRO ao enviar email de recuperação!')
      console.error('  → Erro:', emailResult.error)
      console.log('='.repeat(80) + '\n')
      
      return NextResponse.json(
        { 
          error: 'Erro ao enviar email de recuperação. Tente novamente mais tarde.',
          details: (emailResult.error as Error)?.message 
        },
        { status: 500 }
      )
    }

    console.log('  ✅ Email de recuperação enviado com sucesso!')
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({
      message: 'Se o email existir, você receberá um link de recuperação.',
    })
  } catch (error) {
    console.error('\n' + '='.repeat(80))
    console.error('❌ ERRO CRÍTICO NA RECUPERAÇÃO DE SENHA')
    console.error('='.repeat(80))
    console.error('  → Erro:', error)
    console.error('  → Stack:', (error as Error).stack)
    console.error('='.repeat(80) + '\n')
    
    return NextResponse.json(
      { error: 'Erro ao processar solicitação: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
