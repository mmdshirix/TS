import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import AiAssistantPanel from "@/components/ai-assistant-panel"

export default async function AiAssistantPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">دستیار هوش مصنوعی</h1>
        <p className="text-gray-600 mt-1">دستیارهای تخصصی مبتنی بر DeepSeek برای رشد فروشگاه شما، بر اساس داده واقعی محصولات و سفارش‌ها</p>
      </div>
      <AiAssistantPanel />
    </div>
  )
}
