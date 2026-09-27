import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

export default async function UsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">کاربران</h1>
        <p className="text-gray-600 mt-1">مدیریت کاربران و دسترسی‌ها</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">اطلاعات کاربر</h3>
          <div className="text-gray-600 space-y-1">
            <p>
              <strong>نام:</strong> {user.first_name} {user.last_name}
            </p>
            <p>
              <strong>شماره تماس:</strong> {user.phone}
            </p>
            <p>
              <strong>وضعیت:</strong> {user.is_trial_active ? "دوره آزمایشی" : "فعال"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
