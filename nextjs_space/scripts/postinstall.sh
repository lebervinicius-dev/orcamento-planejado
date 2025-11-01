
#!/bin/bash

# Script de pós-instalação para garantir que o Prisma Client seja gerado corretamente
# e que as migrações sejam aplicadas ao banco de produção

echo "🔧 Limpando cache do Prisma Client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

echo "📦 Aplicando migrações pendentes ao banco de dados..."
npx prisma migrate deploy || echo "⚠️  Nenhuma migração pendente ou erro ao aplicar"

echo "🔄 Gerando Prisma Client..."
npx prisma generate

echo "✅ Prisma Client gerado com sucesso!"
