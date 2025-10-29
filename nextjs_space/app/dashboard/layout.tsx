
import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardNav } from '@/components/navigation/dashboard-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <DashboardNav />
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
