import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import MessagesAnalytics from "@/components/messages-analytics"

export default async function MessagesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <MessagesAnalytics userId={user.id} />
}
