
import { PrismaClient, CategoryType } from '@prisma/client'

const prisma = new PrismaClient()

// Categorias padrão para receitas (5 categorias)
const incomeCategories = [
  { name: 'Salário', color: '#00bf63' },
  { name: 'Vale', color: '#20c997' },
  { name: 'Comissão', color: '#17a2b8' },
  { name: 'Bonificação', color: '#6f42c1' },
  { name: 'Renda Extra', color: '#28a745' },
]

// Categorias padrão para despesas (5 categorias)
const expenseCategories = [
  { name: 'Moradia', color: '#6c757d' },
  { name: 'Transporte', color: '#ffc107' },
  { name: 'Mercado', color: '#fd7e14' },
  { name: 'Alimentação', color: '#dc3545' },
  { name: 'Saúde', color: '#e83e8c' },
]

// Categorias padrão para investimentos (5 categorias)
const investmentCategories = [
  { name: 'Renda Fixa', color: '#00bf63' },
  { name: 'Ações', color: '#20c997' },
  { name: 'Fundos', color: '#6f42c1' },
  { name: 'Cripto', color: '#ffc107' },
  { name: 'Outros', color: '#737373' },
]

async function migrateUserCategories(userId: string, userEmail: string) {
  console.log(`\n📝 Processando usuário: ${userEmail}`)
  
  let categoriesCreated = 0
  let categoriesSkipped = 0

  // Processar categorias de receita
  for (const category of incomeCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: userId,
        name: category.name,
        type: CategoryType.INCOME,
      },
    })

    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          type: CategoryType.INCOME,
          color: category.color,
          userId: userId,
        },
      })
      categoriesCreated++
      console.log(`   ✅ Criada: ${category.name} (RECEITA)`)
    } else {
      categoriesSkipped++
      console.log(`   ⏭️  Já existe: ${category.name} (RECEITA)`)
    }
  }

  // Processar categorias de despesa
  for (const category of expenseCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: userId,
        name: category.name,
        type: CategoryType.EXPENSE,
      },
    })

    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          type: CategoryType.EXPENSE,
          color: category.color,
          userId: userId,
        },
      })
      categoriesCreated++
      console.log(`   ✅ Criada: ${category.name} (DESPESA)`)
    } else {
      categoriesSkipped++
      console.log(`   ⏭️  Já existe: ${category.name} (DESPESA)`)
    }
  }

  // Processar categorias de investimento
  for (const category of investmentCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: userId,
        name: category.name,
        type: CategoryType.INVESTMENT,
      },
    })

    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          type: CategoryType.INVESTMENT,
          color: category.color,
          userId: userId,
        },
      })
      categoriesCreated++
      console.log(`   ✅ Criada: ${category.name} (INVESTIMENTO)`)
    } else {
      categoriesSkipped++
      console.log(`   ⏭️  Já existe: ${category.name} (INVESTIMENTO)`)
    }
  }

  return { categoriesCreated, categoriesSkipped }
}

async function main() {
  console.log('🔄 Iniciando migração de categorias padrão para usuários existentes...\n')

  // Buscar todos os usuários
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  console.log(`📊 Total de usuários encontrados: ${users.length}\n`)

  let totalCreated = 0
  let totalSkipped = 0

  // Processar cada usuário
  for (const user of users) {
    const { categoriesCreated, categoriesSkipped } = await migrateUserCategories(
      user.id,
      user.email
    )
    totalCreated += categoriesCreated
    totalSkipped += categoriesSkipped
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 Migração concluída com sucesso!')
  console.log('='.repeat(60))
  console.log(`\n📈 Estatísticas finais:`)
  console.log(`   - Usuários processados: ${users.length}`)
  console.log(`   - Categorias criadas: ${totalCreated}`)
  console.log(`   - Categorias já existentes: ${totalSkipped}`)
  console.log(`\n✨ Todos os usuários agora possuem as 15 categorias padrão!\n`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro na migração:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
