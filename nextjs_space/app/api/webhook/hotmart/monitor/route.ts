import 'server-only'


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Log de todas as requisições recebidas
const webhookLogs: any[] = []

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const headers = Object.fromEntries(request.headers.entries())
  
  let body: any = null
  try {
    body = await request.json()
  } catch {
    body = 'Erro ao fazer parse do JSON'
  }
  
  const log = {
    timestamp,
    method: 'POST',
    url: request.url,
    headers,
    body
  }
  
  webhookLogs.push(log)
  
  // Mantém apenas os últimos 50 logs
  if (webhookLogs.length > 50) {
    webhookLogs.shift()
  }
  
  console.log('\n🔍 MONITOR - Requisição recebida:', JSON.stringify(log, null, 2))
  
  return NextResponse.json({ 
    success: true,
    message: 'Log registrado',
    timestamp 
  })
}

export async function GET() {
  // Buscar últimos 5 usuários criados
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      hotmartId: true
    }
  })
  
  return NextResponse.json({ 
    status: 'Monitor ativo',
    timestamp: new Date().toISOString(),
    logsCount: webhookLogs.length,
    logs: webhookLogs,
    recentUsers
  })
}
