import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import OrderDetail from "@/components/order-detail"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">جزئیات سفارش</h1>
      </div>
      <OrderDetail orderId={Number(params.id)} />
    </div>
  )
}
