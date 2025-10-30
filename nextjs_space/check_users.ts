import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  
  console.log('\n📊 ÚLTIMOS 5 USUÁRIOS CRIADOS:')
  console.log('=' .repeat(80))
  
  if (users.length === 0) {
    console.log('❌ NENHUM usuário encontrado no banco!')
    console.log('⚠️  Isso significa que o webhook NÃO foi chamado pela Hotmart')
  } else {
    users.forEach((user: User, index: number) => {
      console.log(`\n${index + 1}. ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Criado em: ${user.createdAt}`)
      console.log(`   Hotmart ID: ${user.hotmartId || 'N/A'}`)
    })
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
