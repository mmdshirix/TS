import { redirect } from "next/navigation"
import { verifySuperAdmin } from "@/lib/super-admin"
import SuperAdminAISettings from "@/components/super-admin-ai-settings"

export const dynamic = "force-dynamic"

export default async function SuperAdminAISettingsPage() {
  const isAdmin = await verifySuperAdmin()
  if (!isAdmin) {
    redirect("/super-admin/login")
  }

  return <SuperAdminAISettings />
}