import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getUserChatbots } from "@/lib/user-db"
import KnowledgeBaseManager from "@/components/knowledge-base-manager"

export default async function KnowledgeBasePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const chatbots = await getUserChatbots(user.id)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">پایگاه دانش</h1>
            <p className="text-blue-100 mt-1">مدیریت دانش و اطلاعات چت‌بات‌های خود</p>
          </div>
        </div>
        <p className="text-blue-50 text-lg leading-relaxed">
          با افزودن محتوا به پایگاه دانش، چت‌بات شما می‌تواند پاسخ‌های دقیق‌تر و شخصی‌سازی‌شده‌تری ارائه دهد. می‌توانید لینک
          وب‌سایت‌ها، متن دلخواه، محصولات و سوالات متداول را به پایگاه دانش اضافه کنید.
        </p>
      </div>

      {chatbots.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">چت‌باتی وجود ندارد</h3>
          <p className="text-gray-600 mb-6">برای استفاده از پایگاه دانش، ابتدا یک چت‌بات ایجاد کنید</p>
          <a
            href="/dashboard/chatbots/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            ساخت چت‌بات جدید
          </a>
        </div>
      ) : (
        <KnowledgeBaseManager chatbots={chatbots} />
      )}
    </div>
  )
}
