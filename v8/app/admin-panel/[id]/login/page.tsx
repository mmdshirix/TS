"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, User } from "lucide-react"

export default function AdminLoginPage() {
  const params = useParams()
  const router = useRouter()
  const chatbotId = params.id as string

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkSuperAdminToken = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const superAdminToken = urlParams.get("super_admin_token")

      if (superAdminToken) {
        setLoading(true)
        try {
          const response = await fetch("/api/admin-panel/super-admin-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: superAdminToken, chatbotId }),
          })

          if (response.ok) {
            const data = await response.json()
            document.cookie = `admin_session=${data.sessionToken}; path=/; max-age=86400`
            setTimeout(() => {
              router.push(`/admin-panel/${chatbotId}`)
              router.refresh()
            }, 100)
          } else {
            setError("دسترسی سوپر ادمین منقضی شده است")
            setLoading(false)
          }
        } catch (err) {
          setError("خطا در ورود خودکار")
          setLoading(false)
        }
      }
    }

    checkSuperAdminToken()
  }, [chatbotId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin-panel/${chatbotId}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        setTimeout(() => {
          router.push(`/admin-panel/${chatbotId}`)
          router.refresh()
        }, 100)
      } else {
        setError(data.error || "خطا در ورود")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("خطا در اتصال به سرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">پنل مدیریت چت‌بات</CardTitle>
          <CardDescription>برای ورود نام کاربری و رمز عبور خود را وارد کنید</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="pr-10"
                  placeholder="نام کاربری خود را وارد کنید"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="pr-10 pl-10"
                  placeholder="رمز عبور خود را وارد کنید"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "در حال ورود..." : "ورود"}
            </Button>
          </form>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
              <p className="font-medium">برای تست:</p>
              <p>نام کاربری: admin</p>
              <p>رمز عبور: 123456</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
