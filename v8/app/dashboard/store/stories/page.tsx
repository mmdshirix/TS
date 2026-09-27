import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StoreStoriesManager from "@/components/store-stories-manager"

export default async function StoreStoriesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">مدیریت استوری‌ها</h1>
        <p className="text-gray-600 mt-1">استوری‌هایی که در بالای سایت «{store.name}» به‌صورت دایره‌ای نمایش داده می‌شوند</p>
      </div>
      <StoreStoriesManager />
    </div>
  )
}
