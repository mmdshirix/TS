import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StoreSmsSettingsForm from "@/components/store-sms-settings-form"

export default async function StoreSmsSettingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const store = await getStoreByUserId(user.id)
  if (!store) {
    redirect("/dashboard/store/create")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">پنل پیامکی</h1>
        <p className="text-gray-600 mt-1">تنظیم سرویس پیامک برای تایید شماره تلفن مشتریان فروشگاه «{store.name}»</p>
      </div>
      <StoreSmsSettingsForm />
    </div>
  )
}
