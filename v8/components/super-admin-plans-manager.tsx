"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Save,
  Edit,
  X,
  Zap,
  TrendingUp,
  Crown,
  Package,
  MessageSquare,
  Users,
  Brain,
  Rocket,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"
import NextLink from "next/link"

interface SubscriptionPlan {
  id: number
  name: string
  name_en: string
  description: string
  price: number
  duration_days: number
  ai_tokens: number
  approx_conversations: number
  product_inputs: number
  response_quality: string
  crawler_speed: string
  cta_suggestions_type: string
  cta_suggestions_limit: number
  sales_advisor_limit: number
  conversation_memory: string
  ai_learning_depth: string
  suggested_questions_enabled: boolean
  ticket_system_enabled: boolean
  product_sync_enabled: boolean
  api_access_enabled: boolean
  order_tracking_enabled: boolean
  customer_return_detection_enabled: boolean
  is_popular: boolean
  is_active: boolean
}

export default function SuperAdminPlansManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/super-admin/subscription-plans")
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!editingPlan) return
    setSaving(true)

    try {
      const res = await fetch(`/api/super-admin/subscription-plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPlan),
      })

      if (res.ok) {
        await fetchPlans()
        setEditingPlan(null)
        alert("✅ تنظیمات پلن با موفقیت ذخیره شد")
      } else {
        alert("❌ خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      console.error("Error saving plan:", error)
      alert("❌ خطا در ذخیره تنظیمات")
    }

    setSaving(false)
  }

  const updateField = (field: string, value: any) => {
    if (!editingPlan) return
    setEditingPlan({ ...editingPlan, [field]: value })
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "start":
        return <Zap className="w-8 h-8" />
      case "grow":
        return <TrendingUp className="w-8 h-8" />
      case "scale":
        return <Crown className="w-8 h-8" />
      default:
        return <Zap className="w-8 h-8" />
    }
  }

  const getPlanGradient = (planName: string) => {
    switch (planName) {
      case "start":
        return "from-green-500 to-emerald-600"
      case "grow":
        return "from-blue-500 to-indigo-600"
      case "scale":
        return "from-purple-500 to-pink-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">مدیریت پلن‌های اشتراک</h1>
            <p className="text-purple-200">ویرایش محدودیت‌ها و ویژگی‌های هر پلن</p>
          </div>
          <Button asChild className="bg-white/10 hover:bg-white/20 text-white rounded-2xl">
            <NextLink href="/super-admin">
              <ArrowLeft className="w-4 h-4 ml-2" />
              بازگشت به داشبورد
            </NextLink>
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden rounded-3xl border-2 ${
                plan.is_popular ? "border-purple-400 shadow-xl shadow-purple-500/30" : "border-white/20"
              } bg-white/10 backdrop-blur-lg`}
            >
              {/* Plan Header */}
              <div className={`p-6 bg-gradient-to-r ${getPlanGradient(plan.name_en)} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      {getPlanIcon(plan.name_en)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-white/80 text-sm mt-1">{plan.name_en.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold">{plan.price.toLocaleString("fa-IR")}</div>
                    <div className="text-sm text-white/80">تومان / ماه</div>
                  </div>
                </div>

                {plan.is_popular && (
                  <Badge className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 rounded-xl">محبوب‌ترین</Badge>
                )}
              </div>

              {/* Plan Details */}
              {editingPlan?.id === plan.id ? (
                <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Token Limits */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      محدودیت‌های توکن
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-purple-200 text-xs">AI Tokens</Label>
                        <Input
                          type="number"
                          value={editingPlan.ai_tokens}
                          onChange={(e) => updateField("ai_tokens", Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200 text-xs">تعداد مکالمه تقریبی</Label>
                        <Input
                          type="number"
                          value={editingPlan.approx_conversations}
                          onChange={(e) => updateField("approx_conversations", Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature Limits */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      محدودیت‌های ویژگی
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-purple-200 text-xs">محصولات (-1=نامحدود)</Label>
                        <Input
                          type="number"
                          value={editingPlan.product_inputs}
                          onChange={(e) => updateField("product_inputs", Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200 text-xs">مشاوره فروش (-1=نامحدود)</Label>
                        <Input
                          type="number"
                          value={editingPlan.sales_advisor_limit}
                          onChange={(e) => updateField("sales_advisor_limit", Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200 text-xs">لینک CTA (-1=نامحدود)</Label>
                        <Input
                          type="number"
                          value={editingPlan.cta_suggestions_limit}
                          onChange={(e) => updateField("cta_suggestions_limit", Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200 text-xs">مدت اشتراک (روز)</Label>
                        <Input
                          type="number"
                          value={editingPlan.duration_days}
                          onChange={(e) => updateField("duration_days", Number(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quality Settings */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      کیفیت پاسخ‌دهی
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-purple-200 text-xs">کیفیت پاسخ</Label>
                        <Select
                          value={editingPlan.response_quality}
                          onValueChange={(v) => updateField("response_quality", v)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">پایه</SelectItem>
                            <SelectItem value="advanced">پیشرفته</SelectItem>
                            <SelectItem value="intelligent">هوشمند</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-purple-200 text-xs">سرعت Crawler</Label>
                        <Select
                          value={editingPlan.crawler_speed}
                          onValueChange={(v) => updateField("crawler_speed", v)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="limited">محدود</SelectItem>
                            <SelectItem value="fast">سریع</SelectItem>
                            <SelectItem value="unlimited">نامحدود</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-purple-200 text-xs">حافظه مکالمه</Label>
                        <Select
                          value={editingPlan.conversation_memory}
                          onValueChange={(v) => updateField("conversation_memory", v)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">کوتاه مدت</SelectItem>
                            <SelectItem value="medium">میان مدت</SelectItem>
                            <SelectItem value="long_term">طولانی مدت</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-purple-200 text-xs">عمق یادگیری</Label>
                        <Select
                          value={editingPlan.ai_learning_depth}
                          onValueChange={(v) => updateField("ai_learning_depth", v)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="surface">سطحی</SelectItem>
                            <SelectItem value="deep">بلند مدت</SelectItem>
                            <SelectItem value="deepest">عمیق‌ترین</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Feature Toggles */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      امکانات فعال/غیرفعال
                    </h4>
                    <div className="space-y-2">
                      <FeatureToggle
                        label="سوالات پیشنهادی مکالمه"
                        checked={editingPlan.suggested_questions_enabled}
                        onChange={(v) => updateField("suggested_questions_enabled", v)}
                      />
                      <FeatureToggle
                        label="سیستم تیکتینگ"
                        checked={editingPlan.ticket_system_enabled}
                        onChange={(v) => updateField("ticket_system_enabled", v)}
                      />
                      <FeatureToggle
                        label="همگام‌سازی محصولات (Sync)"
                        checked={editingPlan.product_sync_enabled}
                        onChange={(v) => updateField("product_sync_enabled", v)}
                      />
                      <FeatureToggle
                        label="API محصولات"
                        checked={editingPlan.api_access_enabled}
                        onChange={(v) => updateField("api_access_enabled", v)}
                      />
                      <FeatureToggle
                        label="پیگیری سفارشات"
                        checked={editingPlan.order_tracking_enabled}
                        onChange={(v) => updateField("order_tracking_enabled", v)}
                      />
                      <FeatureToggle
                        label="تشخیص مشتری برگشتی"
                        checked={editingPlan.customer_return_detection_enabled}
                        onChange={(v) => updateField("customer_return_detection_enabled", v)}
                      />
                    </div>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </Button>
                    <Button
                      onClick={() => setEditingPlan(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatItem icon={<Zap />} label="AI Tokens" value={plan.ai_tokens.toLocaleString("fa-IR")} />
                    <StatItem
                      icon={<MessageSquare />}
                      label="مکالمه"
                      value={`~${plan.approx_conversations.toLocaleString("fa-IR")}`}
                    />
                    <StatItem
                      icon={<Package />}
                      label="محصول"
                      value={plan.product_inputs === -1 ? "نامحدود" : plan.product_inputs.toString()}
                    />
                    <StatItem
                      icon={<Users />}
                      label="مشاوره"
                      value={plan.sales_advisor_limit === -1 ? "نامحدود" : plan.sales_advisor_limit.toString()}
                    />
                  </div>

                  {/* Feature Status */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <FeatureStatus label="تیکتینگ" enabled={plan.ticket_system_enabled} />
                    <FeatureStatus label="همگام‌سازی" enabled={plan.product_sync_enabled} />
                    <FeatureStatus label="API" enabled={plan.api_access_enabled} />
                    <FeatureStatus label="پیگیری سفارش" enabled={plan.order_tracking_enabled} />
                  </div>

                  {/* Edit Button */}
                  <Button
                    onClick={() => setEditingPlan(plan)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl mt-4"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    ویرایش پلن
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper Components
function FeatureToggle({
  label,
  checked,
  onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
      <span className="text-purple-200 text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl">
      <div className="text-purple-300">{icon}</div>
      <div>
        <div className="text-xs text-purple-300">{label}</div>
        <div className="text-white font-semibold">{value}</div>
      </div>
    </div>
  )
}

function FeatureStatus({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-purple-200">{label}</span>
      {enabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
    </div>
  )
}
