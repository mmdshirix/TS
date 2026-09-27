"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CreditCard, Wallet, Landmark, CheckCircle2 } from "lucide-react"
import type { CheckoutFieldSetting } from "@/lib/db"

interface Props {
  items: Array<{ id: number; product_name: string; price: number; quantity: number }>
  subtotal: number
  fields: CheckoutFieldSetting[]
  availableGateways: { zarinpal: boolean; balepay: boolean; card_to_card: boolean }
  otpEnabled: boolean
}

const GATEWAY_META = {
  zarinpal: { label: "زرین‌پال", icon: CreditCard },
  balepay: { label: "بله‌پی", icon: Wallet },
  card_to_card: { label: "کارت به کارت", icon: Landmark },
} as const

export default function CheckoutForm({ items, subtotal, fields, availableGateways, otpEnabled }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({})
  const [isBaleMiniApp, setIsBaleMiniApp] = useState(false)
  const [gateway, setGateway] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerifyToken, setOtpVerifyToken] = useState("")
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState("")

  const phone = (values.phone || "").replace(/\s|-/g, "")
  const phoneValid = /^09\d{9}$/.test(phone)

  useEffect(() => {
    // any change to the phone number invalidates a previous verification
    setOtpVerifyToken("")
    setOtpSent(false)
    setOtpCode("")
  }, [phone])

  const handleSendOtp = async () => {
    setOtpSending(true)
    setOtpError("")
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "خطا در ارسال کد تایید")
      setOtpSent(true)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "خطا در ارسال کد تایید")
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    setOtpVerifying(true)
    setOtpError("")
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "کد وارد شده نامعتبر است")
      setOtpVerifyToken(data.verifyToken)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "کد وارد شده نامعتبر است")
    } finally {
      setOtpVerifying(false)
    }
  }

  useEffect(() => {
    setIsBaleMiniApp(typeof window !== "undefined" && Boolean((window as any).Bale?.WebApp))
  }, [])

  const gatewayOptions = (Object.keys(GATEWAY_META) as Array<keyof typeof GATEWAY_META>).filter((key) => {
    if (!availableGateways[key]) return false
    if (key === "balepay") return isBaleMiniApp
    return true
  })

  useEffect(() => {
    if (!gateway && gatewayOptions.length > 0) {
      setGateway(gatewayOptions[0])
    }
  }, [gatewayOptions, gateway])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gateway) {
      setError("لطفاً روش پرداخت را انتخاب کنید")
      return
    }
    for (const field of fields) {
      if (field.required && !values[field.field_key]?.trim()) {
        setError(`لطفاً ${field.label} را وارد کنید`)
        return
      }
    }
    if (otpEnabled && !otpVerifyToken) {
      setError("لطفاً ابتدا شماره تلفن خود را با کد پیامکی تایید کنید")
      return
    }

    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerInfo: values, paymentMethod: gateway, otpVerifyToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "خطا در ثبت سفارش")
      }

      if (gateway === "zarinpal" && data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }

      if (gateway === "balepay" && data.invoiceLink) {
        const bale = (window as any).Bale?.WebApp
        if (bale?.openInvoice) {
          bale.openInvoice(data.invoiceLink, async (result: { status: string }) => {
            if (result.status === "paid") {
              await fetch("/api/payments/balepay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderNumber: data.orderNumber, transactionId: data.invoiceLink }),
              })
            }
            router.push(`/order/${data.orderNumber}`)
          })
          return
        }
      }

      if (data.orderNumber) {
        router.push(`/order/${data.orderNumber}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت سفارش")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">تکمیل خرید</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border p-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>{(Number(item.price) * item.quantity).toLocaleString()} تومان</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t font-bold text-gray-900">
            <span>جمع کل</span>
            <span>{subtotal.toLocaleString()} تومان</span>
          </div>
        </div>

        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                required={field.required}
                value={values[field.field_key] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.field_key]: e.target.value }))}
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
              />
              {otpEnabled && field.field_key === "phone" && (
                <div className="mt-2 rounded-xl border bg-gray-50 p-3 space-y-2">
                  {otpVerifyToken ? (
                    <p className="text-sm text-green-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> شماره تلفن تایید شد
                    </p>
                  ) : !otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!phoneValid || otpSending}
                      className="text-sm text-brand font-medium disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {otpSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      ارسال کد تایید پیامکی
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="کد ۵ رقمی"
                        dir="ltr"
                        className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={!otpCode.trim() || otpVerifying}
                        className="text-sm bg-brand text-white rounded-xl px-3 py-2 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {otpVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        تایید کد
                      </button>
                    </div>
                  )}
                  {otpError && <p className="text-xs text-red-600">{otpError}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">روش پرداخت</p>
          {gatewayOptions.length === 0 ? (
            <p className="text-sm text-gray-400">این فروشگاه هنوز درگاه پرداختی فعال نکرده است</p>
          ) : (
            <div className="space-y-2">
              {gatewayOptions.map((key) => {
                const meta = GATEWAY_META[key]
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${
                      gateway === key ? "border-brand bg-blue-50" : ""
                    }`}
                  >
                    <input type="radio" name="gateway" checked={gateway === key} onChange={() => setGateway(key)} />
                    <meta.icon className="w-4.5 h-4.5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-800">{meta.label}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || gatewayOptions.length === 0 || (otpEnabled && !otpVerifyToken)}
          className="w-full bg-brand text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          پرداخت و ثبت سفارش
        </button>
      </form>
    </div>
  )
}
