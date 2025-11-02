
# 📋 Instruções de Migração Manual de Categorias

**Data:** 02/11/2025  
**Autor:** Sistema  
**Situação:** Migração concluída com sucesso ✅

---

## 🎯 Objetivo

Adicionar as **15 categorias padrão** (5 de cada tipo) aos usuários existentes que foram criados ANTES da implementação automática no signup.

---

## 🔍 Problema Identificado

- ✅ Novo signup cria as categorias automaticamente (implementado em `/app/api/signup/route.ts`)
- ❌ Usuários antigos (criados antes) não possuíam essas categorias
- ❌ Categorias faltantes: principalmente receitas (Vale, Comissão, Bonificação, Renda Extra) e despesas (Mercado, Saúde)

---

## 🛠️ Solução Implementada

### Script de Migração

**Arquivo:** `/scripts/migrate-categories.ts`

**Funcionalidades:**
- Busca todos os usuários do banco de dados
- Para cada usuário, verifica quais categorias padrão estão faltando
- Cria apenas as categorias que não existem (evita duplicação)
- Exibe log detalhado do processo
- Gera estatísticas finais

### Categorias Padrão Criadas

#### 🟢 Receitas (INCOME)
```typescript
[
  { name: 'Salário', color: '#00bf63' },
  { name: 'Vale', color: '#20c997' },
  { name: 'Comissão', color: '#17a2b8' },
  { name: 'Bonificação', color: '#6f42c1' },
  { name: 'Renda Extra', color: '#28a745' },
]
```

#### 🔴 Despesas (EXPENSE)
```typescript
[
  { name: 'Moradia', color: '#6c757d' },
  { name: 'Transporte', color: '#ffc107' },
  { name: 'Mercado', color: '#fd7e14' },
  { name: 'Alimentação', color: '#dc3545' },
  { name: 'Saúde', color: '#e83e8c' },
]
```

#### 🟣 Investimentos (INVESTMENT)
```typescript
[
  { name: 'Renda Fixa', color: '#00bf63' },
  { name: 'Ações', color: '#20c997' },
  { name: 'Fundos', color: '#6f42c1' },
  { name: 'Cripto', color: '#ffc107' },
  { name: 'Outros', color: '#737373' },
]
```

---

## ⚡ Execução da Migração

### Comando Executado

```bash
cd /home/ubuntu/orcamento_planejado/nextjs_space
yarn tsx --require dotenv/config scripts/migrate-categories.ts
```

### Resultado da Execução (02/11/2025)

```
📊 Total de usuários encontrados: 8

Usuários processados:
1. pedrogmac9@gmail.com - 10 categorias criadas
2. john@doe.com - 4 categorias criadas
3. lebervinicius@gmail.com - 10 categorias criadas
4. clara@tomaraeducacaoecultura.com.br - 9 categorias criadas
5. admin@orcamento.com - 10 categorias criadas ✅
6. viniciusleber@gmail.com - 14 categorias criadas ✅
7. eusofianewsletter@gmail.com - 15 categorias criadas
8. testuserf846xtxi@example.com - 0 categorias (já tinha todas)

📈 Estatísticas finais:
   - Usuários processados: 8
   - Categorias criadas: 71
   - Categorias já existentes: 49

✨ Todos os usuários agora possuem as 15 categorias padrão!
```

---

## ✅ Verificação Pós-Migração

### Contas Principais Verificadas

1. **viniciusleber@gmail.com** ✅
   - Todas as 15 categorias padrão criadas
   - 14 novas + 1 já existente (Ações)

2. **admin@orcamento.com** ✅
   - Todas as 15 categorias padrão criadas
   - 10 novas + 5 já existentes (investimentos)

### Como Verificar Manualmente

Para verificar as categorias de um usuário específico:

```bash
cd /home/ubuntu/orcamento_planejado/nextjs_space
yarn tsx --require dotenv/config -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const categories = await prisma.category.findMany({
  where: { user: { email: 'viniciusleber@gmail.com' } },
  select: { name: true, type: true, color: true }
});
console.log(categories);
await prisma.\$disconnect();
"
```

---

## 🔄 Manutenção Futura

### Para Novos Usuários

✅ **Automático** - O signup já cria as categorias padrão automaticamente  
📁 **Arquivo:** `/app/api/signup/route.ts`

### Para Usuários Existentes (se necessário)

Se no futuro precisar adicionar novas categorias padrão:

1. Atualizar os arrays em `/scripts/migrate-categories.ts`
2. Executar o script novamente:
   ```bash
   yarn tsx --require dotenv/config scripts/migrate-categories.ts
   ```
3. O script é **idempotente** - não cria duplicatas

---

## 📚 Arquivos Relacionados

- `/scripts/migrate-categories.ts` - Script de migração
- `/app/api/signup/route.ts` - Criação automática para novos usuários
- `/scripts/seed.ts` - Seed inicial do banco
- `/prisma/schema.prisma` - Schema do banco de dados

---

## 🎓 Lições Aprendidas

1. **Scripts são idempotentes** - Sempre verificar antes de criar
2. **Migração separada do signup** - Usuários antigos precisam de tratamento especial
3. **Logs detalhados** - Facilitam debug e verificação
4. **Estatísticas finais** - Permitem validação rápida do resultado

---

## 📞 Suporte

Para dúvidas ou problemas:
- Verificar logs do script
- Consultar documentação do Prisma
- Revisar schema.prisma para estrutura de categorias

---

**Status:** ✅ Migração concluída e testada  
**Próximo passo:** Build e deploy em produção
