
#!/bin/bash

# Script de pós-instalação para garantir que o Prisma Client seja gerado corretamente
# Remove qualquer cache anterior e regenera do zero

echo "🔧 Limpando cache do Prisma Client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

echo "🔄 Gerando Prisma Client..."
npx prisma generate

echo "✅ Prisma Client gerado com sucesso!"
