import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StoreAnalyticsDashboard from "@/components/store-analytics-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"
import Link from "next/link"

export default async function StoreAnalyticsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const store = await getStoreByUserId(user.id)

  if (!store) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">آمار فروشگاه</h1>
          <p className="text-gray-600 mt-1">هنوز فروشگاهی نساخته‌اید</p>
        </div>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>فروشگاهی یافت نشد</CardTitle>
            <CardDescription>برای مشاهده آمار، ابتدا باید فروشگاه خود را بسازید</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <Link href="/dashboard/store/create">
              <Button className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700">ساخت فروشگاه</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">آمار فروشگاه</h1>
        <p className="text-gray-600 mt-1">فروش، بازدیدکنندگان و پرفروش‌ترین محصولات فروشگاه شما</p>
      </div>
      <StoreAnalyticsDashboard />
    </div>
  )
}
