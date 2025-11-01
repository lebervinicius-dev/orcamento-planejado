
# 🚨 Instruções: Aplicar Migração Manual no Supabase

## ⚠️ Situação Atual

O erro persiste porque o banco de dados do **Vercel em produção** (Supabase) ainda não tem o valor `INVESTMENT` no enum `TransactionType`.

---

## 🎯 Solução: Executar SQL Manual

### 1️⃣ Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login com suas credenciais
3. Selecione o projeto: **orcamento-planejado** (ou o nome correto do seu projeto)
4. No menu lateral, clique em **SQL Editor**

---

### 2️⃣ Executar o SQL de Migração

Copie e cole o SQL abaixo no editor:

```sql
-- Verificar valores atuais do enum
SELECT unnest(enum_range(NULL::"TransactionType")) as current_values;

-- Adicionar INVESTMENT ao enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'INVESTMENT' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'INVESTMENT';
        RAISE NOTICE '✅ INVESTMENT added successfully';
    ELSE
        RAISE NOTICE '⚠️  INVESTMENT already exists';
    END IF;
END $$;

-- Verificar valores após adicionar
SELECT unnest(enum_range(NULL::"TransactionType")) as updated_values;
```

**OU**

Use o arquivo que já criei:
📁 `/home/ubuntu/orcamento_planejado/nextjs_space/apply_migration_manual.sql`

---

### 3️⃣ Executar e Verificar Resultado

Clique em **Run** ou **Execute** no SQL Editor.

**Resultado Esperado:**

```
current_values
--------------
INCOME
EXPENSE

✅ INVESTMENT added successfully

updated_values
--------------
INCOME
EXPENSE
INVESTMENT
```

---

### 4️⃣ Testar a Aplicação

Após executar o SQL com sucesso:

1. **Acesse:** https://orcamento-planejado.abacusai.app
2. **Recarregue a página** (Ctrl+R ou Cmd+R)
3. **Teste todas as páginas:**
   - Dashboard
   - Transações
   - Categorias
   - Investimentos

4. **Verifique que não há mais erros!** ✅

---

## 🔍 Alternativa: Via psql

Se preferir usar linha de comando:

```bash
psql "postgresql://SEU_USER:SUA_SENHA@SEU_HOST:5432/postgres" \
  -c "ALTER TYPE \"TransactionType\" ADD VALUE IF NOT EXISTS 'INVESTMENT';"
```

---

## ⚙️ Por Que Isso Aconteceu?

1. O banco **local** (Abacus.AI) foi migrado corretamente ✅
2. O banco de **produção** (Supabase) estava conectado ao Vercel ✅
3. O script `postinstall.sh` no Vercel **não conseguiu aplicar** a migração ❌
   - Pode ter falhado silenciosamente
   - Pode não ter permissões suficientes
   - Pode ter problemas de timeout

---

## 📋 Checklist Pós-Migração

- [ ] SQL executado no Supabase
- [ ] Enum atualizado com sucesso
- [ ] App testado em produção
- [ ] Nenhum erro no console
- [ ] Todas as páginas funcionando

---

## 🚀 Próximos Passos

Após a migração funcionar:

1. ✅ Remover a rota temporária `/api/migrate`
2. ✅ Confirmar que o `postinstall.sh` funciona para futuras migrações
3. ✅ Documentar o processo

---

**Execute o SQL no Supabase Dashboard e reporte o resultado!** 🎯
