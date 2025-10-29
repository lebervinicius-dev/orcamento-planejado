
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CategoriesClient } from '@/components/categories/categories-client'

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Buscar categorias do usuário
  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  })

  return <CategoriesClient categories={categories} />
}
