import { requireSuperAdmin, getAllUsersWithStats } from "@/lib/super-admin"
import SuperAdminDashboard from "@/components/super-admin-dashboard"

export default async function SuperAdminPage() {
  await requireSuperAdmin()
  const users = await getAllUsersWithStats()

  return <SuperAdminDashboard users={users} />
}
