import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StoreCategoriesManager from "@/components/store-categories-manager"

export default async function StoreCategoriesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">مدیریت دسته‌بندی‌ها</h1>
        <p className="text-gray-600 mt-1">افزودن و حذف دسته‌بندی‌های محصولات فروشگاه «{store.name}»</p>
      </div>
      <StoreCategoriesManager />
    </div>
  )
}
