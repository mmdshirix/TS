"use client"

import { Bell, Search, UserIcon, LogOut, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"
import React from "react"
import ChatbotSwitcher from "@/components/chatbot-switcher"
import DashboardSidebar from "@/components/dashboard-sidebar"

export default function DashboardHeader({ user }: { user: User }) {
  const router = useRouter()
  const [trialActive, setTrialActive] = React.useState(user.is_trial_active)
  const [daysRemaining, setDaysRemaining] = React.useState(0)

  React.useEffect(() => {
    const calculateTrial = () => {
      const now = new Date()
      const trialEnd = new Date(user.trial_end_date)
      const isActive = user.is_trial_active && now < trialEnd
      setTrialActive(isActive)

      if (isActive) {
        const diffTime = trialEnd.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setDaysRemaining(Math.max(0, diffDays))
      }
    }

    calculateTrial()
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
      {/* Mobile Menu Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-[280px] bg-white">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      {/* Search - Hidden on mobile, shown on tablet+ */}
      <div className="hidden sm:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <Input type="search" placeholder="جستجو..." className="pr-10 h-9 sm:h-10 text-sm" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-1 sm:flex-initial justify-end">
        {/* Chatbot Switcher - Responsive */}
        <div className="hidden lg:block">
          <ChatbotSwitcher />
        </div>

        {/* Trial Badge - Hidden on small mobile */}
        {trialActive && (
          <Badge
            variant="outline"
            className="hidden sm:flex bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
          >
            <span className="hidden md:inline">{daysRemaining} روز از دوره آزمایشی باقی مانده</span>
            <span className="md:hidden">{daysRemaining} روز</span>
          </Badge>
        )}

        {/* Search Icon for Mobile */}
        <Button variant="ghost" size="icon" className="sm:hidden flex-shrink-0 h-9 w-9">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs sm:text-sm font-medium truncate max-w-[100px] md:max-w-none">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px]">{user.phone}</span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserIcon className="ml-2 h-4 w-4" />
              <span>پروفایل</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="ml-2 h-4 w-4" />
              <span>تنظیمات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="ml-2 h-4 w-4" />
              <span>خروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    // </CHANGE>
  )
}
