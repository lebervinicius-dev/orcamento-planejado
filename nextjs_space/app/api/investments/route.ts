

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Buscar investimentos do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        goal: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Converter Decimal para number
    const serializedInvestments = investments.map((inv: any) => ({
      ...inv,
      amount: Number(inv.amount),
      goal: inv.goal ? {
        ...inv.goal,
        targetAmount: Number(inv.goal.targetAmount),
        progress: Number(inv.goal.progress),
      } : null,
    }))

    return NextResponse.json(serializedInvestments)
  } catch (error) {
    console.error('Erro ao buscar investimentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar investimentos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo investimento
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
    const { name, amount, category, date, goalId } = data

    if (!name || !amount || !category) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Criar investimento
    const investment = await prisma.investment.create({
      data: {
        name,
        amount,
        category,
        date: date ? new Date(date) : new Date(),
        goalId: goalId || null,
        userId: session.user.id,
      },
      include: {
        goal: true,
      },
    })

    // Se tiver meta associada, atualizar o progresso
    if (goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
      })

      if (goal) {
        const newProgress = Number(goal.progress) + Number(amount)
        await prisma.goal.update({
          where: { id: goalId },
          data: { progress: newProgress },
        })
      }
    }

    // Serializar resposta
    const serializedInvestment = {
      ...investment,
      amount: Number(investment.amount),
      goal: investment.goal ? {
        ...investment.goal,
        targetAmount: Number(investment.goal.targetAmount),
        progress: Number(investment.goal.progress),
      } : null,
    }

    return NextResponse.json(serializedInvestment, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar investimento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar investimento' },
      { status: 500 }
    )
  }
}

// DELETE - Remover investimento
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

    // Buscar investimento para atualizar meta
    const investment = await prisma.investment.findUnique({
      where: { id },
      include: { goal: true },
    })

    if (!investment || investment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Investimento não encontrado' },
        { status: 404 }
      )
    }

    // Se tiver meta associada, subtrair o valor do progresso
    if (investment.goalId && investment.goal) {
      const newProgress = Math.max(0, Number(investment.goal.progress) - Number(investment.amount))
      await prisma.goal.update({
        where: { id: investment.goalId },
        data: { progress: newProgress },
      })
    }

    // Deletar investimento
    await prisma.investment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Investimento removido com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar investimento:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar investimento' },
      { status: 500 }
    )
  }
}
