import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StoreProductsManager from "@/components/store-products-manager"

export default async function StoreProductsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">مدیریت محصولات</h1>
        <p className="text-gray-600 mt-1">افزودن، ویرایش و حذف محصولات فروشگاه «{store.name}»</p>
      </div>
      <StoreProductsManager />
    </div>
  )
}
