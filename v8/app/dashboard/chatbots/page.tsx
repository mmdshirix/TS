import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getUserChatbots } from "@/lib/user-db"
import ChatbotManagement from "@/components/chatbot-management"

export default async function ChatbotsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const chatbots = await getUserChatbots(user.id)

  return <ChatbotManagement chatbots={chatbots} userId={user.id} />
}
