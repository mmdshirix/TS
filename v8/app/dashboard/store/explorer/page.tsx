import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StoreExplorerManager from "@/components/store-explorer-manager"

export default async function StoreExplorerPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">مدیریت اکسپلور</h1>
        <p className="text-gray-600 mt-1">ویدیوهای اینستاگرامی فروشگاه «{store.name}» را مدیریت و محصولات را به آن‌ها سنجاق کنید</p>
      </div>
      <StoreExplorerManager />
    </div>
  )
}
