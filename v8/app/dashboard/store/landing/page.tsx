import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import LandingPageBuilder from "@/components/landing-page-builder"

export default async function StoreLandingPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">ویرایش لندینگ</h1>
        <p className="text-gray-600 mt-1">
          بلاک‌های صفحه اصلی فروشگاه «{store.name}» را با کشیدن و رها کردن مرتب و ویرایش کنید
        </p>
      </div>
      <LandingPageBuilder />
    </div>
  )
}
