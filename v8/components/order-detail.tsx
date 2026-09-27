"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "در انتظار پرداخت" },
  { value: "processing", label: "در حال پردازش" },
  { value: "shipped", label: "ارسال شده" },
  { value: "completed", label: "تکمیل شده" },
  { value: "cancelled", label: "لغو شده" },
]

const GATEWAY_LABELS: Record<string, string> = {
  zarinpal: "زرین‌پال",
  balepay: "بله‌پی",
  card_to_card: "کارت به کارت",
}

export default function OrderDetail({ orderId }: { orderId: number }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/store/orders/${orderId}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [orderId])

  const handleStatusChange = async (status: string) => {
    setUpdating(true)
    await fetch(`/api/store/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    await load()
    setUpdating(false)
  }

  const handleReview = async (approve: boolean) => {
    setUpdating(true)
    await fetch(`/api/store/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardToCardReview: approve ? "approve" : "reject" }),
    })
    await load()
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data?.order) {
    return <p className="text-gray-500">سفارش یافت نشد</p>
  }

  const { order, items, transactions } = data
  const pendingReceipt = transactions?.find((t: any) => t.gateway === "card_to_card" && t.status === "initiated")

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowRight className="w-4 h-4" />
        بازگشت به سفارش‌ها
      </Link>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle dir="ltr">{order.order_number}</CardTitle>
            <Badge>{GATEWAY_LABELS[order.payment_method] || order.payment_method || "—"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">اطلاعات مشتری</p>
            <div className="text-sm text-gray-600 space-y-1">
              {Object.entries(order.customer_info || {}).map(([key, value]) => (
                <p key={key}>{String(value)}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">اقلام سفارش</p>
            <div className="space-y-2">
              {items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-sm border rounded-xl p-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.variant_name && <p className="text-gray-500">{item.variant_name}</p>}
                  </div>
                  <p className="text-gray-600">
                    {item.quantity} × {Number(item.price).toLocaleString()} تومان
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-gray-500">جمع کل</span>
            <span className="font-bold text-gray-900">{Number(order.total).toLocaleString()} تومان</span>
          </div>

          {pendingReceipt?.receipt_image_url && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">فیش واریزی</p>
              <img src={pendingReceipt.receipt_image_url || "/placeholder.svg"} alt="فیش واریزی" className="rounded-xl border max-w-xs" />
              <div className="flex gap-2 mt-3">
                <Button onClick={() => handleReview(true)} disabled={updating} size="sm" className="rounded-lg gap-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تایید پرداخت
                </Button>
                <Button onClick={() => handleReview(false)} disabled={updating} size="sm" variant="outline" className="rounded-lg gap-1 text-red-600">
                  <XCircle className="w-3.5 h-3.5" />
                  رد کردن
                </Button>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">وضعیت سفارش</p>
            <Select value={order.status} onValueChange={handleStatusChange} disabled={updating}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
