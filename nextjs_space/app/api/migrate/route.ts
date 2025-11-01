
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verificar valores atuais do enum
    const currentValues = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"TransactionType")) as value
    `;

    console.log('Current enum values:', currentValues);

    // Tentar adicionar INVESTMENT ao enum
    try {
      await prisma.$executeRaw`
        ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'INVESTMENT'
      `;
      
      console.log('✅ INVESTMENT added to enum successfully');
    } catch (error: any) {
      // Se o valor já existe, não é um erro
      if (error.message.includes('already exists')) {
        console.log('⚠️  INVESTMENT already exists in enum');
      } else {
        throw error;
      }
    }

    // Verificar valores após a migração
    const updatedValues = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"TransactionType")) as value
    `;

    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully',
      before: currentValues,
      after: updatedValues
    });
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
