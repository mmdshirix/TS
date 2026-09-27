import type { Store } from "@/lib/db"
import { Instagram, Send, Phone, MapPin } from "lucide-react"

export default function StoreFooter({ store }: { store: Store }) {
  const instagram = store.social_links?.instagram
  const telegram = store.social_links?.telegram

  return (
    <footer className="border-t mt-10 py-10 bg-gray-50">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-600">
        <div className="text-center sm:text-right">
          <p className="font-bold text-gray-900">{store.name}</p>
          {store.contact_address && (
            <p className="flex items-center gap-1.5 justify-center sm:justify-start mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {store.contact_address}
            </p>
          )}
          {store.contact_phone && (
            <p className="flex items-center gap-1.5 justify-center sm:justify-start mt-1" dir="ltr">
              <Phone className="w-3.5 h-3.5" />
              {store.contact_phone}
            </p>
          )}
        </div>

        {(instagram || telegram) && (
          <div className="flex items-center gap-3">
            {instagram && (
              <a
                href={`https://instagram.com/${String(instagram).replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:border-brand hover:text-brand"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {telegram && (
              <a
                href={`https://t.me/${String(telegram).replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:border-brand hover:text-brand"
              >
                <Send className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">
        قدرت‌گرفته از{" "}
        <a href="https://talksell.ir" target="_blank" rel="noopener noreferrer" className="hover:text-brand">
          تاکسل
        </a>
      </p>
    </footer>
  )
}
