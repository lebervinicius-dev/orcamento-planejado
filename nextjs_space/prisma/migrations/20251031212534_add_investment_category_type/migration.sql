
-- CreateEnum para CategoryType
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE', 'INVESTMENT');

-- Alterar a coluna type na tabela Category
ALTER TABLE "Category" 
  ALTER COLUMN "type" TYPE "CategoryType" USING ("type"::text::"CategoryType");
