
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Por segurança, não revelar que o email não existe
      return NextResponse.json(
        { message: 'Se o email existir, a senha foi resetada para 12345678' },
        { status: 200 }
      )
    }

    // Resetar senha para 12345678
    const hashedPassword = await bcrypt.hash('12345678', 10)
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    return NextResponse.json(
      { message: 'Senha resetada para 12345678. Por favor, faça login e altere sua senha.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro ao resetar senha' },
      { status: 500 }
    )
  }
}
