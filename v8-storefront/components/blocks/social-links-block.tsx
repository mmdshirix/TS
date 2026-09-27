import type { Store } from "@/lib/db"
import { Instagram, Send } from "lucide-react"

export default function SocialLinksBlock({ store, config }: { store: Store; config: { title?: string } }) {
  const instagram = store.social_links?.instagram
  const telegram = store.social_links?.telegram

  if (!instagram && !telegram) return null

  return (
    <section className="container py-10 text-center">
      {config.title && <h2 className="text-xl font-bold text-gray-900 mb-6">{config.title}</h2>}
      <div className="flex items-center justify-center gap-4">
        {instagram && (
          <a
            href={`https://instagram.com/${String(instagram).replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full border flex items-center justify-center text-gray-600 hover:border-brand hover:text-brand transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>
        )}
        {telegram && (
          <a
            href={`https://t.me/${String(telegram).replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full border flex items-center justify-center text-gray-600 hover:border-brand hover:text-brand transition-colors"
          >
            <Send className="w-5 h-5" />
          </a>
        )}
      </div>
    </section>
  )
}
