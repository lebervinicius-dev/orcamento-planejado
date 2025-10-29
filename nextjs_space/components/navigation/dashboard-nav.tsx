
'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  DollarSign, 
  LayoutDashboard, 
  Receipt, 
  Tags, 
  Brain, 
  LogOut, 
  User, 
  Menu, 
  X,
  Shield,
  Settings
} from 'lucide-react'
import { ProfileDrawer } from '@/components/profile/profile-drawer'

export function DashboardNav() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false)

  const isAdmin = session?.user?.role === 'admin'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transações', href: '/dashboard/transactions', icon: Receipt },
    { name: 'Categorias', href: '/dashboard/categories', icon: Tags },
    { name: 'Análises IA', href: '/dashboard/analyses', icon: Brain },
    ...(isAdmin ? [{ name: 'Admin', href: '/dashboard/admin', icon: Shield }] : []),
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <>
      <nav className="bg-[#0d0d0d] border-b border-[#2a2a2a] sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-[#00bf63]" />
              <span className="text-xl font-bold text-white hidden sm:block">
                Orçamento Planejado
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-[#00bf63] text-white shadow-lg shadow-[#00bf63]/20'
                        : 'text-[#b0b0b0] hover:text-[#00bf63] hover:bg-[#00bf63]/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setIsProfileDrawerOpen(true)}
                className="flex items-center space-x-2 text-[#b0b0b0] hover:text-[#00bf63] transition-colors px-3 py-2 rounded-lg hover:bg-[#00bf63]/10"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">{session?.user?.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-[#b0b0b0] hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-[#b0b0b0]" />
              ) : (
                <Menu className="h-6 w-6 text-[#b0b0b0]" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-[#2a2a2a] py-4 animate-fade-in">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-[#00bf63] text-white shadow-lg shadow-[#00bf63]/20'
                          : 'text-[#b0b0b0] hover:text-[#00bf63] hover:bg-[#00bf63]/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                
                <div className="border-t border-[#2a2a2a] pt-4 mt-4">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsProfileDrawerOpen(true)
                    }}
                    className="flex items-center space-x-2 w-full text-left px-4 py-3 text-[#b0b0b0] hover:text-[#00bf63] hover:bg-[#00bf63]/10 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />
    </>
  )
}
