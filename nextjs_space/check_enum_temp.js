const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://role_9484b0c23:eaQqYU5eW_gE6aRZJTOXP5sKzkhEA7Q5@db-9484b0c23.db002.hosteddb.reai.io:5432/9484b0c23?connect_timeout=15'
    }
  }
});

async function checkEnum() {
  try {
    const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')
      ORDER BY enumsortorder;
    `;
    console.log('Valores do enum TransactionType:', result);
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnum();
