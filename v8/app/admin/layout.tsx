"use client"

import type React from "react"

import { BarChart, LayoutDashboard, ListChecks, MessageSquare, Settings, User2, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Mobile Menu Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 py-4 px-3 flex flex-col transition-transform duration-300 transform ${
          open ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0 shadow-xl md:shadow-none`}
      >
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xl sm:text-2xl font-bold">
            پنل مدیریت
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col flex-grow space-y-1 overflow-y-auto">
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors text-sm sm:text-base ${
              pathname === "/admin" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            داشبورد
          </Link>

          <Link
            href="/admin/users"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors text-sm sm:text-base ${
              pathname === "/admin/users"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            }`}
          >
            <User2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            کاربران
          </Link>

          <Link
            href="/admin/products"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors text-sm sm:text-base ${
              pathname === "/admin/products"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            }`}
          >
            <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            محصولات
          </Link>

          <Link
            href="/admin/charts"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors text-sm sm:text-base ${
              pathname === "/admin/charts"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            }`}
          >
            <BarChart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            نمودارها
          </Link>

          <Link
            href="/admin/tickets"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors text-sm sm:text-base ${
              pathname === "/admin/tickets"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            }`}
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            تیکت‌های پشتیبانی
          </Link>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                pathname === "/admin/settings"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
              }`}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              تنظیمات
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="flex-shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">پنل مدیریت</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
    // </CHANGE>
  )
}
