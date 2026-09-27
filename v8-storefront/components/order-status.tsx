"use client"

import { useState } from "react"
import { CheckCircle2, Clock, XCircle, Upload, Loader2 } from "lucide-react"

interface Order {
  order_number: string
  total: number
  status: string
  payment_method: string | null
  payment_status: string
}

interface OrderItem {
  id: number
  product_name: string
  variant_name: string | null
  price: number
  quantity: number
}

const STATUS_META: Record<string, { label: string; icon: any; color: string }> = {
  paid: { label: "پرداخت موفق", icon: CheckCircle2, color: "text-green-600" },
  pending: { label: "در انتظار پرداخت", icon: Clock, color: "text-amber-600" },
  failed: { label: "پرداخت ناموفق", icon: XCircle, color: "text-red-600" },
}

async function uploadToPlatform(file: File): Promise<string> {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://platform-talksell.ir"
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(`${platformUrl}/api/upload-image`, { method: "POST", body: formData })
  const data = await res.json()
  if (!res.ok || !data.url) {
    throw new Error(data.error || "خطا در آپلود تصویر")
  }
  return data.url as string
}

export default function OrderStatus({
  order,
  items,
  cardInfo,
}: {
  order: Order
  items: OrderItem[]
  cardInfo: { card_number: string; card_iban: string; card_holder_name: string } | null
}) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState("")

  const statusMeta = STATUS_META[order.payment_status] || STATUS_META.pending
  const StatusIcon = statusMeta.icon

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const imageUrl = await uploadToPlatform(file)
      const res = await fetch(`/api/orders/${order.order_number}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })
      if (!res.ok) throw new Error("خطا در ثبت فیش واریزی")
      setUploaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود فیش")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container py-10 max-w-xl">
      <div className="text-center mb-8">
        <StatusIcon className={`w-14 h-14 mx-auto mb-3 ${statusMeta.color}`} />
        <h1 className="text-xl font-bold text-gray-900">{statusMeta.label}</h1>
        <p className="text-sm text-gray-500 mt-1" dir="ltr">
          {order.order_number}
        </p>
      </div>

      <div className="rounded-2xl border p-4 space-y-2 mb-6">
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
          <span>{Number(order.total).toLocaleString()} تومان</span>
        </div>
      </div>

      {order.payment_method === "card_to_card" && order.payment_status === "pending" && cardInfo && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 space-y-4">
          <p className="text-sm font-medium text-amber-900">
            مبلغ سفارش را به کارت زیر واریز کرده و تصویر فیش واریزی را آپلود کنید. سفارش شما پس از بررسی توسط فروشگاه
            تایید خواهد شد.
          </p>
          <div className="text-sm text-amber-900 space-y-1" dir="ltr">
            <p className="font-mono text-base">{cardInfo.card_number}</p>
            <p className="font-mono">{cardInfo.card_iban}</p>
          </div>
          <p className="text-sm text-amber-900" dir="rtl">
            به نام: {cardInfo.card_holder_name}
          </p>

          {uploaded ? (
            <p className="text-sm text-green-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              فیش شما ثبت شد و در انتظار بررسی است
            </p>
          ) : (
            <label className="block">
              <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} disabled={uploading} />
              <div className="rounded-xl border-2 border-amber-300 bg-white text-amber-800 text-sm text-center py-2.5 cursor-pointer">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 inline ml-1.5" />
                    آپلود فیش واریزی
                  </>
                )}
              </div>
            </label>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
