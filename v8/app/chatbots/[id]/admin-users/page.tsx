"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, EyeOff, Copy, ExternalLink, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminUser {
  id: number
  username: string
  full_name: string | null
  email: string | null
  is_active: boolean
  last_login: string | null
}

export default function AdminUsersPage() {
  const params = useParams()
  const chatbotId = params.id as string
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [chatbotId])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/admin-users`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching admin users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const url = editingUser
        ? `/api/chatbots/${chatbotId}/admin-users/${editingUser.id}`
        : `/api/chatbots/${chatbotId}/admin-users`

      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "عملیات با موفقیت انجام شد")
        fetchUsers()
        setShowDialog(false)
        resetForm()
      } else {
        setMessage(result.error || "خطا در انجام عملیات")
      }
    } catch (error) {
      console.error("Error saving admin user:", error)
      setMessage("خطا در ارتباط با سرور")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟")) return

    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/admin-users/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "کاربر با موفقیت حذف شد")
        fetchUsers()
      } else {
        setMessage(result.error || "خطا در حذف کاربر")
      }
    } catch (error) {
      console.error("Error deleting admin user:", error)
      setMessage("خطا در ارتباط با سرور")
    }
  }

  const resetForm = () => {
    setFormData({ username: "", password: "", full_name: "", email: "" })
    setEditingUser(null)
    setShowPassword(false)
  }

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: "",
      full_name: user.full_name || "",
      email: user.email || "",
    })
    setShowDialog(true)
  }

  const copyAdminUrl = () => {
    const url = `${window.location.origin}/admin-panel/${chatbotId}/login`
    navigator.clipboard.writeText(url)
    setMessage("لینک پنل ادمین کپی شد!")
  }

  const closeDialog = () => {
    setShowDialog(false)
    resetForm()
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeDialog()
    }
  }

  // Prevent form click from closing dialog
  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">مدیریت کاربران ادمین</h1>
          <p className="text-gray-600">کاربرانی که به پنل ادمین دسترسی دارند</p>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setShowDialog(true)
          }}
        >
          <Plus className="h-4 w-4 ml-2" />
          افزودن کاربر جدید
        </Button>
      </div>

      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Custom Modal with proper event handling */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            onClick={handleFormClick}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? "ویرایش کاربر ادمین" : "افزودن کاربر ادمین جدید"}
              </h2>
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">اطلاعات کاربری که به پنل ادمین دسترسی خواهد داشت را وارد کنید</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  نام کاربری *
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  required
                  className="w-full"
                  placeholder="نام کاربری را وارد کنید"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  رمز عبور {editingUser ? "(خالی بگذارید تا تغییر نکند)" : "*"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required={!editingUser}
                    className="w-full pr-10"
                    placeholder="رمز عبور را وارد کنید"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                  نام کامل
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="w-full"
                  placeholder="نام کامل را وارد کنید"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  ایمیل
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                  placeholder="ایمیل را وارد کنید"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={closeDialog} disabled={saving}>
                  انصراف
                </Button>
                <Button type="submit" disabled={saving} className="min-w-[100px]">
                  {saving ? "در حال ذخیره..." : editingUser ? "بروزرسانی" : "ایجاد"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>کاربران ادمین ({users.length})</CardTitle>
          <CardDescription>لیست کاربرانی که می‌توانند به پنل ادمین این چت‌بات دسترسی داشته باشند</CardDescription>
        </CardHeader>

        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">هیچ کاربر ادمینی تعریف نشده است</p>
              <p className="text-gray-400 text-sm mt-2">برای شروع، کاربر ادمین جدیدی ایجاد کنید</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام کاربری</TableHead>
                    <TableHead>نام کامل</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>آخرین ورود</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.full_name || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "فعال" : "غیرفعال"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? new Date(user.last_login).toLocaleDateString("fa-IR") : "هرگز"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={copyAdminUrl} title="کپی لینک پنل ادمین">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/admin-panel/${chatbotId}/login`, "_blank")}
                            title="باز کردن پنل ادمین"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(user)} title="ویرایش">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(user.id)}
                            title="حذف"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <AlertDescription>
          <strong>نحوه استفاده:</strong> بعد از ایجاد کاربر ادمین، لینک پنل ادمین را کپی کرده و برای مشتری ارسال کنید.
          <br />
          آدرس پنل ادمین: <code className="bg-gray-100 px-2 py-1 rounded text-sm">/admin-panel/{chatbotId}/login</code>
        </AlertDescription>
      </Alert>
    </div>
  )
}
