"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard, Users, UserCog, BookOpen, CalendarDays, ClipboardCheck,
  FileText, DollarSign, Shield, Clock, Award, Medal, Trophy, BarChart3,
  Building2, Home, Monitor, Calendar, Bell, Megaphone, FolderOpen, Settings,
  GraduationCap, ChevronDown, PanelLeftClose, PanelLeft, Layers, GitBranch,
  AlertTriangle, Building,
} from "lucide-react"

const navGroups = [
  {
    label: "Asosiy",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/announcements", icon: Megaphone, label: "E'lonlar" },
    ],
  },
  {
    label: "O'quvchilar",
    items: [
      { href: "/students", icon: Users, label: "O'quvchilar" },
      { href: "/groups", icon: Layers, label: "Guruhlar" },
      { href: "/cohorts", icon: GraduationCap, label: "Kohorta" },
      { href: "/tracks", icon: GitBranch, label: "Yo'nalishlar" },
    ],
  },
  {
    label: "O'quv jarayoni",
    items: [
      { href: "/subjects", icon: BookOpen, label: "Fanlar" },
      { href: "/assessments", icon: ClipboardCheck, label: "Baholash" },
      { href: "/attendance", icon: CalendarDays, label: "Davomat" },
      { href: "/timetable", icon: Clock, label: "Dars jadvali" },
      { href: "/academic-years", icon: Calendar, label: "O'quv yili" },
    ],
  },
  {
    label: "Natijalar",
    items: [
      { href: "/ranking", icon: BarChart3, label: "Reyting" },
      { href: "/certificates", icon: FileText, label: "Sertifikatlar" },
      { href: "/competitions", icon: Trophy, label: "Musobaqalar" },
      { href: "/awards", icon: Award, label: "Mukofotlar" },
    ],
  },
  {
    label: "Intizom",
    items: [
      { href: "/discipline", icon: AlertTriangle, label: "Intizom" },
      { href: "/leaves", icon: Shield, label: "Ruxsatnomalar" },
    ],
  },
  {
    label: "Moliya",
    items: [
      { href: "/billing", icon: DollarSign, label: "Hisob-kitob" },
    ],
  },
  {
    label: "Infratuzilma",
    items: [
      { href: "/campuses", icon: Building, label: "Kampuslar" },
      { href: "/dorms", icon: Home, label: "Yotoqxona" },
      { href: "/displays", icon: Monitor, label: "Displeylar" },
    ],
  },
  {
    label: "Tizim",
    items: [
      { href: "/users", icon: UserCog, label: "Foydalanuvchilar" },
      { href: "/roles", icon: Shield, label: "Rollar" },
      { href: "/notifications", icon: Bell, label: "Bildirishnomalar" },
      { href: "/files", icon: FolderOpen, label: "Fayllar" },
      { href: "/tenants", icon: Building2, label: "Sozlamalar" },
      { href: "/events", icon: Medal, label: "Tadbirlar" },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(navGroups.map((g) => [g.label, true]))
  )

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">MathAcademy</span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 scrollbar-thin">
          <nav className="flex flex-col gap-1 p-3">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-1">
                {!collapsed && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-foreground"
                  >
                    {group.label}
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        openGroups[group.label] ? "" : "-rotate-90"
                      )}
                    />
                  </button>
                )}
                {(collapsed || openGroups[group.label]) && (
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href)
                      const link = (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-sidebar-accent text-primary"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                          {!collapsed && <span>{item.label}</span>}
                        </Link>
                      )

                      if (collapsed) {
                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger asChild>{link}</TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        )
                      }
                      return link
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Toggle */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center text-muted-foreground hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="mr-2 h-4 w-4" />
                <span>Yopish</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
