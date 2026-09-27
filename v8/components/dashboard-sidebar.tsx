"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MessageSquare, BarChart3, Ticket, PlusCircle, Settings, BookOpen, ExternalLink, LayoutDashboard, Store, Package, LayoutGrid, CreditCard,
  ClipboardList, Sparkles, Bot, Film, MessageSquareText, Globe, LineChart, Tags, Info, Phone, CircleDot, Search, Instagram, Rocket, CalendarDays, Pill, Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface NavLink {
  name: string
  href: string
  icon: any
  external?: boolean
  badge?: string
}

interface NavGroup {
  id: string
  name: string
  icon: any
  items: NavLink[]
  tour?: string
}

export interface SidebarProps {
  storeKind?: "shop" | "clinic" | "pharmacy" | null
  hasStore?: boolean
}

function buildGroups(kind: SidebarProps["storeKind"], hasStore: boolean): NavGroup[] {
  const storeItems: NavLink[] = hasStore
    ? [
        { name: "تنظیمات و برندینگ", href: "/dashboard/store/settings", icon: Palette },
        ...(kind === "clinic" ? [{ name: "مطب و نوبت‌ها", href: "/dashboard/store/clinic", icon: CalendarDays, badge: "جدید" }] : []),
        ...(kind === "pharmacy" ? [{ name: "داروخانه و نسخه‌ها", href: "/dashboard/store/pharmacy", icon: Pill, badge: "جدید" }] : []),
        { name: kind === "clinic" ? "خدمات و ویزیت‌ها" : "محصولات", href: "/dashboard/store/products", icon: Package },
        { name: "دسته‌بندی‌ها", href: "/dashboard/store/categories", icon: Tags },
        { name: "ویرایش صفحه اصلی", href: "/dashboard/store/landing", icon: LayoutGrid },
        { name: "درباره ما و تماس", href: "/dashboard/store/landing/about", icon: Info },
        { name: "درگاه پرداخت", href: "/dashboard/store/payments", icon: CreditCard },
        { name: "سئو", href: "/dashboard/store/seo", icon: Search, badge: "جدید" },
        { name: "پنل پیامکی", href: "/dashboard/store/sms-settings", icon: MessageSquareText },
        ...(kind === "shop" || !kind
          ? [
              { name: "اکسپلور (ریلز)", href: "/dashboard/store/explorer", icon: Film },
              { name: "استوری‌ها", href: "/dashboard/store/stories", icon: CircleDot },
            ]
          : []),
        { name: "آمار سایت", href: "/dashboard/store/analytics", icon: LineChart },
        { name: "پیش‌نمایش و انتشار", href: "/dashboard/store/publish", icon: Globe },
      ]
    : [{ name: "ساخت سایت / فروشگاه", href: "/dashboard/store/create", icon: PlusCircle, badge: "شروع" }]

  return [
    {
      id: "my-store",
      name: kind === "clinic" ? "مطب من" : kind === "pharmacy" ? "داروخانه من" : "فروشگاه من",
      icon: Store,
      tour: "nav-store",
      items: storeItems,
    },
    {
      id: "ai-chatbot",
      name: "چت‌بات هوش مصنوعی",
      icon: Bot,
      tour: "nav-chatbot",
      items: [
        { name: "چت‌بات‌های من", href: "/dashboard/chatbots", icon: MessageSquare },
        { name: "پیام‌ها", href: "/dashboard/messages", icon: MessageSquare },
        { name: "پایگاه دانش", href: "/dashboard/knowledge-base", icon: BookOpen },
        { name: "آمار و تحلیل", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "تیکت‌ها", href: "/dashboard/tickets", icon: Ticket },
      ],
    },
  ]
}

function isLinkActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href + "/") || pathname === href
}

function NavItem({ item, isActive, tour }: { item: NavLink; isActive: boolean; tour?: string }) {
  const cls = cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm",
    isActive ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-500/30" : "text-gray-700 hover:bg-gray-100",
  )
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
        <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </a>
    )
  }
  return (
    <Link href={item.href} className={cls} data-tour={tour}>
      <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
      <span className="truncate flex-1">{item.name}</span>
      {item.badge && <span className={cn("text-[10px] rounded-md px-1.5 py-0.5", isActive ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700")}>{item.badge}</span>}
    </Link>
  )
}

export default function DashboardSidebar({ storeKind = null, hasStore = false }: SidebarProps) {
  const pathname = usePathname()
  const groups = buildGroups(storeKind, hasStore)
  const activeGroupIds = groups.filter((g) => g.items.some((item) => isLinkActive(pathname, item.href))).map((g) => g.id)

  const topLinks: NavLink[] = [
    { name: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
    { name: "شروع سریع و آموزش", href: "/dashboard/getting-started", icon: Rocket },
  ]
  const middleLinks: Array<NavLink & { tour?: string }> = [
    { name: "سفارش‌ها", href: "/dashboard/orders", icon: ClipboardList },
    { name: "اتوماسیون اینستاگرام", href: "/dashboard/instagram", icon: Instagram, badge: "جدید", tour: "nav-instagram" },
    { name: "دستیار هوش مصنوعی", href: "/dashboard/ai-assistant", icon: Sparkles, tour: "nav-ai" },
    { name: "اتصال ربات بله", href: "/dashboard/bale-bot", icon: Bot },
  ]
  const bottomLinks: NavLink[] = [
    { name: "تنظیمات حساب", href: "/dashboard/settings", icon: Settings },
    { name: "مستندات و آموزش‌ها", href: "/dashboard/docs", icon: BookOpen },
    { name: "سایت تاکسل", href: "https://talksell.ir", icon: ExternalLink, external: true },
  ]

  return (
    <aside className="w-full md:w-64 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-2 rounded-2xl shadow-lg shadow-blue-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-gray-900 leading-tight">Taxel</h1>
            <p className="text-[10px] text-gray-500">سایت‌ساز هوشمند</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {topLinks.map((item) => (
          <NavItem key={item.name} item={item} isActive={isLinkActive(pathname, item.href)} />
        ))}

        <Accordion type="multiple" defaultValue={activeGroupIds.length ? activeGroupIds : ["my-store"]} className="border-none">
          {groups.map((group) => {
            const groupActive = group.items.some((item) => isLinkActive(pathname, item.href))
            return (
              <AccordionItem key={group.id} value={group.id} className="border-none">
                <AccordionTrigger data-tour={group.tour} className={cn("px-3 py-2.5 rounded-xl hover:no-underline hover:bg-gray-100 text-sm", groupActive ? "text-blue-700 font-bold" : "text-gray-700")}>
                  <span className="flex items-center gap-3 flex-1">
                    <group.icon className="h-[18px] w-[18px] flex-shrink-0" />
                    <span className="truncate">{group.name}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <div className="flex flex-col gap-0.5 pr-3 mt-1 border-r-2 border-gray-100 mr-4">
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
          <NavItem key={item.name} item={item} isActive={isLinkActive(pathname, item.href)} tour={item.tour} />
        ))}

        <div className="border-t border-gray-200 my-2" />

        {bottomLinks.map((item) => (
          <NavItem key={item.name} item={item} isActive={isLinkActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <Link href={hasStore ? "/dashboard/store/publish" : "/dashboard/store/create"}>
          <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 text-sm font-bold">
            {hasStore ? <Globe className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
            <span>{hasStore ? "مشاهده و انتشار سایت" : "ساخت سایت جدید"}</span>
          </button>
        </Link>
      </div>
    </aside>
  )
}
