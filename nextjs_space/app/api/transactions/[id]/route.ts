
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se a transação pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
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

    const transaction = await prisma.transaction.update({
      where: {
        id: params.id,
      },
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        type,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    })
  } catch (error) {
    console.error('Erro ao atualizar transação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se a transação pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      )
    }

    await prisma.transaction.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Transação excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir transação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    })
  } catch (error) {
    console.error('Erro ao buscar transação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
