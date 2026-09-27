"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MessageSquare,
  BarChart3,
  Ticket,
  PlusCircle,
  Settings,
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  Store,
  Package,
  LayoutGrid,
  CreditCard,
  ClipboardList,
  Sparkles,
  Bot,
  Film,
  MessageSquareText,
  Globe,
  LineChart,
  Tags,
  Info,
  Phone,
  CircleDot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface NavLink {
  name: string
  href: string
  icon: any
  external?: boolean
}

interface NavGroup {
  id: string
  name: string
  icon: any
  items: NavLink[]
}

// Single top-level links (not nested inside a collapsible section)
const topLinks: NavLink[] = [{ name: "داشبورد", href: "/dashboard", icon: LayoutDashboard }]

const groups: NavGroup[] = [
  {
    id: "my-store",
    name: "فروشگاه من",
    icon: Store,
    items: [
      { name: "تنظیمات فروشگاه", href: "/dashboard/store/settings", icon: Settings },
      { name: "ساخت فروشگاه", href: "/dashboard/store/create", icon: PlusCircle },
      { name: "انتشار و پیش‌نمایش", href: "/dashboard/store/publish", icon: Globe },
      { name: "آمار فروشگاه", href: "/dashboard/store/analytics", icon: LineChart },
      { name: "ویرایش لندینگ", href: "/dashboard/store/landing", icon: LayoutGrid },
      { name: "ویرایش درباره ما", href: "/dashboard/store/landing/about", icon: Info },
      { name: "ویرایش تماس با ما", href: "/dashboard/store/landing/contact", icon: Phone },
      { name: "مدیریت محصولات", href: "/dashboard/store/products", icon: Package },
      { name: "مدیریت دسته‌بندی‌ها", href: "/dashboard/store/categories", icon: Tags },
      { name: "تنظیمات درگاه پرداخت", href: "/dashboard/store/payments", icon: CreditCard },
      { name: "پنل پیامکی", href: "/dashboard/store/sms-settings", icon: MessageSquareText },
      { name: "مدیریت اکسپلور", href: "/dashboard/store/explorer", icon: Film },
      { name: "مدیریت استوری‌ها", href: "/dashboard/store/stories", icon: CircleDot },
    ],
  },
  {
    id: "ai-chatbot",
    name: "چت‌بات هوش مصنوعی",
    icon: Bot,
    items: [
      { name: "چت‌بات‌های من", href: "/dashboard/chatbots", icon: MessageSquare },
      { name: "پیام‌ها", href: "/dashboard/messages", icon: MessageSquare },
      { name: "پایگاه دانش", href: "/dashboard/knowledge-base", icon: BookOpen },
      { name: "آمار و تحلیل", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "تیکت‌ها", href: "/dashboard/tickets", icon: Ticket },
    ],
  },
]

const middleLinks: NavLink[] = [
  { name: "سفارش‌ها", href: "/dashboard/orders", icon: ClipboardList },
  { name: "دستیار هوش مصنوعی", href: "/dashboard/ai-assistant", icon: Sparkles },
  { name: "اتصال ربات بله", href: "/dashboard/bale-bot", icon: Bot },
]

const bottomLinks: NavLink[] = [
  { name: "تنظیمات", href: "/dashboard/settings", icon: Settings },
  { name: "مستندات و آموزش‌ها", href: "/dashboard/docs", icon: BookOpen },
  {
    name: "پلتفرم تاک‌سل",
    href: "https://platform-talksell.ir/dashboard",
    icon: ExternalLink,
    external: true,
  },
]

function isLinkActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href + "/") || pathname === href
}

function NavItem({ item, isActive }: { item: NavLink; isActive: boolean }) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl transition-all text-sm sm:text-base text-gray-700 hover:bg-gray-100 hover:shadow-md active:bg-gray-200"
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </a>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl transition-all text-sm sm:text-base",
        isActive
          ? "bg-blue-600 text-white font-medium shadow-lg"
          : "text-gray-700 hover:bg-gray-100 hover:shadow-md active:bg-gray-200",
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">{item.name}</span>
    </Link>
  )
}

export default function DashboardSidebar() {
  const pathname = usePathname()

  const activeGroupIds = groups.filter((g) => g.items.some((item) => isLinkActive(pathname, item.href))).map((g) => g.id)

  return (
    <aside className="w-full md:w-64 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-2xl shadow-lg">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">TalkSell</h1>
            <p className="text-[10px] sm:text-xs text-gray-500">Powered by OrianAI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {topLinks.map((item) => (
          <NavItem key={item.name} item={item} isActive={isLinkActive(pathname, item.href)} />
        ))}

        <Accordion type="multiple" defaultValue={activeGroupIds} className="border-none">
          {groups.map((group) => {
            const groupActive = group.items.some((item) => isLinkActive(pathname, item.href))
            return (
              <AccordionItem key={group.id} value={group.id} className="border-none">
                <AccordionTrigger
                  className={cn(
                    "px-3 sm:px-4 py-3 rounded-2xl hover:no-underline hover:bg-gray-100 text-sm sm:text-base",
                    groupActive ? "text-blue-700 font-medium" : "text-gray-700",
                  )}
                >
                  <span className="flex items-center gap-3 flex-1">
                    <group.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{group.name}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <div className="flex flex-col gap-1 pr-4 mt-1">
                    {group.items.map((item) => (
                      <NavItem key={item.name} item={item} isActive={isLinkActive(pathname, item.href)} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        {middleLinks.map((item) => (
          <NavItem key={item.name} item={item} isActive={isLinkActive(pathname, item.href)} />
        ))}

        <div className="border-t border-gray-200 my-2" />

        {bottomLinks.map((item) => (
          <NavItem key={item.name} item={item} isActive={isLinkActive(pathname, item.href)} />
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <Link href="/dashboard/chatbots/new">
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white px-3 sm:px-4 py-3 sm:py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base">
            <PlusCircle className="h-5 w-5 flex-shrink-0" />
            <span>ساخت چت‌بات جدید</span>
          </button>
        </Link>
      </div>
    </aside>
  )
}
