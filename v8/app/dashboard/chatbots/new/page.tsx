import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import NewChatbotForm from "@/components/new-chatbot-form"

export default async function NewChatbotPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <NewChatbotForm userId={user.id} />
}
