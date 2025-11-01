import 'server-only'


export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcryptjs.hash(password, 12)

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // Criar categorias padrão para o novo usuário
    const incomeCategories = [
      { name: 'Salário', color: '#00bf63' },
      { name: 'Freelance', color: '#20c997' },
      { name: 'Bonificação', color: '#6f42c1' },
      { name: 'Renda Extra', color: '#28a745' },
    ]

    const expenseCategories = [
      { name: 'Moradia', color: '#6c757d' },
      { name: 'Transporte', color: '#ffc107' },
      { name: 'Mercado', color: '#fd7e14' },
      { name: 'Alimentação', color: '#dc3545' },
      { name: 'Saúde', color: '#e83e8c' },
    ]

    const investmentCategories = [
      { name: 'Renda Fixa', color: '#00bf63' },
      { name: 'Fundos', color: '#6f42c1' },
      { name: 'Ações', color: '#20c997' },
      { name: 'Cripto', color: '#ffc107' },
      { name: 'Outros', color: '#737373' },
    ]

    // Criar todas as categorias de uma vez (mais eficiente)
    try {
      const allCategories = [
        ...incomeCategories.map(cat => ({
          name: cat.name,
          type: 'INCOME' as any,
          color: cat.color,
          userId: user.id,
        })),
        ...expenseCategories.map(cat => ({
          name: cat.name,
          type: 'EXPENSE' as any,
          color: cat.color,
          userId: user.id,
        })),
        ...investmentCategories.map(cat => ({
          name: cat.name,
          type: 'INVESTMENT' as any,
          color: cat.color,
          userId: user.id,
        })),
      ]

      await Promise.all(
        allCategories.map(categoryData =>
          prisma.category.create({ data: categoryData })
        )
      )

      console.log(`✅ ${allCategories.length} categorias padrão criadas para usuário ${user.id}`)
    } catch (categoryError) {
      console.error('⚠️ Erro ao criar categorias padrão:', categoryError)
      // Não falhar o signup se categorias falharem, mas logar o erro
    }

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
