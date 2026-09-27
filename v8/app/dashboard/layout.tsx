import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId } from "@/lib/store-db"
import { getStoreKind } from "@/lib/store-categories"
import { getOnboarding } from "@/lib/onboarding-db"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import OnboardingTour from "@/components/onboarding/tour"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const [store, onboarding] = await Promise.all([
    getStoreByUserId(user.id).catch(() => null),
    getOnboarding(user.id).catch(() => ({ tour_completed: true, completed_steps: [], dismissed_checklist: false, intent: null })),
  ])
  const storeKind = store ? getStoreKind(store.category) : null

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      <div className="hidden md:block">
        <DashboardSidebar storeKind={storeKind} hasStore={Boolean(store)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} storeKind={storeKind} hasStore={Boolean(store)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      <OnboardingTour initiallyCompleted={onboarding.tour_completed} />
    </div>
  )
}
