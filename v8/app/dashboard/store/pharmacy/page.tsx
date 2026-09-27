import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import PharmacyManager from "@/components/pharmacy-manager"

export const dynamic = "force-dynamic"

export default async function PharmacyPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const store = await getStoreByUserId(user.id)
  if (!store) redirect("/dashboard/store/create")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">مدیریت داروخانه</h1>
        <p className="text-gray-600 mt-1">نسخه‌های ارسالی مشتریان، وضعیت آماده‌سازی و تنظیمات داروخانه آنلاین</p>
      </div>
      <PharmacyManager storeSlug={store.slug} />
    </div>
  )
}
