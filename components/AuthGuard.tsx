'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLazyTestAuthQuery } from '@/lib/store/api/baseApi'
import { useAppSelector } from '@/hooks/useRedux'
import { selectHasHydrated } from '@/lib/store/slices/authSlice'
import { Loader2 } from 'lucide-react'

const PUBLIC_PATHS = ['/login']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const hasHydrated = useAppSelector(selectHasHydrated)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [testAuth] = useLazyTestAuthQuery()

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  useEffect(() => {
    if (isPublicPath) {
      setIsAuthorized(true)
      return
    }

    if (!hasHydrated) return

    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.replace('/login')
        return
      }

      try {
        await testAuth().unwrap()
        setIsAuthorized(true)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('role')
        localStorage.removeItem('userId')
        router.replace('/login')
      }
    }

    checkAuth()
  }, [pathname, isPublicPath, hasHydrated, router, testAuth])

  if (isPublicPath) return <>{children}</>

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) return null

  return <>{children}</>
}
