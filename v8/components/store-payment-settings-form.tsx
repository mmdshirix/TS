"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, CheckCircle2, CreditCard, Wallet, Landmark } from "lucide-react"

interface Settings {
  zarinpal_enabled: boolean
  zarinpal_merchant_id: string
  balepay_enabled: boolean
  balepay_bot_token: string
  card_to_card_enabled: boolean
  card_number: string
  card_iban: string
  card_holder_name: string
}

const EMPTY_SETTINGS: Settings = {
  zarinpal_enabled: false,
  zarinpal_merchant_id: "",
  balepay_enabled: false,
  balepay_bot_token: "",
  card_to_card_enabled: false,
  card_number: "",
  card_iban: "",
  card_holder_name: "",
}

export default function StorePaymentSettingsForm() {
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/store/payment-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            zarinpal_enabled: data.settings.zarinpal_enabled,
            zarinpal_merchant_id: data.settings.zarinpal_merchant_id || "",
            balepay_enabled: data.settings.balepay_enabled,
            balepay_bot_token: data.settings.balepay_bot_token || "",
            card_to_card_enabled: data.settings.card_to_card_enabled,
            card_number: data.settings.card_number || "",
            card_iban: data.settings.card_iban || "",
            card_holder_name: data.settings.card_holder_name || "",
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError("")
    try {
      const res = await fetch("/api/store/payment-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "خطا در ذخیره تنظیمات")
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره تنظیمات")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle>زرین‌پال</CardTitle>
              <CardDescription>پرداخت آنلاین با کارت‌های بانکی</CardDescription>
            </div>
            <Switch
              checked={settings.zarinpal_enabled}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, zarinpal_enabled: v }))}
            />
          </div>
        </CardHeader>
        {settings.zarinpal_enabled && (
          <CardContent className="space-y-2">
            <Label htmlFor="zarinpal-merchant">شناسه پذیرنده (Merchant ID)</Label>
            <Input
              id="zarinpal-merchant"
              value={settings.zarinpal_merchant_id}
              onChange={(e) => setSettings((s) => ({ ...s, zarinpal_merchant_id: e.target.value }))}
              dir="ltr"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="rounded-xl"
            />
          </CardContent>
        )}
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle>بله‌پی</CardTitle>
              <CardDescription>پرداخت با کیف‌پول بله (درون‌برنامه‌ای، هنگام باز بودن فروشگاه در اپلیکیشن بله)</CardDescription>
            </div>
            <Switch
              checked={settings.balepay_enabled}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, balepay_enabled: v }))}
            />
          </div>
        </CardHeader>
        {settings.balepay_enabled && (
          <CardContent className="space-y-2">
            <Label htmlFor="balepay-token">توکن پرداخت کیف‌پولی ربات بله</Label>
            <Input
              id="balepay-token"
              value={settings.balepay_bot_token}
              onChange={(e) => setSettings((s) => ({ ...s, balepay_bot_token: e.target.value }))}
              dir="ltr"
              placeholder="این توکن را از @botfather در بله دریافت کنید"
              className="rounded-xl"
            />
            <p className="text-xs text-gray-500">
              برای تست می‌توانید از توکن آزمایشی WALLET-TEST-1111111111111111 استفاده کنید (منجر به انتقال واقعی پول نمی‌شود).
            </p>
          </CardContent>
        )}
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle>کارت به کارت</CardTitle>
              <CardDescription>مشتری فیش واریزی آپلود می‌کند و شما به‌صورت دستی تایید می‌کنید</CardDescription>
            </div>
            <Switch
              checked={settings.card_to_card_enabled}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, card_to_card_enabled: v }))}
            />
          </div>
        </CardHeader>
        {settings.card_to_card_enabled && (
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="card-holder">نام صاحب حساب</Label>
              <Input
                id="card-holder"
                value={settings.card_holder_name}
                onChange={(e) => setSettings((s) => ({ ...s, card_holder_name: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="card-number">شماره کارت</Label>
                <Input
                  id="card-number"
                  value={settings.card_number}
                  onChange={(e) => setSettings((s) => ({ ...s, card_number: e.target.value }))}
                  dir="ltr"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-iban">شماره شبا</Label>
                <Input
                  id="card-iban"
                  value={settings.card_iban}
                  onChange={(e) => setSettings((s) => ({ ...s, card_iban: e.target.value }))}
                  dir="ltr"
                  placeholder="IRXXXXXXXXXXXXXXXXXXXXXX"
                  className="rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        )}
        <CardFooter className="flex items-center justify-between border-t pt-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> ذخیره شد
            </p>
          )}
          <div className="flex-1" />
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            ذخیره تغییرات
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
