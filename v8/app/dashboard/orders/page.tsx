import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import OrdersList from "@/components/orders-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"

export default async function OrdersPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const store = await getStoreByUserId(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">سفارش‌ها</h1>
        <p className="text-gray-600 mt-1">مدیریت سفارش‌های فروشگاه شما</p>
      </div>

      {!store ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>فروشگاهی یافت نشد</CardTitle>
            <CardDescription>برای دیدن سفارش‌ها ابتدا باید فروشگاه خود را بسازید</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          </CardContent>
        </Card>
      ) : (
        <OrdersList />
      )}
    </div>
  )
}
