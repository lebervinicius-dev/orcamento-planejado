import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Sempre retorna sucesso (por segurança, não revelar se o email existe)
    if (!user) {
      return NextResponse.json({
        message: 'Se o email existir, você receberá um link de recuperação.',
      })
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Enviar email de recuperação
    await sendPasswordResetEmail(user.email, resetToken)

    return NextResponse.json({
      message: 'Se o email existir, você receberá um link de recuperação.',
    })
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
