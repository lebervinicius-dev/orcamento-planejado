
import { PrismaClient, TransactionType } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário de teste
  const hashedPassword = await bcryptjs.hash('johndoe123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'João Silva',
      role: 'user',
      isActive: true,
    },
  })

  console.log(`✅ Usuário de teste criado: ${testUser.email}`)

  // Criar usuário admin de teste
  const adminHashedPassword = await bcryptjs.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@orcamento.com' },
    update: {},
    create: {
      email: 'admin@orcamento.com',
      password: adminHashedPassword,
      name: 'Administrador',
      role: 'admin',
      isActive: true,
    },
  })

  console.log(`✅ Usuário admin criado: ${adminUser.email}`)

  // Categorias padrão para receitas (apenas 3)
  const incomeCategories = [
    { name: 'Salário', color: '#00bf63' },
    { name: 'Bonificações', color: '#20c997' },
    { name: 'Dividendos', color: '#6f42c1' },
  ]

  // Categorias padrão para despesas (apenas 3)
  const expenseCategories = [
    { name: 'Moradia', color: '#6c757d' },
    { name: 'Mercado', color: '#dc3545' },
    { name: 'Transporte', color: '#ffc107' },
  ]

  // Criar categorias de receita
  for (const category of incomeCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: testUser.id,
          name: category.name,
          type: TransactionType.INCOME,
        },
      },
      update: {},
      create: {
        name: category.name,
        type: TransactionType.INCOME,
        color: category.color,
        userId: testUser.id,
      },
    })
  }

  // Criar categorias de despesa
  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: testUser.id,
          name: category.name,
          type: TransactionType.EXPENSE,
        },
      },
      update: {},
      create: {
        name: category.name,
        type: TransactionType.EXPENSE,
        color: category.color,
        userId: testUser.id,
      },
    })
  }

  console.log('✅ Categorias padrão criadas')

  // Buscar as categorias criadas para usar nas transações
  const salarioCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: 'Salário', type: TransactionType.INCOME }
  })

  const mercadoCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: 'Mercado', type: TransactionType.EXPENSE }
  })

  const transporteCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: 'Transporte', type: TransactionType.EXPENSE }
  })

  const moradiaCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: 'Moradia', type: TransactionType.EXPENSE }
  })

  // Criar transações de exemplo (últimos 3 meses)
  const hoje = new Date()
  const transactionsData = [
    // Receitas
    {
      amount: 5000,
      description: 'Salário Janeiro 2025',
      date: new Date(2025, 0, 5), // Janeiro
      type: TransactionType.INCOME,
      categoryId: salarioCategory?.id || '',
      userId: testUser.id,
    },
    {
      amount: 5000,
      description: 'Salário Dezembro 2024',
      date: new Date(2024, 11, 5), // Dezembro
      type: TransactionType.INCOME,
      categoryId: salarioCategory?.id || '',
      userId: testUser.id,
    },
    {
      amount: 1200,
      description: 'Freelancer - Projeto Web',
      date: new Date(2024, 11, 15),
      type: TransactionType.INCOME,
      categoryId: salarioCategory?.id || '',
      userId: testUser.id,
    },

    // Despesas Janeiro 2025
    {
      amount: 800,
      description: 'Aluguel Janeiro',
      date: new Date(2025, 0, 1),
      type: TransactionType.EXPENSE,
      categoryId: moradiaCategory?.id || '',
      userId: testUser.id,
    },
    {
      amount: 450,
      description: 'Compras do mercado',
      date: new Date(2025, 0, 3),
      type: TransactionType.EXPENSE,
      categoryId: mercadoCategory?.id || '',
      userId: testUser.id,
    },
    {
      amount: 120,
      description: 'Uber e ônibus',
      date: new Date(2025, 0, 4),
      type: TransactionType.EXPENSE,
      categoryId: transporteCategory?.id || '',
      userId: testUser.id,
    },
    {
      amount: 89.90,
      description: 'Feira da semana',
      date: new Date(2025, 0, 8),
      type: TransactionType.EXPENSE,
      categoryId: mercadoCategory?.id || '',
      userId: testUser.id,
    },

    // Despesas Dezembro 2024
    {
      amount: 800,
      description: 'Aluguel Dezembro',
      date: new Date(2024, 11, 1),
      type: TransactionType.EXPENSE,
      categoryId: moradiaCategory?.id || '',
      userId: testUser.id,
    },
    {
      amount: 380,
      description: 'Mercado mensal',
      date: new Date(2024, 11, 10),
      type: TransactionType.EXPENSE,
      categoryId: mercadoCategory?.id || '',
      userId: testUser.id,
    },
    {
      amount: 95,
      description: 'Combustível',
      date: new Date(2024, 11, 12),
      type: TransactionType.EXPENSE,
      categoryId: transporteCategory?.id || '',
      userId: testUser.id,
    },
  ]

  for (const transaction of transactionsData) {
    if (transaction.categoryId) {
      await prisma.transaction.create({
        data: transaction,
      })
    }
  }

  console.log('✅ Transações de exemplo criadas')

  // Criar uma análise de IA de exemplo
  const analysisData = {
    title: 'Análise Financeira - Janeiro 2025',
    content: `# Análise Financeira - Janeiro 2025

## 📊 Resumo do Período
Seus dados financeiros de janeiro mostram uma **gestão equilibrada** das finanças pessoais. 

## 🔍 Principais Insights

### Receitas
- **Receita Total**: R$ 5.000,00
- **Fonte Principal**: Salário (100%)
- Status: ✅ Receita estável e consistente

### Despesas
- **Gasto Total**: R$ 1.459,90
- **Economia**: R$ 3.540,10 (70,8% da receita)
- **Maior Categoria**: Moradia (54,8% dos gastos)

## 💡 Recomendações

1. **Continue o bom trabalho**: Você está poupando mais de 70% da renda, excelente controle!

2. **Diversifique a receita**: Considere outras fontes de renda além do salário.

3. **Monitore alimentação**: Categoria representa 37% dos gastos, verifique oportunidades de economia.

## 🎯 Metas Sugeridas
- Manter taxa de economia acima de 60%
- Explorar investimentos com o dinheiro poupado
- Estabelecer um fundo de emergência`,
    periodStart: new Date(2025, 0, 1), // 1 de janeiro de 2025
    periodEnd: new Date(2025, 0, 31),   // 31 de janeiro de 2025
    insights: JSON.stringify({
      totalIncome: 5000,
      totalExpenses: 1459.90,
      savings: 3540.10,
      savingsRate: 70.8,
      topExpenseCategory: 'Moradia',
      topExpenseAmount: 800,
      recommendations: [
        'Manter alta taxa de poupança',
        'Diversificar fontes de renda',
        'Monitorar gastos com alimentação'
      ]
    }),
    userId: testUser.id,
  }

  await prisma.aiAnalysis.create({
    data: analysisData,
  })

  console.log('✅ Análise de IA de exemplo criada')
  console.log('\n🎉 Seed concluído com sucesso!')
  console.log(`\n📋 Dados criados:`)
  console.log(`   - Usuário teste: ${testUser.email} (senha: johndoe123)`)
  console.log(`   - Usuário admin: ${adminUser.email} (senha: admin123)`)
  console.log(`   - Categorias: ${incomeCategories.length + expenseCategories.length}`)
  console.log(`   - Transações: ${transactionsData.length}`)
  console.log(`   - Análises IA: 1`)
  console.log(`\n👤 Para acessar o painel admin, faça login com:`)
  console.log(`   Email: admin@orcamento.com`)
  console.log(`   Senha: admin123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
