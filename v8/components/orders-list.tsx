"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ClipboardList } from "lucide-react"

interface Order {
  id: number
  order_number: string
  customer_info: Record<string, any>
  total: number
  status: string
  payment_status: string
  payment_method: string | null
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
}

const PAYMENT_STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "در انتظار", variant: "secondary" },
  paid: { label: "پرداخت‌شده", variant: "default" },
  failed: { label: "ناموفق", variant: "destructive" },
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/store/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-16 text-center text-gray-500">
          <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          هنوز سفارشی ثبت نشده است
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const paymentInfo = PAYMENT_STATUS_LABELS[order.payment_status] || PAYMENT_STATUS_LABELS.pending
        return (
          <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
            <Card className="rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium text-gray-900" dir="ltr">
                    {order.order_number}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{order.customer_info?.full_name || "—"}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{STATUS_LABELS[order.status] || order.status}</Badge>
                  <Badge variant={paymentInfo.variant}>{paymentInfo.label}</Badge>
                </div>
                <p className="font-bold text-gray-900">{Number(order.total).toLocaleString()} تومان</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
