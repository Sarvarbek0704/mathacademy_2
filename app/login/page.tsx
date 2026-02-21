"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/lib/hooks"
import { setCredentials } from "@/features/auth/authSlice"
import { useStaffLoginMutation, useGuardianLoginMutation } from "@/features/auth/authApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, GraduationCap, Loader2, ShieldCheck, Users } from "lucide-react"
import { toast } from "sonner"

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data: { message?: string } }).data
    if (data?.message) {
      const messages: Record<string, string> = {
        INVALID_CREDENTIALS: "Login yoki parol noto'g'ri",
        ACCOUNT_LOCKED: "Hisob bloklangan. Administrator bilan bog'laning",
        ACCOUNT_DISABLED: "Hisob o'chirilgan",
        TOO_MANY_ATTEMPTS: "Juda ko'p urinish. Biroz kutib, qaytadan urinib ko'ring",
      }
      return messages[data.message] || data.message
    }
  }
  return "Tizimda xatolik yuz berdi. Qaytadan urinib ko'ring"
}

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [staffLogin, { isLoading: staffLoading }] = useStaffLoginMutation()
  const [guardianLogin, { isLoading: guardianLoading }] = useGuardianLoginMutation()

  const [staffForm, setStaffForm] = useState({ username: "", password: "" })
  const [guardianForm, setGuardianForm] = useState({ studentId: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showGuardianPassword, setShowGuardianPassword] = useState(false)

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffForm.username || !staffForm.password) {
      toast.error("Login va parolni kiriting")
      return
    }
    try {
      const result = await staffLogin(staffForm).unwrap()
      dispatch(setCredentials(result))
      toast.success("Tizimga muvaffaqiyatli kirdingiz")
      router.push("/")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleGuardianLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guardianForm.studentId || !guardianForm.password) {
      toast.error("O'quvchi ID va parolni kiriting")
      return
    }
    try {
      const result = await guardianLogin(guardianForm).unwrap()
      dispatch(setCredentials(result))
      toast.success("Tizimga muvaffaqiyatli kirdingiz")
      router.push("/guardian")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isLoading = staffLoading || guardianLoading

  return (
    <div className="flex min-h-screen">
      {/* Left side - decorative */}
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary-foreground">MathAcademy</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-primary-foreground text-balance">
            Digital Campus boshqaruv tizimi
          </h1>
          <p className="mt-4 max-w-md text-lg text-primary-foreground/70">
            O'quvchilar, o'qituvchilar, darslar, baholar va moliyaviy hisobotlarni bitta platformada boshqaring.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">
          &copy; {new Date().getFullYear()} MathAcademy. Barcha huquqlar himoyalangan.
        </p>
      </div>

      {/* Right side - login form */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">MathAcademy</h1>
            <p className="mt-1 text-muted-foreground">Digital Campus</p>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="pb-4">
              <h2 className="text-2xl font-bold text-foreground">Kirish</h2>
              <p className="text-sm text-muted-foreground">
                Tizimga kirish uchun ma'lumotlaringizni kiriting
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="staff" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2">
                  <TabsTrigger value="staff" className="gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Xodim
                  </TabsTrigger>
                  <TabsTrigger value="guardian" className="gap-2">
                    <Users className="h-4 w-4" />
                    Ota-ona
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="staff">
                  <form onSubmit={handleStaffLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="username">Login</Label>
                      <Input
                        id="username"
                        placeholder="admin"
                        value={staffForm.username}
                        onChange={(e) =>
                          setStaffForm((p) => ({ ...p, username: e.target.value }))
                        }
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="staff-password">Parol</Label>
                      <div className="relative">
                        <Input
                          id="staff-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Parolingizni kiriting"
                          value={staffForm.password}
                          onChange={(e) =>
                            setStaffForm((p) => ({ ...p, password: e.target.value }))
                          }
                          disabled={isLoading}
                          autoComplete="current-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                      {staffLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Kirish
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="guardian">
                  <form onSubmit={handleGuardianLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="studentId">{"O'quvchi ID"}</Label>
                      <Input
                        id="studentId"
                        placeholder="O'quvchi ID raqamini kiriting"
                        value={guardianForm.studentId}
                        onChange={(e) =>
                          setGuardianForm((p) => ({ ...p, studentId: e.target.value }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="guardian-password">Parol</Label>
                      <div className="relative">
                        <Input
                          id="guardian-password"
                          type={showGuardianPassword ? "text" : "password"}
                          placeholder="Parolingizni kiriting"
                          value={guardianForm.password}
                          onChange={(e) =>
                            setGuardianForm((p) => ({ ...p, password: e.target.value }))
                          }
                          disabled={isLoading}
                          autoComplete="current-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGuardianPassword(!showGuardianPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showGuardianPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                      {guardianLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Kirish
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
