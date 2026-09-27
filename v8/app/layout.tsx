import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "پلتفرم چت‌بات",
  description: "پلتفرم مدیریت چت‌بات‌های هوشمند",
  generator: "v0.dev",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" rel="stylesheet" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="font-sans bg-background text-foreground">
        <main className="min-h-screen bg-background">{children}</main>
      </body>
    </html>
  )
}
