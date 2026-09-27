import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import ClinicManager from "@/components/clinic-manager"

export const dynamic = "force-dynamic"

export default async function ClinicPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const store = await getStoreByUserId(user.id)
  if (!store) redirect("/dashboard/store/create")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">مدیریت مطب و نوبت‌ها</h1>
        <p className="text-gray-600 mt-1">پزشکان، برنامه هفتگی، نوبت‌های رزروشده و تنظیمات نوبت‌دهی آنلاین</p>
      </div>
      <ClinicManager storeSlug={store.slug} />
    </div>
  )
}
