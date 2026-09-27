import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import StoreCreateWizard from "@/components/store-create-wizard"

export default async function StoreCreatePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const existingStore = await getStoreByUserId(user.id)
  if (existingStore) {
    redirect("/dashboard/store/settings")
  }

  return <StoreCreateWizard />
}
