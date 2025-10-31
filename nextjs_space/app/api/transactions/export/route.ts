
import 'server-only'

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'xlsx'
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // Construir filtros de data
    const where: any = {
      userId: session.user.id,
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    // Buscar transações
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma transação encontrada para o período selecionado' },
        { status: 404 }
      )
    }

    // Preparar dados para exportação
    const data = transactions.map((t: any) => ({
      Data: new Date(t.date).toLocaleDateString('pt-BR'),
      Descrição: t.description,
      Tipo: t.type === 'INCOME' ? 'Receita' : 'Despesa',
      Categoria: t.category.name,
      Valor: `R$ ${Number(t.amount).toFixed(2).replace('.', ',')}`,
    }))

    // Gerar arquivo conforme formato solicitado
    if (format === 'xlsx') {
      // Exportar para Excel
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações')

      // Gerar buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      const monthName = month
        ? new Date(parseInt(year!), parseInt(month) - 1).toLocaleDateString(
            'pt-BR',
            { month: 'long', year: 'numeric' }
          )
        : 'todas'

      // Retornar arquivo
      return new NextResponse(buffer, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=extrato-${monthName}.xlsx`,
        },
      })
    } else if (format === 'pdf') {
      // Exportar para PDF
      const doc = new jsPDF()

      const monthName = month
        ? new Date(parseInt(year!), parseInt(month) - 1).toLocaleDateString(
            'pt-BR',
            { month: 'long', year: 'numeric' }
          )
        : 'todas as transações'

      // Título
      doc.setFontSize(16)
      doc.text(`Extrato de Transações - ${monthName}`, 14, 15)

      // Adicionar tabela
      autoTable(doc, {
        head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']],
        body: data.map((row) => [
          row.Data,
          row.Descrição,
          row.Tipo,
          row.Categoria,
          row.Valor,
        ]),
        startY: 25,
        theme: 'striped',
        headStyles: { fillColor: [0, 191, 99] },
        styles: { fontSize: 9 },
      })

      // Calcular totais
      const totalIncome = transactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

      const totalExpense = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

      const balance = totalIncome - totalExpense

      // Adicionar resumo no final
      const finalY = (doc as any).lastAutoTable.finalY || 25
      doc.setFontSize(10)
      doc.text(`Total de Receitas: R$ ${totalIncome.toFixed(2).replace('.', ',')}`, 14, finalY + 10)
      doc.text(`Total de Despesas: R$ ${totalExpense.toFixed(2).replace('.', ',')}`, 14, finalY + 17)
      doc.text(`Saldo: R$ ${balance.toFixed(2).replace('.', ',')}`, 14, finalY + 24)

      // Gerar buffer
      const buffer = doc.output('arraybuffer')

      // Retornar arquivo
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=extrato-${monthName}.pdf`,
        },
      })
    } else {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro ao exportar transações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
