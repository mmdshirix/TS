"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  MessageSquare,
  Ticket,
  Bot,
  LogOut,
  Trash2,
  Power,
  Calendar,
  Phone,
  User,
  ExternalLink,
  Search,
  Crown,
  ChevronDown,
  ChevronUp,
  Package,
  Edit,
  AlertCircle,
  LogIn,
  Cpu,
} from "lucide-react"
import { superAdminLogout, toggleUserStatus, deleteUser, createImpersonationSession } from "@/lib/super-admin"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SuperAdminDashboard({ users: initialUsers }: { users: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [orphanedChatbots, setOrphanedChatbots] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<any>(null)
  const [loading, setLoading] = useState<number | null>(null)
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<number | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    superAdminLogout()
    router.push("/login")
  }

  const filteredUsers = users.filter(
    (user) =>
      user.first_name?.includes(searchTerm) || user.last_name?.includes(searchTerm) || user.phone?.includes(searchTerm),
  )

  useEffect(() => {
    fetchUsersData()
    fetchPlans()
  }, [])

  const fetchUsersData = async () => {
    try {
      const res = await fetch("/api/super-admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setOrphanedChatbots(data.orphanedChatbots || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/super-admin/plans")
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    }
  }

  const handleChangePlan = async (userId: number, planId: number) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/super-admin/users/${userId}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })
      if (res.ok) {
        router.refresh()
        setShowPlanModal(false)
        setSelectedUserForPlan(null)
      }
    } catch (error) {
      console.error("Error changing plan:", error)
    }
    setLoading(null)
  }

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setLoading(userId)
    await toggleUserStatus(userId, !currentStatus)
    setLoading(null)
    router.refresh()
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟ تمام داده‌های کاربر حذف خواهد شد.")) return
    setLoading(userId)
    await deleteUser(userId)
    setLoading(null)
    router.refresh()
  }

  const handleImpersonate = async (userId: number) => {
    setLoading(userId)
    const sessionToken = await createImpersonationSession(userId)
    document.cookie = `session_token=${sessionToken}; path=/; max-age=${30 * 24 * 60 * 60}`
    window.location.href = "/dashboard"
  }

  const handleToggleChatbot = async (chatbotId: number, currentStatus: boolean) => {
    setLoading(chatbotId)
    try {
      const res = await fetch(`/api/super-admin/chatbots/${chatbotId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling chatbot:", error)
    }
    setLoading(null)
  }

  const handleDeleteChatbot = async (chatbotId: number) => {
    if (!confirm("آیا از حذف این چت‌بات اطمینان دارید؟ تمام داده‌های مرتبط حذف خواهد شد.")) return
    setLoading(chatbotId)
    try {
      const res = await fetch(`/api/super-admin/chatbots/${chatbotId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting chatbot:", error)
    }
    setLoading(null)
  }

  const handleLoginToChatbot = async (chatbotId: number) => {
    setLoading(chatbotId)
    try {
      const res = await fetch(`/api/super-admin/chatbot-login/${chatbotId}`)
      if (res.ok) {
        const data = await res.json()
        // Open admin panel in new tab
        window.open(data.adminUrl, "_blank")
      } else {
        alert("خطا در ایجاد لینک ورود")
      }
    } catch (error) {
      console.error("Error generating login link:", error)
      alert("خطا در ایجاد لینک ورود")
    }
    setLoading(null)
  }

  const getSubscriptionBadge = (user: any) => {
    const now = new Date()
    const trialEnd = user.trial_end_date ? new Date(user.trial_end_date) : null
    const isExpired = trialEnd && now > trialEnd

    if (isExpired) {
      return <Badge className="bg-red-500 text-white rounded-xl">اشتراک منقضی</Badge>
    }

    if (user.subscription_status === "trial") {
      const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
      return <Badge className="bg-blue-500 text-white rounded-xl">آزمایشی ({daysLeft} روز باقی‌مانده)</Badge>
    }

    if (user.subscription_status === "active") {
      return <Badge className="bg-green-500 text-white rounded-xl">فعال</Badge>
    }

    return <Badge className="bg-gray-500 text-white rounded-xl">نامشخص</Badge>
  }

  const totalStats = {
    totalUsers: users.length,
    totalChatbots: users.reduce((sum, u) => sum + Number.parseInt(u.chatbot_count || 0), 0),
    totalMessages: users.reduce((sum, u) => sum + Number.parseInt(u.message_count || 0), 0),
    totalTickets: users.reduce((sum, u) => sum + Number.parseInt(u.ticket_count || 0), 0),
    activeUsers: users.filter((u) => u.is_trial_active).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {showPlanModal && selectedUserForPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">انتخاب پلن اشتراک</h2>
              <Button
                onClick={() => {
                  setShowPlanModal(false)
                  setSelectedUserForPlan(null)
                }}
                className="bg-red-500 hover:bg-red-600 rounded-xl"
              >
                بستن
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`p-6 bg-white/5 backdrop-blur-lg border-white/20 rounded-3xl cursor-pointer hover:bg-white/10 transition-all ${
                    plan.is_popular ? "border-2 border-purple-500" : ""
                  }`}
                  onClick={() => handleChangePlan(selectedUserForPlan, plan.id)}
                >
                  {plan.is_popular && <Badge className="mb-3 bg-purple-500 text-white rounded-xl">محبوب‌ترین</Badge>}
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-purple-200 text-sm mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-white mb-4">
                    {plan.price === -1 || plan.price === 0 ? (
                      <span className="text-xl">تماس با فروش</span>
                    ) : (
                      <>
                        {plan.price.toLocaleString("fa-IR")}
                        <span className="text-sm text-purple-300 mr-2">تومان</span>
                      </>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-purple-200">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {plan.message_limit === -1 ? "نامحدود" : plan.message_limit.toLocaleString("fa-IR")} پیام
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>{plan.product_limit === -1 ? "نامحدود" : plan.product_limit} محصول</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{plan.duration_days} روز</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">پنل مدیریت کل سیستم</h1>
              <p className="text-purple-200">مدیریت کاربران و چت‌بات‌ها</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/super-admin/ai-settings">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl">
                <Cpu className="w-4 h-4 ml-2" />
                تنظیمات AI
              </Button>
            </Link>
            <Link href="/super-admin/plans">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl">
                <Package className="w-4 h-4 ml-2" />
                مدیریت پلن‌ها
              </Button>
            </Link>
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl">
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-purple-200">کل کاربران</p>
                <p className="text-2xl font-bold text-white">{totalStats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <Power className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-purple-200">کاربران فعال</p>
                <p className="text-2xl font-bold text-white">{totalStats.activeUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-200">چت‌بات‌ها</p>
                <p className="text-2xl font-bold text-white">{totalStats.totalChatbots}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-purple-200">پیام‌ها</p>
                <p className="text-2xl font-bold text-white">{totalStats.totalMessages.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-purple-200">تیکت‌ها</p>
                <p className="text-2xl font-bold text-white">{totalStats.totalTickets}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-4 w-5 h-5 text-purple-300" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی کاربر (نام، نام خانوادگی، شماره تلفن)..."
              className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-2xl py-6"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-6 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    {user.first_name?.[0]}
                    {user.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-purple-200 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {user.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.is_trial_active ? (
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                  )}
                </div>
              </div>

              <div className="mb-4">{getSubscriptionBadge(user)}</div>

              <Button
                onClick={() => {
                  setSelectedUserForPlan(user.id)
                  setShowPlanModal(true)
                }}
                className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
              >
                <Edit className="w-4 h-4 ml-2" />
                تغییر پلن اشتراک
              </Button>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-white/5 rounded-xl p-2">
                  <Bot className="w-4 h-4 text-purple-300 mx-auto mb-1" />
                  <p className="text-xs text-purple-200">چت‌بات</p>
                  <p className="text-sm font-bold text-white">{user.chatbot_count}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <MessageSquare className="w-4 h-4 text-pink-300 mx-auto mb-1" />
                  <p className="text-xs text-purple-200">پیام</p>
                  <p className="text-sm font-bold text-white">{user.message_count}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <Ticket className="w-4 h-4 text-yellow-300 mx-auto mb-1" />
                  <p className="text-xs text-purple-200">تیکت</p>
                  <p className="text-sm font-bold text-white">{user.ticket_count}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-purple-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>تاریخ عضویت: {new Date(user.created_at).toLocaleDateString("fa-IR")}</span>
                </div>
                {user.last_login && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>آخرین ورود: {new Date(user.last_login).toLocaleDateString("fa-IR")}</span>
                  </div>
                )}
              </div>

              {user.chatbots && user.chatbots.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    className="w-full flex items-center justify-between text-white hover:bg-white/10 rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      چت‌بات‌ها ({user.chatbots.length})
                    </span>
                    {expandedUser === user.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {expandedUser === user.id && (
                    <div className="mt-3 space-y-2">
                      {user.chatbots.map((chatbot: any) => (
                        <div key={chatbot.id} className="bg-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-purple-300" />
                              <span className="text-sm text-white font-medium">{chatbot.name}</span>
                            </div>
                            {chatbot.is_active ? (
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleLoginToChatbot(chatbot.id)}
                              disabled={loading === chatbot.id}
                              size="sm"
                              className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs"
                            >
                              <LogIn className="w-3 h-3 ml-1" />
                              ورود به پنل
                            </Button>
                            <Button
                              onClick={() => handleToggleChatbot(chatbot.id, chatbot.is_active)}
                              disabled={loading === chatbot.id}
                              size="sm"
                              className={`flex-1 rounded-xl text-xs ${
                                chatbot.is_active
                                  ? "bg-orange-500 hover:bg-orange-600"
                                  : "bg-green-500 hover:bg-green-600"
                              }`}
                            >
                              <Power className="w-3 h-3 ml-1" />
                              {chatbot.is_active ? "غیرفعال" : "فعال"}
                            </Button>
                            <Button
                              onClick={() => handleDeleteChatbot(chatbot.id)}
                              disabled={loading === chatbot.id}
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 rounded-xl text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleImpersonate(user.id)}
                  disabled={loading === user.id}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm"
                >
                  <ExternalLink className="w-4 h-4 ml-1" />
                  ورود به پنل
                </Button>
                <Button
                  onClick={() => handleToggleStatus(user.id, user.is_trial_active)}
                  disabled={loading === user.id}
                  className={`rounded-xl ${user.is_trial_active ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}`}
                >
                  <Power className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={loading === user.id}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {orphanedChatbots.length > 0 && (
          <Card className="mt-8 p-6 bg-red-900/20 backdrop-blur-lg border-red-500/30 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">چت‌بات‌های بدون کاربر ({orphanedChatbots.length})</h2>
            </div>
            <p className="text-purple-200 mb-6">
              این چت‌بات‌ها به هیچ کاربری متصل نیستند و ممکن است در نتیجه حذف کاربران یا خطاهای سیستمی ایجاد شده باشند.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orphanedChatbots.map((chatbot: any) => (
                <div key={chatbot.id} className="bg-white/5 backdrop-blur-lg border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-red-400" />
                      <span className="text-white font-medium">{chatbot.name}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${chatbot.is_active ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-300 mb-4">
                    <span>شناسه: {chatbot.id}</span>
                    <span>•</span>
                    <span>{new Date(chatbot.created_at).toLocaleDateString("fa-IR")}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Button
                      onClick={() => handleLoginToChatbot(chatbot.id)}
                      disabled={loading === chatbot.id}
                      size="sm"
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl text-xs"
                    >
                      <LogIn className="w-3 h-3 ml-1" />
                      ورود به پنل ادمین
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggleChatbot(chatbot.id, chatbot.is_active)}
                      disabled={loading === chatbot.id}
                      size="sm"
                      className={`flex-1 rounded-xl text-xs ${
                        chatbot.is_active ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      <Power className="w-3 h-3 ml-1" />
                      {chatbot.is_active ? "غیرفعال" : "فعال"}
                    </Button>
                    <Button
                      onClick={() => handleDeleteChatbot(chatbot.id)}
                      disabled={loading === chatbot.id}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 rounded-xl text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {filteredUsers.length === 0 && (
          <Card className="p-12 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl text-center">
            <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-xl text-white">کاربری یافت نشد</p>
            <p className="text-purple-200 mt-2">عبارت جستجوی خود را تغییر دهید</p>
          </Card>
        )}
      </div>
    </div>
  )
}
