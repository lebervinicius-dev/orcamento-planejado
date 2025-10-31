
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Adicionando categorias de investimento aos usuários existentes...')

  // Categorias padrão de investimento
  const investmentCategories = [
    { name: 'Renda Fixa', color: '#00bf63' },
    { name: 'Ações', color: '#20c997' },
    { name: 'Fundos', color: '#6f42c1' },
    { name: 'Cripto', color: '#ffc107' },
    { name: 'Outros', color: '#737373' },
  ]

  // Buscar todos os usuários
  const users = await prisma.user.findMany()
  console.log(`📋 Encontrados ${users.length} usuários`)

  for (const user of users) {
    console.log(`\n👤 Processando usuário: ${user.email}`)
    
    for (const category of investmentCategories) {
      // Verificar se a categoria já existe
      const existing = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: category.name,
          type: 'INVESTMENT' as any,
        },
      })

      if (!existing) {
        await prisma.category.create({
          data: {
            name: category.name,
            type: 'INVESTMENT' as any,
            color: category.color,
            userId: user.id,
          },
        })
        console.log(`  ✅ Criada categoria: ${category.name}`)
      } else {
        console.log(`  ⏭️  Categoria já existe: ${category.name}`)
      }
    }
  }

  console.log('\n✅ Processo concluído!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
