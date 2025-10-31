

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Buscar metas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        investments: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Converter Decimal para number
    const serializedGoals = goals.map((goal: any) => ({
      ...goal,
      targetAmount: Number(goal.targetAmount),
      progress: Number(goal.progress),
      investments: goal.investments.map((inv: any) => ({
        ...inv,
        amount: Number(inv.amount),
      })),
    }))

    return NextResponse.json(serializedGoals)
  } catch (error) {
    console.error('Erro ao buscar metas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar metas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova meta
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, targetAmount } = data

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        targetAmount,
        userId: session.user.id,
      },
      include: {
        investments: true,
      },
    })

    // Serializar resposta
    const serializedGoal = {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      progress: Number(goal.progress),
      investments: goal.investments.map((inv: any) => ({
        ...inv,
        amount: Number(inv.amount),
      })),
    }

    return NextResponse.json(serializedGoal, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar meta' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar meta
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, name, targetAmount } = data

    if (!id || !name || !targetAmount) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Verificar se a meta pertence ao usuário
    const existingGoal = await prisma.goal.findUnique({
      where: { id },
    })

    if (!existingGoal || existingGoal.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        name,
        targetAmount,
      },
      include: {
        investments: true,
      },
    })

    // Serializar resposta
    const serializedGoal = {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      progress: Number(goal.progress),
      investments: goal.investments.map((inv: any) => ({
        ...inv,
        amount: Number(inv.amount),
      })),
    }

    return NextResponse.json(serializedGoal)
  } catch (error) {
    console.error('Erro ao atualizar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar meta' },
      { status: 500 }
    )
  }
}

// DELETE - Remover meta
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      )
    }

    // Verificar se a meta pertence ao usuário
    const goal = await prisma.goal.findUnique({
      where: { id },
    })

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    // Deletar meta (os investimentos terão goalId setado para null automaticamente)
    await prisma.goal.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Meta removida com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar meta' },
      { status: 500 }
    )
  }
}
