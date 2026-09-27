import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StorePublishPreview from "@/components/store-publish-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"
import Link from "next/link"

export default async function StorePublishPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const store = await getStoreByUserId(user.id)

  if (!store) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">انتشار و پیش‌نمایش</h1>
          <p className="text-gray-600 mt-1">هنوز فروشگاهی نساخته‌اید</p>
        </div>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>فروشگاهی یافت نشد</CardTitle>
            <CardDescription>برای انتشار فروشگاه، ابتدا باید آن را بسازید</CardDescription>
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

  const storefrontBaseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://tsll.ir"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">انتشار و پیش‌نمایش</h1>
        <p className="text-gray-600 mt-1">فروشگاه خود را منتشر کنید و پیش‌نمایش زنده آن را مشاهده کنید</p>
      </div>
      <StorePublishPreview store={store} storefrontBaseUrl={storefrontBaseUrl} />
    </div>
  )
}
