
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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

    // Em produção, enviar email aqui
    // Por enquanto, vamos logar o link no console
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    
    console.log('\n🔐 LINK DE RECUPERAÇÃO DE SENHA:')
    console.log(`Email: ${email}`)
    console.log(`Link: ${resetLink}`)
    console.log(`Expira em: ${resetTokenExpiry.toLocaleString('pt-BR')}\n`)

    return NextResponse.json({
      message: 'Se o email existir, você receberá um link de recuperação.',
      // Em desenvolvimento, retornar o link
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
    })
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
