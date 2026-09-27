import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { TicketManagement } from "@/components/ticket-management"

export default async function TicketsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <TicketManagement userId={user.id} />
}
