import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['pedrogmac9@gmail.com', 'clara@tomaraeducacaoecultura.com.br', 'lebervinicius@gmail.com']
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      status: true,
      createdAt: true,
      resetToken: true,
      resetTokenExpiry: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log('\n' + '='.repeat(80))
  console.log('USUÁRIOS NO BANCO DE DADOS')
  console.log('='.repeat(80))
  users.forEach(user => {
    console.log(`\n📧 ${user.email}`)
    console.log(`   Nome: ${user.name}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Status: ${user.status}`)
    console.log(`   Ativo: ${user.isActive}`)
    console.log(`   Telefone: ${user.phone || 'N/A'}`)
    console.log(`   Reset Token: ${user.resetToken ? 'SIM' : 'NÃO'}`)
    console.log(`   Reset Token Expiry: ${user.resetTokenExpiry || 'N/A'}`)
    console.log(`   Criado em: ${user.createdAt}`)
  })
  console.log('\n' + '='.repeat(80) + '\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
