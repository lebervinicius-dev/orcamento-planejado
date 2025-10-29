

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AdminClient from '@/components/admin/admin-client'

export const metadata = {
  title: 'Painel Administrativo - Orçamento Planejado'
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Busca o usuário completo
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  // Verifica se é admin
  if (user?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <AdminClient />
}
