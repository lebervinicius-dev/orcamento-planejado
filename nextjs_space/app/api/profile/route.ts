
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { name, phone, password } = await request.json()

    // Se está alterando senha
    if (password) {
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(password, 10)

      // Atualizar usuário com nova senha
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          phone,
          password: hashedPassword,
        },
      })

      return NextResponse.json(
        { message: 'Perfil e senha atualizados com sucesso' },
        { status: 200 }
      )
    }

    // Se não está alterando senha, apenas atualiza nome e telefone
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
      },
    })

    return NextResponse.json(
      { message: 'Perfil atualizado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}

// PATCH para primeiro login (alterar senha temporária)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { newPassword, firstLogin } = await request.json()

    if (!newPassword) {
      return NextResponse.json(
        { error: 'Nova senha é obrigatória' },
        { status: 400 }
      )
    }

    // Validar força da senha
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar usuário
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        firstLogin: firstLogin !== undefined ? firstLogin : false,
      },
    })

    return NextResponse.json(
      { message: 'Senha alterada com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    )
  }
}
