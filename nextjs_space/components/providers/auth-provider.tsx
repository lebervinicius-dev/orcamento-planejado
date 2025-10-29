
'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00bf63]"></div>
      </div>
    )
  }

  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}
