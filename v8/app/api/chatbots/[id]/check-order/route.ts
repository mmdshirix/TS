import { type NextRequest, NextResponse } from "next/server"
import { getChatbotById } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

interface OrderCheckRequest {
  firstName: string
  lastName: string
  phone: string
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Order check API called for chatbot:", params.id)

    const body: OrderCheckRequest = await request.json()
    const { firstName, lastName, phone } = body

    console.log("[v0] Searching for order:", { firstName, lastName, phone })

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: "نام، نام خانوادگی و شماره تماس الزامی است" }, { status: 400 })
    }

    const chatbot = await getChatbotById(Number(params.id))

    if (!chatbot) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    if (!chatbot.woocommerce_orders_enabled) {
      return NextResponse.json({ error: "پیگیری سفارش فعال نیست" }, { status: 400 })
    }

    let ordersData
    if (chatbot.woocommerce_orders_data) {
      try {
        ordersData = JSON.parse(chatbot.woocommerce_orders_data)
        console.log("[v0] Using cached orders data, total:", ordersData.total_orders)
      } catch (error) {
        console.error("[v0] Failed to parse cached orders data")
      }
    }

    if (!ordersData && chatbot.woocommerce_api_url) {
      console.log("[v0] No cached data, fetching from API:", chatbot.woocommerce_api_url)
      const response = await fetch(chatbot.woocommerce_api_url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("[v0] Failed to fetch orders:", response.status)
        return NextResponse.json({ error: "خطا در دریافت اطلاعات سفارشات. لطفاً بعداً تلاش کنید." }, { status: 500 })
      }

      ordersData = await response.json()
    }

    if (!ordersData || !ordersData.orders) {
      return NextResponse.json({ error: "داده‌های سفارش یافت نشد" }, { status: 404 })
    }

    console.log("[v0] Total orders to search:", ordersData.total_orders)

    // Search for matching orders
    const matchingOrders = ordersData.orders.filter(
      (order: any) =>
        order.first_name?.trim().toLowerCase() === firstName.trim().toLowerCase() &&
        order.last_name?.trim().toLowerCase() === lastName.trim().toLowerCase() &&
        order.phone?.replace(/\s/g, "") === phone.replace(/\s/g, ""),
    )

    console.log("[v0] Found matching orders:", matchingOrders.length)

    if (matchingOrders.length === 0) {
      return NextResponse.json({ orders: [], found: false })
    }

    // Map order status to Persian
    const statusMap: Record<string, string> = {
      pending: "در انتظار پرداخت",
      processing: "در حال پردازش",
      "on-hold": "در انتظار بررسی",
      completed: "تکمیل شده",
      cancelled: "لغو شده",
      refunded: "بازگشت وجه",
      failed: "ناموفق",
    }

    const formattedOrders = matchingOrders.map((order: any) => ({
      orderId: order.order_id,
      status: statusMap[order.order_status] || order.order_status,
      statusKey: order.order_status,
      total: order.order_total,
      date: order.order_date,
      paymentMethod: order.payment_method,
    }))

    return NextResponse.json({ orders: formattedOrders, found: true })
  } catch (error) {
    console.error("[v0] Order check error:", error)
    return NextResponse.json({ error: "خطا در بررسی سفارش. لطفاً دوباره تلاش کنید." }, { status: 500 })
  }
}
