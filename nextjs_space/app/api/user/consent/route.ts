
/**
 * API para registrar consentimento LGPD do usuário
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, withRetry } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Atualiza o registro de consentimento LGPD
    const updatedUser = await withRetry(async () => {
      return await prisma.user.update({
        where: { email: session.user.email || '' },
        data: {
          lgpdConsentAt: new Date()
        },
        select: {
          id: true,
          email: true,
          lgpdConsentAt: true
        }
      })
    })

    console.log(`✅ Consentimento LGPD registrado para ${updatedUser.email}`)

    return NextResponse.json({
      success: true,
      message: 'Consentimento registrado com sucesso',
      lgpdConsentAt: updatedUser.lgpdConsentAt
    })

  } catch (error: any) {
    console.error('❌ Erro ao registrar consentimento LGPD:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao registrar consentimento',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - Verifica status do consentimento
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const user = await withRetry(async () => {
      return await prisma.user.findUnique({
        where: { email: session.user.email || '' },
        select: {
          id: true,
          email: true,
          lgpdConsentAt: true
        }
      })
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      hasConsent: !!user.lgpdConsentAt,
      lgpdConsentAt: user.lgpdConsentAt
    })

  } catch (error: any) {
    console.error('❌ Erro ao verificar consentimento:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao verificar consentimento',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
