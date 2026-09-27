"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Save, X, Crown, Package, MessageSquare, Clock, Zap, Gift } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SubscriptionPlansManager({ plans: initialPlans }: { plans: any[] }) {
  const [plans, setPlans] = useState(initialPlans)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [trialDays, setTrialDays] = useState(7)
  const [showTrialSettings, setShowTrialSettings] = useState(false)
  const router = useRouter()

  const iconMap: Record<string, any> = {
    Gift,
    Zap,
    Crown,
    Package,
  }

  const newPlanTemplate = {
    name: "پلن جدید",
    description: "توضیحات پلن",
    price: 0,
    billing_period: "monthly",
    message_limit: 100,
    product_limit: 10,
    duration_days: 30,
    response_speed: "normal",
    is_popular: false,
    is_active: true,
    position: plans.length + 1,
    features: ["ویژگی 1", "ویژگی 2"],
    icon_name: "Gift",
    color: "purple",
    messages_per_month: 100,
    products_total: 10,
    knowledge_base_links_total: 5,
    tickets_per_month: 10,
    chatbots_total: 1,
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/super-admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlanTemplate),
      })
      if (res.ok) {
        router.refresh()
        setIsCreating(false)
      }
    } catch (error) {
      console.error("Error creating plan:", error)
    }
    setLoading(false)
  }

  const handleUpdate = async (plan: any) => {
    setLoading(true)
    try {
      console.log("[v0] Saving plan:", plan)

      const res = await fetch(`/api/super-admin/plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      })

      if (!res.ok) {
        const error = await res.json()
        console.error("[v0] Error response:", error)
        alert(`خطا در ذخیره: ${error.error || "خطای ناشناخته"}`)
        setLoading(false)
        return
      }

      const result = await res.json()
      console.log("[v0] Plan saved successfully:", result)
      alert("✅ تنظیمات با موفقیت ذخیره شد")
      router.refresh()
      setEditingPlan(null)
    } catch (error) {
      console.error("[v0] Error updating plan:", error)
      alert("خطا در ذخیره تنظیمات")
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این پلن اطمینان دارید؟")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/super-admin/plans/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
    }
    setLoading(false)
  }

  const updateEditingField = (field: string, value: any) => {
    setEditingPlan({ ...editingPlan, [field]: value })
  }

  const addFeature = () => {
    setEditingPlan({
      ...editingPlan,
      features: [...(editingPlan.features || []), "ویژگی جدید"],
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...editingPlan.features]
    newFeatures[index] = value
    setEditingPlan({ ...editingPlan, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_: any, i: number) => i !== index),
    })
  }

  const handleSaveTrialSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/super-admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting_key: "free_trial_days", setting_value: trialDays.toString() }),
      })
      if (res.ok) {
        alert("✅ تنظیمات دوره آزمایشی ذخیره شد")
        setShowTrialSettings(false)
      }
    } catch (error) {
      console.error("Error saving trial settings:", error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">مدیریت پلن‌های اشتراک</h1>
            <p className="text-purple-200">ایجاد و ویرایش پلن‌های اشتراک سیستم</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowTrialSettings(!showTrialSettings)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl"
            >
              <Clock className="w-4 h-4 ml-2" />
              تنظیمات دوره آزمایشی
            </Button>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl"
            >
              <Plus className="w-4 h-4 ml-2" />
              پلن جدید
            </Button>
          </div>
        </div>

        {showTrialSettings && (
          <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">تنظیمات دوره آزمایشی رایگان</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-purple-200 mb-2 block">مدت دوره آزمایشی (روز)</Label>
                <Input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number.parseInt(e.target.value) || 7)}
                  className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                  placeholder="7"
                />
              </div>
              <Button
                onClick={handleSaveTrialSettings}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white rounded-xl mt-6"
              >
                <Save className="w-4 h-4 ml-2" />
                ذخیره
              </Button>
            </div>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = iconMap[plan.icon_name] || Gift
            const isEditing = editingPlan?.id === plan.id

            if (isEditing) {
              return (
                <Card key={plan.id} className="p-6 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-purple-200">نام پلن</Label>
                      <Input
                        value={editingPlan.name}
                        onChange={(e) => updateEditingField("name", e.target.value)}
                        className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                      />
                    </div>

                    <div>
                      <Label className="text-purple-200">توضیحات</Label>
                      <Textarea
                        value={editingPlan.description}
                        onChange={(e) => updateEditingField("description", e.target.value)}
                        className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-purple-200">قیمت (تومان)</Label>
                        <Input
                          type="number"
                          value={editingPlan.price}
                          onChange={(e) => updateEditingField("price", Number.parseFloat(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">مدت (روز)</Label>
                        <Input
                          type="number"
                          value={editingPlan.duration_days}
                          onChange={(e) => updateEditingField("duration_days", Number.parseInt(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-purple-200">محدودیت پیام</Label>
                        <Input
                          type="number"
                          value={editingPlan.message_limit}
                          onChange={(e) => updateEditingField("message_limit", Number.parseInt(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                          placeholder="-1 = نامحدود"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">محدودیت محصول</Label>
                        <Input
                          type="number"
                          value={editingPlan.product_limit}
                          onChange={(e) => updateEditingField("product_limit", Number.parseInt(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                          placeholder="-1 = نامحدود"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-4">
                      <h4 className="text-purple-200 font-semibold mb-3">محدودیت‌های عددی</h4>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label className="text-purple-200 text-xs">پیام/ماه</Label>
                          <Input
                            type="number"
                            value={editingPlan.messages_per_month}
                            onChange={(e) => updateEditingField("messages_per_month", Number.parseInt(e.target.value))}
                            className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                            placeholder="-1 = نامحدود"
                          />
                        </div>
                        <div>
                          <Label className="text-purple-200 text-xs">محصول کل</Label>
                          <Input
                            type="number"
                            value={editingPlan.products_total}
                            onChange={(e) => updateEditingField("products_total", Number.parseInt(e.target.value))}
                            className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                            placeholder="-1 = نامحدود"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label className="text-purple-200 text-xs">لینک دانش کل</Label>
                          <Input
                            type="number"
                            value={editingPlan.knowledge_base_links_total}
                            onChange={(e) =>
                              updateEditingField("knowledge_base_links_total", Number.parseInt(e.target.value))
                            }
                            className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                            placeholder="-1 = نامحدود"
                          />
                        </div>
                        <div>
                          <Label className="text-purple-200 text-xs">تیکت/ماه</Label>
                          <Input
                            type="number"
                            value={editingPlan.tickets_per_month}
                            onChange={(e) => updateEditingField("tickets_per_month", Number.parseInt(e.target.value))}
                            className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                            placeholder="-1 = نامحدود"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-purple-200 text-xs">چت‌بات کل</Label>
                        <Input
                          type="number"
                          value={editingPlan.chatbots_total}
                          onChange={(e) => updateEditingField("chatbots_total", Number.parseInt(e.target.value))}
                          className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20"
                          placeholder="-1 = نامحدود"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-purple-200 mb-2 block">ویژگی‌ها</Label>
                      {editingPlan.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="bg-white/10 border-white/20 text-white rounded-xl dark:bg-white/10 dark:text-white dark:border-white/20 flex-1"
                          />
                          <Button
                            onClick={() => removeFeature(index)}
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 rounded-xl"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={addFeature}
                        size="sm"
                        className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl mt-2 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        افزودن ویژگی
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-purple-200">محبوب</Label>
                      <Switch
                        checked={editingPlan.is_popular}
                        onCheckedChange={(checked) => updateEditingField("is_popular", checked)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdate(editingPlan)}
                        disabled={loading}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl dark:bg-green-500 dark:hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 ml-2" />
                        ذخیره
                      </Button>
                      <Button
                        onClick={() => setEditingPlan(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl dark:bg-gray-500 dark:hover:bg-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            }

            return (
              <Card
                key={plan.id}
                className={`p-6 bg-white/10 backdrop-blur-lg border-2 rounded-3xl relative ${
                  plan.is_popular ? "border-purple-400 shadow-xl shadow-purple-500/20" : "border-white/20"
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-1">
                      محبوب‌ترین
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingPlan(plan)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 rounded-xl dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(plan.id)}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 rounded-xl dark:bg-red-500 dark:hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-purple-200 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {plan.price === 0 ? "رایگان" : plan.price.toLocaleString()}
                    </span>
                    {plan.price > 0 && <span className="text-purple-200">تومان/ماه</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-purple-100">
                    <MessageSquare className="w-5 h-5 text-purple-300" />
                    <span className="text-sm">
                      {plan.message_limit === -1 ? "پیام نامحدود" : `${plan.message_limit} پیام در ماه`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-100">
                    <Package className="w-5 h-5 text-purple-300" />
                    <span className="text-sm">
                      {plan.product_limit === -1 ? "محصول نامحدود" : `${plan.product_limit} محصول`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-100">
                    <Clock className="w-5 h-5 text-purple-300" />
                    <span className="text-sm">
                      سرعت پاسخ:{" "}
                      {plan.response_speed === "fast" ? "سریع" : plan.response_speed === "normal" ? "عادی" : "کند"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  {plan.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-purple-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>

        {plans.length === 0 && (
          <Card className="p-12 bg-white/10 backdrop-blur-lg border-white/20 rounded-3xl text-center">
            <Crown className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-xl text-white">هنوز پلنی ایجاد نشده</p>
            <p className="text-purple-200 mt-2">برای شروع، پلن اول را ایجاد کنید</p>
          </Card>
        )}
      </div>
    </div>
  )
}
