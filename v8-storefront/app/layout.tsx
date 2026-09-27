import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "تاکسل — فروشگاه‌ساز مبتنی بر هوش مصنوعی",
  description: "فروشگاه‌های آنلاین ساخته‌شده با تاکسل",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* Must load before any other script — enables window.Bale.WebApp when opened
            inside the Bale app as a mini app (see lib/payments/balepay.ts). No-op
            in a normal browser. */}
        <script src="https://tapi.bale.ai/miniapp.js?3" />
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" />
      </head>
      <body className="font-sans bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
