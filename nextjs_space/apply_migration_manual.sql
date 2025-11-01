
-- ============================================================
-- MIGRAÇÃO: Adicionar INVESTMENT ao enum TransactionType
-- ============================================================
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/_/sql

-- PASSO 1: Verificar valores atuais do enum
SELECT unnest(enum_range(NULL::"TransactionType")) as current_values;

-- PASSO 2: Adicionar INVESTMENT ao enum (ignora se já existe)
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

-- PASSO 3: Verificar valores após adicionar
SELECT unnest(enum_range(NULL::"TransactionType")) as updated_values;
