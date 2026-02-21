"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useAppDispatch } from "@/lib/hooks"
import { useGetMeQuery } from "@/features/auth/authApi"
import { setUser, logout } from "@/features/auth/authSlice"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: me, error } = useGetMeQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (me) {
      dispatch(setUser(me))
    }
  }, [me, dispatch])

  useEffect(() => {
    if (error && "status" in error && error.status === 401) {
      dispatch(logout())
      router.push("/login")
    }
  }, [error, dispatch, router])

  useEffect(() => {
    if (!token && typeof window !== "undefined") {
      const stored = localStorage.getItem("accessToken")
      if (!stored) {
        router.push("/login")
      }
    }
  }, [token, router])

  if (!token && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          collapsed ? "lg:ml-[68px]" : "lg:ml-64"
        )}
      >
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
