import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette } from "lucide-react"

export default async function AppearancePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">تنظیمات ظاهری</h1>
        <p className="text-gray-600 mt-1">شخصی‌سازی ظاهر چت‌بات‌های خود</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>رنگ‌بندی و قالب</CardTitle>
          <CardDescription>تنظیمات ظاهری برای هر چت‌بات به صورت جداگانه قابل تنظیم است</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">برای تنظیم ظاهر، به صفحه تنظیمات هر چت‌بات مراجعه کنید</p>
        </CardContent>
      </Card>
    </div>
  )
}
