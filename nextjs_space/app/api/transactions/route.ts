
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, description, date, type, categoryId } = body

    if (!amount || !description || !date || !type || !categoryId) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo inválido' },
        { status: 400 }
      )
    }

    // Verificar se a categoria pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
        type: type,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada ou inválida' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        type,
        categoryId,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar transação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const where: any = {
      userId: session.user.id,
    }

    if (type && ['INCOME', 'EXPENSE'].includes(type)) {
      where.type = type
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const totalTransactions = await prisma.transaction.count({ where })

    return NextResponse.json({
      transactions: transactions.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
      })),
      totalPages: Math.ceil(totalTransactions / limit),
      currentPage: page,
      total: totalTransactions,
    })
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
