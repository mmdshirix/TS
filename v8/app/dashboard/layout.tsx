import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
    // </CHANGE>
  )
}
