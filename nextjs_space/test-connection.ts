import { prisma } from './lib/db'

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com PostgreSQL...')
    
    // Testa uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão bem-sucedida!', result)
    
    // Testa contagem de usuários
    const userCount = await prisma.user.count()
    console.log(`✅ Total de usuários no banco: ${userCount}`)
    
    await prisma.$disconnect()
    console.log('✅ Desconexão realizada com sucesso')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Erro na conexão:', error.message)
    console.error('Código:', error.code)
    process.exit(1)
  }
}

testConnection()
