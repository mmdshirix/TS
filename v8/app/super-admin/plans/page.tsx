import { redirect } from "next/navigation"
import { verifySuperAdmin } from "@/lib/super-admin"
import SuperAdminPlansManager from "@/components/super-admin-plans-manager"

export default async function SuperAdminPlansPage() {
  const isAdmin = await verifySuperAdmin()
  if (!isAdmin) {
    redirect("/super-admin/login")
  }

  return <SuperAdminPlansManager />
}
