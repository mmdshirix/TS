import Link from "next/link"
import type { Store } from "@/lib/db"
import type { ThemeDefinition } from "@/lib/themes"
import { Instagram, Send, Phone, MapPin, MessageCircle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StoreFooter({ store, theme }: { store: Store; theme: ThemeDefinition }) {
  const instagram = store.social_links?.instagram
  const telegram = store.social_links?.telegram
  const whatsapp = store.social_links?.whatsapp
  const dark = theme.surface === "dark"
  const year = new Date().toLocaleDateString("fa-IR-u-ca-persian", { year: "numeric" })

  const links =
    theme.kind === "clinic"
      ? [
          { href: "/book", label: "رزرو نوبت" },
          { href: "/shop", label: "خدمات" },
          { href: "/about", label: "درباره مطب" },
          { href: "/contact", label: "تماس" },
        ]
      : theme.kind === "pharmacy"
        ? [
            { href: "/shop", label: "محصولات" },
            { href: "/prescription", label: "ارسال نسخه" },
            { href: "/about", label: "درباره داروخانه" },
            { href: "/contact", label: "تماس" },
          ]
        : [
            { href: "/shop", label: theme.shopLabel },
            { href: "/explorer", label: "اکسپلور" },
            { href: "/about", label: "درباره ما" },
            { href: "/contact", label: "تماس با ما" },
          ]

  return (
    <footer className={cn("mt-16 border-t border-theme", dark ? "bg-black/40 text-white" : "bg-card text-ink")}>
      <div className="container py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            {store.logo_url ? <img src={store.logo_url} alt={store.name} className="w-11 h-11 rounded-brand object-cover" /> : <div className="w-11 h-11 rounded-brand brand-gradient" />}
            <div>
              <div className="font-black text-lg">{store.name}</div>
              {store.tagline && <div className={cn("text-xs", dark ? "text-white/60" : "text-muted")}>{store.tagline}</div>}
            </div>
          </div>
          {store.description && <p className={cn("mt-4 text-sm leading-7 max-w-md", dark ? "text-white/65" : "text-muted")}>{store.description}</p>}
          <div className="mt-5 flex items-center gap-2">
            {instagram && <a href={`https://instagram.com/${String(instagram).replace("@", "")}`} target="_blank" rel="noopener noreferrer" aria-label="اینستاگرام" className="w-10 h-10 rounded-full border border-theme grid place-items-center hover:border-brand hover:text-brand transition"><Instagram className="w-4 h-4" /></a>}
            {telegram && <a href={`https://t.me/${String(telegram).replace("@", "")}`} target="_blank" rel="noopener noreferrer" aria-label="تلگرام" className="w-10 h-10 rounded-full border border-theme grid place-items-center hover:border-brand hover:text-brand transition"><Send className="w-4 h-4" /></a>}
            {whatsapp && <a href={`https://wa.me/${String(whatsapp).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="واتساپ" className="w-10 h-10 rounded-full border border-theme grid place-items-center hover:border-brand hover:text-brand transition"><MessageCircle className="w-4 h-4" /></a>}
          </div>
        </div>

        <div>
          <div className="text-sm font-bold mb-4">دسترسی سریع</div>
          <ul className={cn("space-y-2.5 text-sm", dark ? "text-white/70" : "text-muted")}>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-sm font-bold mb-4">ارتباط با ما</div>
          <ul className={cn("space-y-3 text-sm", dark ? "text-white/70" : "text-muted")}>
            {store.contact_phone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand shrink-0" />
                <a href={`tel:${store.contact_phone}`} dir="ltr" className="hover:text-brand">{store.contact_phone}</a>
              </li>
            )}
            {store.contact_address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>{store.contact_address}</span>
              </li>
            )}
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
              <span>پرداخت امن با درگاه‌های معتبر</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={cn("border-t border-theme", dark ? "text-white/40" : "text-muted")}>
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>© {year} {store.name}. تمامی حقوق محفوظ است.</span>
          <span>
            ساخته‌شده با <a href={process.env.NEXT_PUBLIC_MARKETING_URL || "https://talksell.ir"} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-brand">Taxel</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
