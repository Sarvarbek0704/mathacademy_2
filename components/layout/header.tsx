"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth, useAppDispatch } from "@/lib/hooks"
import { logout } from "@/features/auth/authSlice"
import { useLogoutApiMutation } from "@/features/auth/authApi"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Moon, Sun, LogOut, Settings, User, Menu } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { toast } from "sonner"

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/students": "O'quvchilar",
  "/groups": "Guruhlar",
  "/cohorts": "Kohorta",
  "/tracks": "Yo'nalishlar",
  "/subjects": "Fanlar",
  "/assessments": "Baholash",
  "/attendance": "Davomat",
  "/timetable": "Dars jadvali",
  "/academic-years": "O'quv yili",
  "/ranking": "Reyting",
  "/certificates": "Sertifikatlar",
  "/competitions": "Musobaqalar",
  "/awards": "Mukofotlar",
  "/discipline": "Intizom",
  "/leaves": "Ruxsatnomalar",
  "/billing": "Hisob-kitob",
  "/campuses": "Kampuslar",
  "/dorms": "Yotoqxona",
  "/displays": "Displeylar",
  "/users": "Foydalanuvchilar",
  "/roles": "Rollar va Ruxsatlar",
  "/notifications": "Bildirishnomalar",
  "/files": "Fayllar",
  "/tenants": "Tashkilot sozlamalari",
  "/events": "Tadbirlar",
  "/announcements": "E'lonlar",
  "/settings": "Sozlamalar",
}

interface HeaderProps {
  onMobileMenuToggle: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const [logoutApi] = useLogoutApiMutation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const currentLabel = routeLabels[pathname] || routeLabels[`/${pathname.split("/")[1]}`] || "Sahifa"

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch {
      // ignore errors on logout api call
    }
    dispatch(logout())
    toast.success("Tizimdan chiqdingiz")
    router.push("/login")
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{currentLabel}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Mavzuni almashtirish</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {user?.fullName ? getInitials(user.fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground md:inline-block">
                  {user?.fullName || "Foydalanuvchi"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || user?.username}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Sozlamalar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowLogoutConfirm(true)}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Tizimdan chiqish"
        description="Haqiqatan ham tizimdan chiqmoqchimisiz? Qaytadan kirish kerak bo'ladi."
        confirmText="Chiqish"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </>
  )
}
