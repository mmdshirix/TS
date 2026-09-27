"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Fires a best-effort page-view event on every route change within a store.
// Mounted once in app/store/[slug]/layout.tsx so it covers every sub-page.
export default function StoreAnalyticsTracker({ slug }: { slug: string }) {
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, eventType: "page_view", path: pathname }),
      keepalive: true,
    }).catch(() => {
      // best-effort — never block the page on a tracking failure
    })
  }, [slug, pathname])

  return null
}
