import { PrismaClient } from '@prisma/client'

// Valida e adiciona parâmetros
let databaseUrl = process.env.DATABASE_URL || ''
if (!databaseUrl.includes('pgbouncer=true')) {
  const separator = databaseUrl.includes('?') ? '&' : '?'
  const params = [
    'pgbouncer=true',
    'connection_limit=1',
    'sslmode=require'
  ]
  const missingParams = params.filter(param => !databaseUrl.includes(param.split('=')[0]))
  if (missingParams.length > 0) {
    databaseUrl = `${databaseUrl}${separator}${missingParams.join('&')}`
  }
}

const prisma = new PrismaClient({
  log: ['warn'],
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com PostgreSQL/Supabase...')
    console.log('📍 URL (mascarada):', databaseUrl.replace(/:[^:]*@/, ':***@'))
    
    // Testa uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test, current_database() as db`
    console.log('✅ Conexão bem-sucedida!', result)
    
    // Testa contagem de usuários
    const userCount = await prisma.user.count()
    console.log(`✅ Total de usuários no banco: ${userCount}`)
    
    // Aguarda um pouco para simular idle
    console.log('⏳ Aguardando 3 segundos para testar estabilidade...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Faz outra query para testar reconexão
    const result2 = await prisma.user.count()
    console.log(`✅ Segunda query bem-sucedida: ${result2} usuários`)
    
    await prisma.$disconnect()
    console.log('✅ Teste concluído com sucesso!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Erro na conexão:', error.message)
    console.error('Código:', error.code)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

testConnection()
