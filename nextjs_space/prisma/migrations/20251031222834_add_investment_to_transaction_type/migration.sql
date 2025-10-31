-- Adicionar INVESTMENT ao enum TransactionType
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'INVESTMENT';
