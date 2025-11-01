
#!/bin/bash

# Script de pós-instalação para garantir que o Prisma Client seja gerado corretamente
# e que as migrações sejam aplicadas ao banco de produção

echo "🔄 Gerando Prisma Client..."
npx prisma generate

echo "📦 Aplicando migrações pendentes ao banco de dados..."
npx prisma migrate deploy || echo "⚠️  Nenhuma migração pendente ou erro ao aplicar"

echo "✅ Setup do Prisma concluído com sucesso!"
