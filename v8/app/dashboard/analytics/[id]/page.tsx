import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getChatbot } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ChatbotAnalyticsPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const chatbotId = Number.parseInt(params.id)
  const chatbot = await getChatbot(chatbotId)

  if (!chatbot) {
    redirect("/dashboard/chatbots")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">آمار: {chatbot.name}</h1>
          <p className="text-gray-600 mt-1">تحلیل عملکرد چت‌بات</p>
        </div>
        <Link href={`/admin/${chatbotId}`}>
          <Button variant="outline">تنظیمات چت‌بات</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">آمار در حال بارگذاری</h3>
          <p className="text-gray-600">برای مشاهده آمار کامل به پنل مدیریت چت‌بات مراجعه کنید</p>
        </CardContent>
      </Card>
    </div>
  )
}
