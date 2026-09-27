import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StoreBaleBotForm from "@/components/store-bale-bot-form"

export default async function BaleBotPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">اتصال ربات بله</h1>
        <p className="text-gray-600 mt-1">راه‌اندازی ربات اختصاصی فروشگاه «{store.name}» در پیام‌رسان بله</p>
      </div>
      <StoreBaleBotForm />
    </div>
  )
}
