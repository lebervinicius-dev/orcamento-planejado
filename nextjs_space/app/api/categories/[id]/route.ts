import 'server-only'


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
    const { name, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a categoria pertence ao usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já existe outra categoria com este nome e tipo
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        type: existingCategory.type,
        id: {
          not: params.id,
        },
      },
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome para este tipo' },
        { status: 400 }
      )
    }

    const category = await prisma.category.update({
      where: {
        id: params.id,
      },
      data: {
        name: name.trim(),
        color: color || existingCategory.color,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
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

    // Verificar se a categoria pertence ao usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se existem transações usando esta categoria
    const transactionCount = await prisma.transaction.count({
      where: {
        categoryId: params.id,
      },
    })

    if (transactionCount > 0) {
      // Buscar ou criar categoria "Desconhecida" do mesmo tipo
      let unknownCategory = await prisma.category.findFirst({
        where: {
          userId: session.user.id,
          name: 'Desconhecida',
          type: existingCategory.type,
        },
      })

      if (!unknownCategory) {
        unknownCategory = await prisma.category.create({
          data: {
            name: 'Desconhecida',
            type: existingCategory.type,
            color: '#737373',
            userId: session.user.id,
          },
        })
      }

      // Migrar todas as transações para a categoria "Desconhecida"
      await prisma.transaction.updateMany({
        where: {
          categoryId: params.id,
        },
        data: {
          categoryId: unknownCategory.id,
        },
      })
    }

    // Excluir a categoria
    await prisma.category.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ 
      message: 'Categoria excluída com sucesso',
      migratedTransactions: transactionCount 
    })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
