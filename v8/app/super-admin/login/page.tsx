"use client"

import type React from "react"

import { useState } from "react"
import { superAdminLogin } from "@/lib/super-admin"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Lock, Shield } from "lucide-react"

export default function SuperAdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await superAdminLogin(password)

    if (result.success) {
      router.push("/super-admin")
    } else {
      setError(result.error || "خطا در ورود")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">پنل مدیریت</h1>
          <p className="text-purple-200">ورود به پنل سوپر ادمین</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-5 h-5 text-purple-300" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-2xl"
                placeholder="رمز عبور را وارد کنید"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 rounded-2xl"
          >
            {loading ? "در حال ورود..." : "ورود به پنل"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
