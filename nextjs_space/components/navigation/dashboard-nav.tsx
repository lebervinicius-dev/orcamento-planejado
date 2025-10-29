
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
  X 
} from 'lucide-react'

export function DashboardNav() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transações', href: '/dashboard/transactions', icon: Receipt },
    { name: 'Categorias', href: '/dashboard/categories', icon: Tags },
    { name: 'Análises IA', href: '/dashboard/analyses', icon: Brain },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white border-b border-[#e9ecef] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-[#00bf63]" />
            <span className="text-xl font-bold text-[#000000] hidden sm:block">
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
                      ? 'bg-[#00bf63] text-white'
                      : 'text-[#737373] hover:text-[#00bf63] hover:bg-[#00bf63]/5'
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
            <div className="flex items-center space-x-2 text-[#737373]">
              <User className="h-4 w-4" />
              <span className="text-sm">{session?.user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-[#737373] hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-[#737373]" />
            ) : (
              <Menu className="h-6 w-6 text-[#737373]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#e9ecef] py-4 animate-fade-in">
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
                        ? 'bg-[#00bf63] text-white'
                        : 'text-[#737373] hover:text-[#00bf63] hover:bg-[#00bf63]/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="border-t border-[#e9ecef] pt-4 mt-4">
                <div className="flex items-center space-x-2 px-4 py-2 text-[#737373]">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{session?.user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
  )
}
