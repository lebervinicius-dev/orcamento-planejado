

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

// GET - Listar todos os usuários (somente admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Busca o usuário completo com role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Busca todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        hotmartId: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário manualmente (somente admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { email, name, password, phone, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Cria o usuário
    const hashedPassword = await bcryptjs.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        phone: phone || null,
        role: role || 'user',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    console.log('\n' + '='.repeat(80))
    console.log('👤 NOVO USUÁRIO CRIADO MANUALMENTE PELO ADMIN')
    console.log('='.repeat(80))
    console.log('  → Nome:', user.name)
    console.log('  → Email:', user.email)
    console.log('  → Criado por:', currentUser.name)
    console.log('  → Enviando email de boas-vindas...')
    console.log('='.repeat(80))

    // Enviar email de boas-vindas automaticamente
    const emailResult = await sendWelcomeEmail(
      user.email,
      user.name || 'Usuário',
      user.email,
      password // Senha original (não hasheada)
    )

    if (!emailResult.success) {
      console.error('⚠️ AVISO: Usuário criado, mas email não foi enviado!')
      console.error('  → Erro:', emailResult.error)
      
      return NextResponse.json({ 
        user,
        warning: 'Usuário criado, mas houve um problema ao enviar o email de boas-vindas. Use o botão "Reenviar Email" para tentar novamente.',
        emailError: (emailResult.error as Error)?.message || 'Erro desconhecido'
      })
    }

    console.log('✅ Email de boas-vindas enviado com sucesso!')
    console.log('='.repeat(80) + '\n')

    return NextResponse.json({ 
      user,
      emailSent: true,
      message: 'Usuário criado e email de boas-vindas enviado com sucesso!'
    })
  } catch (error) {
    console.error('\n' + '='.repeat(80))
    console.error('❌ ERRO AO CRIAR USUÁRIO')
    console.error('='.repeat(80))
    console.error('  → Erro:', error)
    console.error('  → Stack:', (error as Error).stack)
    console.error('='.repeat(80) + '\n')
    
    return NextResponse.json(
      { error: 'Erro ao criar usuário: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
