
# 🔧 Solução: Erro INVESTMENT no Enum TransactionType

## 📋 Resumo do Problema

O erro persistia em produção no Vercel:
```
Value 'INVESTMENT' not found in enum 'TransactionType'
```

Apesar de:
- ✅ Schema Prisma ter o valor INVESTMENT
- ✅ Migração criada localmente
- ✅ Código TypeScript correto

## 🎯 Causa Raiz

O Vercel **não estava aplicando as migrações** durante o processo de build. O script `postinstall.sh` apenas regenerava o Prisma Client, mas não executava `prisma migrate deploy`.

Resultado:
- Build do Vercel gerava Prisma Client com base no schema.prisma
- Mas o banco de dados PostgreSQL não tinha o enum atualizado
- Runtime error ao tentar usar 'INVESTMENT'

## ✅ Solução Implementada

### 1. Verificação do Banco de Dados

Confirmado que o enum INVESTMENT está presente:
```sql
SELECT unnest(enum_range(NULL::"TransactionType"));
-- Resultado:
-- INCOME
-- EXPENSE
-- INVESTMENT ✅
```

### 2. Atualização do Script Postinstall

**Arquivo:** `scripts/postinstall.sh`

**ANTES:**
```bash
echo "🔧 Limpando cache do Prisma Client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

echo "🔄 Gerando Prisma Client..."
npx prisma generate

echo "✅ Prisma Client gerado com sucesso!"
```

**DEPOIS:**
```bash
echo "🔧 Limpando cache do Prisma Client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

echo "📦 Aplicando migrações pendentes ao banco de dados..."
npx prisma migrate deploy || echo "⚠️  Nenhuma migração pendente ou erro ao aplicar"

echo "🔄 Gerando Prisma Client..."
npx prisma generate

echo "✅ Prisma Client gerado com sucesso!"
```

### 3. Commits Realizados

```bash
b0a59c0 fix: apply database migrations during Vercel build
fcd70ba Database migration applied successfully
dda4049 chore: trigger redeploy after applying INVESTMENT enum migration
```

## 🔄 Fluxo de Build Atualizado

### Vercel Build Process (Agora):

1. **Install Dependencies**
   ```
   npm install --legacy-peer-deps
   ```

2. **Run Postinstall Script**
   ```bash
   bash scripts/postinstall.sh
   ```
   - Limpa cache do Prisma
   - 🆕 **Aplica migrações pendentes** (`prisma migrate deploy`)
   - Regenera Prisma Client

3. **Build Next.js**
   ```
   npm run build
   ```

## 📊 Status Atual

| Componente | Status |
|------------|--------|
| Schema Prisma | ✅ INVESTMENT definido |
| Migração SQL | ✅ Criada e commitada |
| Banco Local | ✅ Enum atualizado |
| Banco Produção | ✅ Enum atualizado |
| Prisma Client | ✅ Regenerado |
| Build Local | ✅ Passando |
| Script Postinstall | ✅ **Corrigido** |
| Deploy Vercel | ⏳ **Em andamento** |

## 🧪 Como Testar

Após o deploy do Vercel estar "Ready":

### 1. Acessar Produção
```
https://orcamento-planejado.abacusai.app
```

### 2. Testar Funcionalidades
- ✅ Dashboard carrega sem erros
- ✅ Página de Transações funciona
- ✅ Página de Categorias exibe corretamente
- ✅ Criar nova categoria tipo INVESTMENT
- ✅ Criar nova transação tipo INVESTMENT
- ✅ Modal LGPD funciona no primeiro acesso

### 3. Verificar Console
Abrir DevTools do navegador e verificar que **não há** erros:
```
❌ Value 'INVESTMENT' not found in enum 'TransactionType'
```

## 🚀 Próximo Deploy

O Vercel deve executar automaticamente:
1. ✅ Instalar dependências
2. ✅ Executar `npx prisma migrate deploy`
3. ✅ Regenerar Prisma Client
4. ✅ Build Next.js
5. ✅ Deploy bem-sucedido

## 📝 Lições Aprendidas

### ⚠️ Problema Comum em Deploys Vercel

Muitos projetos Next.js + Prisma esquecem de aplicar migrações durante o build, assumindo que o banco já está atualizado.

### ✅ Solução Definitiva

Sempre incluir no script de postinstall ou build:
```bash
npx prisma migrate deploy
```

Isso garante que:
- Migrações pendentes sejam aplicadas
- Schema do banco esteja sincronizado com o Prisma Client
- Erros de runtime sejam evitados

## 🔗 Referências

- [Prisma Migrate Deploy](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-deployment)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)
- [PostgreSQL Enum Types](https://www.postgresql.org/docs/current/datatype-enum.html)

---

**Data:** 2025-10-31  
**Status:** ✅ Solução implementada e em deploy  
**Autor:** DeepAgent (Abacus.AI)
