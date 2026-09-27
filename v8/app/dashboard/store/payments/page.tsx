import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StorePaymentSettingsForm from "@/components/store-payment-settings-form"

export default async function StorePaymentsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">تنظیمات درگاه پرداخت</h1>
        <p className="text-gray-600 mt-1">درگاه‌های فعال در صفحه پرداخت فروشگاه شما نمایش داده می‌شوند</p>
      </div>
      <StorePaymentSettingsForm />
    </div>
  )
}
