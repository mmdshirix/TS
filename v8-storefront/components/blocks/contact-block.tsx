"use client"

import { useState } from "react"
import type { Store } from "@/lib/db"
import { Phone } from "lucide-react"

interface ContactConfig {
  title?: string
  show_phone?: boolean
  show_form?: boolean
}

export default function ContactBlock({ store, config }: { store: Store; config: ContactConfig }) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="container py-10 max-w-xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{config.title || "تماس با ما"}</h2>

      {config.show_phone !== false && store.contact_phone && (
        <a
          href={`tel:${store.contact_phone}`}
          className="flex items-center justify-center gap-2 text-brand font-medium mb-6"
          dir="ltr"
        >
          <Phone className="w-4 h-4" />
          {store.contact_phone}
        </a>
      )}

      {config.show_form !== false &&
        (submitted ? (
          <p className="text-center text-sm text-green-600">پیام شما ثبت شد، به‌زودی با شما تماس می‌گیریم.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
            className="space-y-3"
          >
            <input
              type="text"
              required
              placeholder="نام شما"
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
            />
            <textarea
              required
              placeholder="پیام شما"
              rows={4}
              className="w-full rounded-xl border px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-brand"
            />
            <button type="submit" className="w-full bg-brand text-white rounded-xl py-2.5 text-sm font-medium">
              ارسال پیام
            </button>
          </form>
        ))}
    </section>
  )
}
